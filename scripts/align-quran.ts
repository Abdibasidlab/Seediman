// Finds when each word of every lesson ayah starts in its recording.
// Run: npm run align-quran -- --only tawheed-3            prints the suggested times for that lesson
//      npm run align-quran -- --only tawheed-3 --write    also writes them into its data file
// --only is required with --write, so timings already checked by ear in other lessons are never overwritten.
// Needs ffmpeg on PATH and GEMINI_API_KEY in .env.local. Ayat are always complete, so there is no cut point to find.
//
// Method: Gemini listens and estimates each word's start; each boundary is then snapped to the deepest dip in
// loudness within ±0.3 s, because reverb-heavy recitation rarely has true silence between words.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { TAWHEED_1 } from '../src/data/tawheed1.ts';
import { TAWHEED_2 } from '../src/data/tawheed2.ts';
import { TAWHEED_3 } from '../src/data/tawheed3.ts';
import { TAWHEED_4 } from '../src/data/tawheed4.ts';
import { TAWHEED_5 } from '../src/data/tawheed5.ts';
import { TAWHEED_6 } from '../src/data/tawheed6.ts';

const LESSONS = [{ L: TAWHEED_1, file: 'src/data/tawheed1.ts' }, { L: TAWHEED_2, file: 'src/data/tawheed2.ts' }, { L: TAWHEED_3, file: 'src/data/tawheed3.ts' }, { L: TAWHEED_4, file: 'src/data/tawheed4.ts' }, { L: TAWHEED_5, file: 'src/data/tawheed5.ts' }, { L: TAWHEED_6, file: 'src/data/tawheed6.ts' }];
const WRITE = process.argv.includes('--write');
const ONLY = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
if (WRITE && !ONLY) { console.error('--write needs --only <lesson id>, e.g. --only tawheed-3'); process.exit(1); }
const ROOT = join(import.meta.dirname, '..');
const key = process.env.GEMINI_API_KEY ?? (existsSync('.env.local') ? /GEMINI_API_KEY=(.+)/.exec(readFileSync('.env.local', 'utf8'))?.[1]?.trim() : undefined);
if (!key) { console.error('GEMINI_API_KEY missing (set it in .env.local)'); process.exit(1); }

const RATE = 8000, HOP = 80, WIN = 240; // 10 ms hop, 30 ms window
function envelope(file: string) {
  const pcm = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(RATE), '-f', 's16le', '-'], { maxBuffer: 1 << 28 });
  const x = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length / 2);
  const env: number[] = [];
  for (let i = 0; i + WIN <= x.length; i += HOP) { let e = 0; for (let j = 0; j < WIN; j++) e += x[i + j] ** 2; env.push(10 * Math.log10(e / WIN / 32768 ** 2 + 1e-12)); }
  const sm = env.map((_, i) => { let a = 0, n = 0; for (let k = -3; k <= 3; k++) if (env[i + k] !== undefined) { a += env[i + k]; n++; } return a / n; });
  return { sm, t: (i: number) => (i * HOP + WIN / 2) / RATE, duration: x.length / RATE };
}

async function gemini(file: string, words: string[]) {
  const prompt = `This is a Quran recitation of one complete ayah: ${words.join(' ')}. ` +
    `It has ${words.length} words. Give the start time in seconds (to 0.01 s) of each word, in order. Reply with JSON only: {"starts":[0.00,...]}`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent', {
        method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': key! },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'audio/mpeg', data: readFileSync(file).toString('base64') } }, { text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0 } }),
      });
      if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const j = await res.json();
      const out = JSON.parse(j.candidates[0].content.parts[0].text) as { starts: number[] };
      if (out.starts.length !== words.length) throw new Error(`got ${out.starts.length} times for ${words.length} words`);
      return out;
    } catch (e) { if (attempt === 4) throw e; await new Promise(r => setTimeout(r, 3000 * attempt)); }
  }
  throw new Error('unreachable');
}

function snap(starts: number[], E: ReturnType<typeof envelope>) {
  const { sm, t } = E;
  const peak = Math.max(...sm);
  const dipNear = (target: number) => {
    let best: { ti: number; depth: number } | null = null;
    for (let i = 1; i < sm.length - 1; i++) {
      const ti = t(i); if (Math.abs(ti - target) > 0.3 || sm[i] > sm[i - 1] || sm[i] > sm[i + 1]) continue;
      const depth = Math.min(Math.max(...sm.slice(Math.max(0, i - 15), i)), Math.max(...sm.slice(i + 1, i + 16))) - sm[i];
      if (!best || depth > best.depth) best = { ti, depth };
    }
    return best && best.depth > 1.5 ? best : null;
  };
  const onset = t(sm.findIndex(v => v > peak - 20));
  const out = starts.map((s, k) => {
    if (k === 0) return { v: +onset.toFixed(2), how: 'onset' };
    const d = dipNear(s);
    return d ? { v: +d.ti.toFixed(2), how: `dip ${d.depth.toFixed(1)} dB (gemini ${s.toFixed(2)})` } : { v: +s.toFixed(2), how: 'gemini, no clear dip' };
  });
  // keep times strictly increasing (a snap can't jump a word past its neighbour)
  for (let k = 1; k < out.length; k++) if (out[k].v <= out[k - 1].v) out[k] = { v: +(out[k - 1].v + 0.12).toFixed(2), how: 'nudged after previous word' };
  return out;
}

for (const { L, file } of LESSONS) {
  if (ONLY && L.id !== ONLY) continue;
  let src = readFileSync(join(ROOT, file), 'utf8');
  for (const p of L.pillars) {
    const ev = p.evidence;
    if (!ev?.audio) continue;
    const audio = join(ROOT, 'public', ev.audio);
    if (!existsSync(audio)) { console.log(`\n${ev.ref}: ${ev.audio} not found`); continue; }
    const E = envelope(audio);
    const g = await gemini(audio, ev.words.map(w => w.ar));
    const s = snap(g.starts, E);
    console.log(`\n${L.id} · ${ev.ref} · ${ev.audio} (${E.duration.toFixed(2)} s, ${ev.words.length} words)`);
    ev.words.forEach((w, k) => console.log(`  ${w.ar.padEnd(14)} ${String(s[k].v).padStart(6)}   ${s[k].how}`));
    if (WRITE) {
      // rewrite the `words: [...]` block that follows this ayah's audio path
      const a = src.indexOf(`audio: '${ev.audio}'`), ws = src.indexOf('words: [', a), we = src.indexOf('],', ws);
      let k = 0;
      const block = src.slice(ws, we).replace(/\{ ar: ('[^']+'), en: ('[^']+')(, t: [\d.]+)? \}/g, (_, ar, en) => `{ ar: ${ar}, en: ${en}, t: ${s[k++].v} }`);
      if (k !== s.length) throw new Error(`${ev.ref}: matched ${k} words in ${file}, expected ${s.length}`);
      src = src.slice(0, ws) + block + src.slice(we);
    }
  }
  if (WRITE) { writeFileSync(join(ROOT, file), src); console.log(`\nwrote ${file}`); }
}
