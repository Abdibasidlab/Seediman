// Prints a ready-to-paste `evidence` entry for complete ayat, so no Quran text or meaning is typed by hand.
// Run: npm run fetch-ayah -- 51:58 14:34
//   Arabic text:      alquran.cloud, edition "quran-simple" (imla'i script with full tashkeel)
//   Word meanings:    quran.com word-by-word English
//   Translation:      quran.com, Sahih International (resource 20)
//   Recitation:       downloads Mishary Alafasy from everyayah.com into public/audio/quran/SSSAAA.mp3
// Then run `npm run align-quran -- --write` to add each word's start time.
import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const keys = process.argv.slice(2);
if (!keys.length) { console.error('usage: npm run fetch-ayah -- 51:58 [14:34 …]'); process.exit(1); }
const get = async (u: string) => { const r = await fetch(u); if (!r.ok) throw new Error(`${r.status} ${u}`); return r.json(); };
const SURAH_EN: Record<number, string> = {};

for (const key of keys) {
  const [s, a] = key.split(':').map(Number);
  const text: string = (await get(`https://api.alquran.cloud/v1/ayah/${key}/quran-simple`)).data.text;
  const qc = (await get(`https://api.quran.com/api/v4/verses/by_key/${key}?words=true&translations=20&language=en`)).verse;
  if (!SURAH_EN[s]) SURAH_EN[s] = (await get(`https://api.quran.com/api/v4/chapters/${s}?language=en`)).chapter.name_simple;
  const arWords = text.split(/\s+/).filter(w => w && !/^[ۖ-ۭ]+$/.test(w)); // drop stand-alone pause marks (ۚ ۖ ۗ …)
  const glosses: string[] = qc.words.filter((w: { char_type_name: string }) => w.char_type_name === 'word').map((w: { translation: { text: string } }) => w.translation.text);
  if (arWords.length !== glosses.length) console.warn(`!! ${key}: ${arWords.length} Arabic words but ${glosses.length} meanings — check by hand`);
  const translation = qc.translations[0].text.replace(/<sup[^>]*>.*?<\/sup>/g, '').replace(/<[^>]+>/g, '').trim();

  const file = `${String(s).padStart(3, '0')}${String(a).padStart(3, '0')}`;
  const out = join(import.meta.dirname, '..', 'public', 'audio', 'quran', `${file}.mp3`);
  if (!existsSync(out)) {
    const r = await fetch(`https://everyayah.com/data/Alafasy_128kbps/${file}.mp3`);
    if (r.ok) writeFileSync(out, Buffer.from(await r.arrayBuffer())); else console.warn(`!! ${key}: recitation download failed (${r.status})`);
  }
  const esc = (x: string) => x.replace(/'/g, '’');
  console.log(`\n// ${key} — ${text}`);
  console.log(`evidence: {\n  audio: 'audio/quran/${file}.mp3',\n  words: [`);
  arWords.forEach((w, i) => console.log(`    { ar: '${w}', en: '${esc(glosses[i] ?? '?')}' },`));
  console.log(`  ],\n  en: '“${esc(translation)}”',\n  ref: 'Surah ${SURAH_EN[s]}, ${key}',\n},`);
}
