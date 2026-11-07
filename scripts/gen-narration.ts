// Generates the lesson narration with Gemini TTS into public/audio/narration/.
// Run: npm run narration   (reads GEMINI_API_KEY from .env.local; the key never ships to the browser)
// Re-running only generates lines that are new or changed.
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { ENCOURAGE, spokenLead, keyWords, cardLines, checkQuestions, introLines, lessonBeats, unquote } from '../src/data/lessonTypes.ts';
import { TAWHEED_1 } from '../src/data/tawheed1.ts';
import { TAWHEED_2 } from '../src/data/tawheed2.ts';
import { TAWHEED_3 } from '../src/data/tawheed3.ts';
import { TAWHEED_4 } from '../src/data/tawheed4.ts';
import { TAWHEED_5 } from '../src/data/tawheed5.ts';
import { TAWHEED_6 } from '../src/data/tawheed6.ts';
import { TAWHEED_7 } from '../src/data/tawheed7.ts';

const LESSONS = [TAWHEED_1, TAWHEED_2, TAWHEED_3, TAWHEED_4, TAWHEED_5, TAWHEED_6, TAWHEED_7]; // add new levels here too
import { narrationKey } from '../src/lib/narrationKey.ts';

const MODEL = 'gemini-3.1-flash-tts-preview';
// Same Kore voice on a second model, used only once the main model's daily quota runs out. Its lines are tagged in the
// manifest; `npm run narration -- --upgrade` later swaps them for main-model recordings so every line sounds the same.
const FALLBACK = 'gemini-2.5-pro-preview-tts';
const UPGRADE = process.argv.includes('--upgrade');
let model = MODEL;
const VOICE = 'Kore';
const OUT = join(import.meta.dirname, '..', 'public', 'audio', 'narration');
const MANIFEST = join(OUT, 'manifest.json');

const key = process.env.GEMINI_API_KEY ?? (existsSync('.env.local') ? /GEMINI_API_KEY=(.+)/.exec(readFileSync('.env.local', 'utf8'))?.[1]?.trim() : undefined);
if (!key) { console.error('GEMINI_API_KEY missing (set it in .env.local)'); process.exit(1); }

// Every line the lesson narrates, exactly as the app passes it to narrate().
const lines = new Map<string, { lang: 'en' | 'ar'; text: string }>();
const add = (lang: 'en' | 'ar', text: string) => lines.set(narrationKey(lang, text), { lang, text });
Object.values(ENCOURAGE).forEach(t => add('en', t));
const both = (ar: string | undefined, en: string | undefined) => { if (ar) add('ar', ar); if (en) add('en', en); };
for (const L of LESSONS) {
  L.presentation.opening?.forEach(t => add('en', t));
  if (L.presentation.closing) add('en', L.presentation.closing);
  for (const b of lessonBeats(L)) {
    if (b.k === 'say') b.lines.forEach(t => add('en', t));
    if (b.k === 'ask') { both(b.qAr, b.qEn); both(b.aAr, b.aEn); }
    if (b.k === 'state') { both(b.ar, b.en); if (b.sub) add('en', b.sub); }
    if (b.k === 'recite') add('en', unquote(b.evidence.en));
    if (b.k === 'list' && b.speak) b.items.forEach(t => add(b.speak!, t));
  }
  for (const p of L.pillars) {
    both(p.qAr, p.qEn); both(p.aAr, p.aEn);
    introLines(p).forEach(t => add('en', t));
    if (p.recall) { add('en', p.recall.prompt); if (p.recall.feedback) add('en', p.recall.feedback); }
    for (const l of cardLines(p)) { const lead = spokenLead(l); if (lead) add('en', lead); both(l.ar, l.en); l.chips?.forEach(c => both(c.ar, c.en)); }
    keyWords(p).forEach(w => both(w.ar, w.en));
    if (p.evidence?.text) add('ar', p.evidence.text); // a hadith, read by the narrator
    if (p.evidence) add('en', unquote(p.evidence.en)); // ayah translation, read after the recitation
  }
  for (const para of L.reading.paras) for (const part of para.parts) add('en', unquote('tap' in part ? part.tap : part.text).trim());
  for (const r of L.reading.remember ?? []) both(r.ar, r.en);
  for (const a of L.activities) {
    if (a.k === 'look') { add('en', a.intro); a.spots.forEach(s => add('en', s.said)); }
    if (a.k === 'listen') a.items?.forEach(it => add('ar', it.qAr));
    if (a.k === 'speak') a.items?.forEach(it => { both(it.promptAr, it.prompt); both(it.modelAr, it.modelEn); });
    if (a.k === 'order' && a.reveal) both(a.reveal.ar, a.reveal.en);
    if (a.k === 'scenes') a.items.forEach(it => add('en', it.scene));
    if (a.k === 'choose') a.items.forEach(it => add('en', it.q));
    if (a.k === 'lanterns') both(a.ar, a.en);
    if (a.k === 'match' && a.meanings) Object.values(a.meanings).forEach(t => add('en', t));
    if (a.k === 'sort') a.items.forEach(it => { both(it.ar, it.en); if (it.why) add('en', it.why); });
    if (a.k === 'moments') { add('en', a.intro); add('en', a.line); a.spots.forEach(s => { add('en', s.label); add('en', s.line); }); }
    if (a.k === 'blessings') { add('en', a.intro); add('en', a.line); add('ar', a.thank); [...a.spots, ...a.self].forEach(s => both(s.ar, s.label)); }
  }
  for (const q of checkQuestions(L)) add('en', q.qEn);
}

