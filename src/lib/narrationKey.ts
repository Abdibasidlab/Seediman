// Shared by the app and scripts/gen-narration.ts: one audio file per (language, line of text).
export function narrationKey(lang: 'en' | 'ar', text: string): string {
  const s = `${lang}|${text.normalize('NFC').trim()}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return `${lang}-${(h >>> 0).toString(16).padStart(8, '0')}`;
}
