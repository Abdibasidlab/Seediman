import type { ImmersiveLesson } from './lessonTypes';
import { TAWHEED_LEVELS } from './lessons';

export type Step =
  | { t: 'read'; title: string; body: string[]; quote?: string; meaning?: string; ref?: string }
  | { t: 'mcq'; q: string; opts: string[]; a: number; why?: string }
  | { t: 'order'; q: string; items: string[] }
  | { t: 'match'; q: string; pairs: [string, string][] };

export type Lesson = { kind: 'steps'; title: string; steps: Step[] };

export type PalKey = 'd' | 'g' | 'a';
export const PAL: Record<PalKey, { tint: string; ink: string }> = {
  d: { tint: '#DCE6E1', ink: '#0E3B2E' },
  g: { tint: '#E3EFE8', ink: '#1F6B4C' },
  a: { tint: '#F3EBD8', ink: '#7A6232' },
};

export interface Topic {
  name: string;
  p: PalKey;
  /** titles of the lessons in this topic that are not yet authored */
  others: string[];
  /** a sample step lesson, placed wherever the child currently is in the path */
  lesson?: Lesson;
  /** immersive levels, always at the start of the path in order (Level 1, Level 2, …) */
  levels?: ImmersiveLesson[];
}

export const TOPICS: Topic[] = [
  {
    name: 'Tawheed', p: 'd', levels: TAWHEED_LEVELS,
    others: ['Allah is One', 'Worship Him alone', 'His Beautiful Names', 'The three categories', 'Understanding shirk', 'Review'],
  },
  {
    name: 'Fiqh', p: 'g',
    others: ['What is fiqh?', 'Purity (ṭahārah)', 'Types of water', 'What breaks wudu', 'Ghusl', 'Tayammum', 'The five prayers', 'Times of prayer', 'Review'],
    lesson: { kind: 'steps', title: 'How to make wudu', steps: [
      { t: 'read', title: 'Getting ready for salah', body: ['Wudu is the washing we do before we pray.', 'The Prophet ﷺ taught that no prayer is accepted without purification (Ṣaḥīḥ Muslim).', 'Begin with the intention in your heart and say “Bismillāh”.'] },
      { t: 'order', q: 'Put the steps of wudu in order', items: ['Wash hands', 'Rinse mouth & nose', 'Wash face', 'Wash arms to elbows', 'Wipe head & ears', 'Wash feet to ankles'] },
      { t: 'mcq', q: 'How many times is it sunnah to wash most parts?', opts: ['Only once', 'Up to three times', 'Seven times'], a: 1, why: 'Washing once is enough; the Prophet ﷺ often washed up to three times.' },
      { t: 'mcq', q: 'True or false: wiping the head is part of wudu.', opts: ['True', 'False'], a: 0, why: 'Allah mentions wiping the head in Surah al-Mā\'idah, verse 6.' },
    ] },
  },
  {
    name: 'Hadith', p: 'a',
    others: ['What is a hadith?', 'Who collected hadith?', 'A smile is charity', 'Love for your brother', 'Speak good or stay silent', 'Being merciful', 'Review'],
    lesson: { kind: 'steps', title: 'Actions are by intentions', steps: [
      { t: 'read', title: 'The hadith of intention', quote: 'Innamal-aʿmālu bin-niyyāt', meaning: 'Actions are only by intentions, and every person will have what they intended.', ref: 'Narrated by ʿUmar ibn al-Khaṭṭāb · al-Bukhārī & Muslim', body: ['Scholars often begin books of hadith with this one — it reminds us to check why we do things.'] },
      { t: 'mcq', q: 'What does “niyyah” mean?', opts: ['Intention', 'Prayer', 'Charity'], a: 0, why: 'Niyyah is the intention in your heart.' },
      { t: 'mcq', q: 'Who narrated this hadith?', opts: ['Abū Hurayrah', 'ʿUmar ibn al-Khaṭṭāb', 'ʿĀʾishah'], a: 1, why: 'It was narrated by ʿUmar ibn al-Khaṭṭāb, may Allah be pleased with him.' },
      { t: 'mcq', q: 'Helping at home to please Allah can earn reward.', opts: ['True', 'False'], a: 0, why: 'Everyday good actions become worship with a sincere intention.' },
    ] },
  },
  {
    name: 'Arabic Language', p: 'd',
    others: ['The alphabet', 'Letter shapes', 'Short vowels', 'Long vowels', 'Sun & moon letters', 'Numbers 1–10', 'Greetings', 'Colours', 'Family words', 'Simple sentences', 'Review'],
    lesson: { kind: 'steps', title: 'Everyday words', steps: [
      { t: 'read', title: 'Four words you see everywhere', body: ['kitāb — book', 'qalam — pen', 'bayt — house', 'madrasah — school'] },
      { t: 'match', q: 'Match the Arabic word to its meaning', pairs: [['kitāb', 'book'], ['qalam', 'pen'], ['bayt', 'house'], ['madrasah', 'school']] },
      { t: 'mcq', q: 'Which word means “pen”?', opts: ['bayt', 'qalam', 'kitāb'], a: 1, why: 'Qalam means pen — Surah al-Qalam is named after it.' },
      { t: 'mcq', q: '“Masjid” comes from sajada. What does sajada mean?', opts: ['To prostrate', 'To read', 'To walk'], a: 0, why: 'A masjid is literally a place of sujūd — prostration.' },
    ] },
  },
  {
    name: 'Adab', p: 'g',
    others: ['What is adab?', 'Respecting parents', 'Manners of eating', 'In the masjid', 'Review'],
    lesson: { kind: 'steps', title: 'Spreading salam', steps: [
      { t: 'read', title: 'Spread salam', quote: 'Afshus-salāma baynakum', meaning: 'Spread salam among yourselves.', ref: 'Part of a hadith in Ṣaḥīḥ Muslim', body: ['The Prophet ﷺ taught that spreading salam builds love between people.'] },
      { t: 'order', q: 'Put the full greeting in order', items: ['As-salāmu', 'ʿalaykum', 'wa raḥmatullāhi', 'wa barakātuh'] },
      { t: 'mcq', q: 'Who should give salam first?', opts: ['The one walking, to the one sitting', 'The one sitting, to the one walking', 'Only adults'], a: 0, why: 'In al-Bukhārī: the walker greets the one sitting, and the smaller group greets the larger.' },
      { t: 'mcq', q: 'Replying to salam is a duty when someone greets you.', opts: ['True', 'False'], a: 0, why: 'Allah tells us to reply with the same or better (an-Nisāʾ 4:86).' },
    ] },
  },
  {
    name: 'Adhkar & Dua', p: 'a',
    others: ['What is dhikr?', 'Waking up', 'Before eating', 'After eating', 'Entering the home', 'Leaving the home', 'Morning & evening', 'Review'],
    lesson: { kind: 'steps', title: 'Dua before sleeping', steps: [
      { t: 'read', title: 'Before you sleep', quote: 'Bismika Allāhumma amūtu wa aḥyā', meaning: 'In Your name, O Allah, I die and I live.', ref: 'Ṣaḥīḥ al-Bukhārī', body: ['Sleep is like a small death, so we end the day remembering Allah.'] },
      { t: 'order', q: 'Build the dua in order', items: ['Bismika', 'Allāhumma', 'amūtu', 'wa aḥyā'] },
      { t: 'mcq', q: 'What does “amūtu” mean?', opts: ['I die', 'I pray', 'I remember'], a: 0, why: 'Amūtu means “I die” — sleep is a minor death.' },
      { t: 'mcq', q: 'What do we say when we wake up?', opts: ['Alḥamdulillāh', 'Astaghfirullāh', 'Allāhu akbar'], a: 0, why: 'On waking we praise Allah who gave us life after “death”.' },
    ] },
  },
];