const STYLE = {
  en: 'Read this calmly and warmly, like a thoughtful teacher speaking to a ten-year-old. Unhurried and confident, never babyish or over-excited. Pronounce "Allah" and "Islam" in the Arabic way. Say only the text: ',
  ar: 'Read this Arabic slowly and clearly in classical Arabic with full vowels, as a calm teacher modelling it for a child learning to say it. Say only the text: ',
};
const speakable = (t: string) => t.replace(/Muhammad ﷺ/g, 'Muhammad, sallallahu alayhi wa sallam').replace(/\s*ﷺ/g, ' صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ');

function wav(pcm: Buffer, rate: number) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

async function tts(lang: 'en' | 'ar', text: string) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    // a dropped connection is retried like a busy server
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': key! },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: STYLE[lang] + speakable(text) }] }],
        generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } },
      }),
    }).catch(() => null);
    if (!res) { console.log(`  … ${model}: connection dropped, retrying`); await new Promise(r => setTimeout(r, 4000 * attempt)); continue; }
    if (res.ok) {
      const j = await res.json();
      const part = j.candidates?.[0]?.content?.parts?.find((p: { inlineData?: unknown }) => p.inlineData)?.inlineData;
      if (!part) throw new Error('no audio in response');
      const rate = Number(/rate=(\d+)/.exec(part.mimeType ?? '')?.[1] ?? 24000);
      const pcm = Buffer.from(part.data, 'base64');
      return { body: wav(pcm, rate), duration: pcm.length / 2 / rate };
    }
    const msg = await res.text();
    if (res.status === 429 && /per_day/.test(msg) && model === MODEL && !UPGRADE) { console.log(`! ${MODEL} daily quota used up; continuing with ${FALLBACK}`); model = FALLBACK; attempt--; continue; }
    if (res.status !== 429 && res.status < 500) throw new Error(`${res.status} ${msg.slice(0, 200)}`);
    console.log(`  … ${model}: ${res.status} ${msg.slice(0, 120).replace(/\s+/g, ' ')}`);
    await new Promise(r => setTimeout(r, 4000 * attempt));
  }
  throw new Error('gave up after retries');
}

mkdirSync(OUT, { recursive: true });
const manifest: Record<string, { file: string; duration: number; text: string; model?: string }> = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
// drop recordings of lines that no longer exist (e.g. after a spelling fix)
for (const k of Object.keys(manifest)) if (!lines.has(k)) {
  rmSync(join(OUT, manifest[k].file), { force: true });
  console.log(`– removed old: ${manifest[k].text.slice(0, 60)}`);
  delete manifest[k];
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
if (process.argv.includes('--missing')) { // list the lines still without a recording, then stop
  const miss = [...lines].filter(([k]) => !manifest[k]);
  miss.forEach(([, l]) => console.log(`${l.lang}  ${l.text}`)); console.log(`
${miss.length} of ${lines.size} lines have no recording.`); process.exit(0);
}
let made = 0, failed = 0;
for (const [k, { lang, text }] of lines) {
  if (manifest[k] && existsSync(join(OUT, manifest[k].file)) && !(UPGRADE && manifest[k].model && manifest[k].model !== MODEL)) continue;
  try {
    const { body, duration } = await tts(lang, text);
    writeFileSync(join(OUT, `${k}.wav`), body);
    manifest[k] = { file: `${k}.wav`, duration: +duration.toFixed(3), text, ...(model !== MODEL ? { model } : {}) };
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
    made++; console.log(`✓ ${lang} ${duration.toFixed(1)}s  ${text.slice(0, 60)}`);
  } catch (e) { failed++; console.error(`✗ ${lang} ${text.slice(0, 60)} — ${(e as Error).message}`); }
}
console.log(`\n${made} generated, ${failed} failed, ${Object.keys(manifest).length}/${lines.size} lines voiced.`);