export const PQ = [
  { q: 'How many times a day do Muslims pray?', opts: ['3', '5', '7'], a: 1 },
  { q: 'What do we say before we eat?', opts: ['Alḥamdulillāh', 'Bismillāh', 'SubḥānAllāh'], a: 1 },
  { q: 'What does “Tawheed” mean?', opts: ['Believing Allah is One', 'Giving charity', 'Fasting'], a: 0 },
];

export const LEVELS = ['Seed', 'Sprout', 'Sapling', 'Tree'] as const;
export type Level = typeof LEVELS[number];

/** lessons already completed per topic at each starting level (Tawheed Level 1 is always the first lesson). */
export const START: Record<'Seed' | 'Sprout' | 'Sapling', number[]> = {
  Seed: [0, 0, 0, 0, 0, 0],
  Sprout: [0, 2, 1, 2, 1, 1],
  Sapling: [0, 3, 2, 4, 1, 1],
};

export const stageOf = (p: number): Level => (p >= 0.75 ? 'Tree' : p >= 0.4 ? 'Sapling' : p >= 0.15 ? 'Sprout' : 'Seed');
export const perm = (n: number, i: number) => (i * 5 + 2) % n;

// ---------- what lives where in a topic's path ----------
export type PathLesson = { kind: 'immersive'; lesson: ImmersiveLesson } | { kind: 'steps'; lesson: Lesson };

/** `at` is where a topic's sample step lesson sits (the child's position when they started) */
export function pathTitles(ti: number, at: number): string[] {
  const T = TOPICS[ti];
  if (T.levels) return [...T.levels.map(l => l.title), ...T.others];
  const t = T.others.slice(); t.splice(at, 0, T.lesson!.title); return t;
}

/** the authored lesson at path index `idx`, or null if that spot isn't written yet */
export function lessonAt(ti: number, idx: number, at: number): PathLesson | null {
  const T = TOPICS[ti];
  if (T.levels) return idx < T.levels.length ? { kind: 'immersive', lesson: T.levels[idx] } : null;
  return idx === at && T.lesson ? { kind: 'steps', lesson: T.lesson } : null;
}
