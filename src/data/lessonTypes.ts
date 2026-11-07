// The shape of an immersive SeedIman lesson. Each level is one data file (tawheed1.ts, tawheed2.ts, …);
// the five phase screens in src/lesson/ render whichever lesson they are given.
//
// Guardrails for every lesson: nothing depicts Allah or the Prophet ﷺ (icons are abstract), people, if ever
// shown, are faceless, and Allah is never offered as one option among created things in a choice list.
// Every ayah is complete. Every sentence on screen is true; a question never has several true options with one accepted.

export type IconKind = 'orb' | 'crescent' | 'lantern' | 'sky' | 'sprout' | 'world' | 'senses';
/** a drawn icon, or a generated illustration (public/art/…, painted on white and blended into the card) */
export type CardIcon = IconKind | { img: string };

export type Shot = 'wide' | 'meal' | 'field' | 'rain' | 'cloud' | 'growth' | 'sky' | 'town' | 'house' | 'houseLow' | 'city';

/** How the dawn scene looks at a moment in the lesson. Omitted fields keep their previous value. */
export interface SceneCue {
  glow?: number;      // the light: 0 first light … 1 Level 1's settled glow … up to ~1.4 radiant
  settled?: boolean;  // hold the light steady instead of breathing
  lift?: number;      // 0 on the horizon … 1 well up in the sky
  land?: number;      // 0 silhouettes at dawn … 1 fully lit, green land
  wide?: boolean;     // camera pulls back to show more of the world
  tree?: 0 | 1 | 2;   // hero tree: hidden, present, full detail
  birds?: boolean;
  animal?: boolean;
  // Level 3
  shot?: Shot;        // where the camera looks (eases between shots)
  meal?: boolean;     // a cloth laid on the grass with bread, dates and a jug of water
  wheat?: boolean;    // a field of golden wheat
  rain?: boolean;     // a rain cloud and falling rain over the field
  rising?: 0 | 1 | 2 | 3; // small lights rising from the meal: none, a few, more, too many to count
  settleLights?: boolean; // the risen lights come to rest in the sky
  // Level 4
  /** time of day to hold: dawn (default), day, dusk or night */
  time?: 'dawn' | 'day' | 'dusk' | 'night';
  /** run time forward: a whole day and night back to dawn, or night sliding into day once */
  lapse?: 'none' | 'day' | 'night';
  growth?: boolean;   // a seed sprouts, an egg opens and a chick steps out, a wilted flower lifts
  storm?: boolean;    // a storm cloud passes over the great mountain
  city?: boolean;     // a distant city whose lights come on
  // Level 5
  town?: boolean;     // an ordinary neighbourhood of houses and a small mosque on the near hill
  worship?: number;   // small lights over the neighbourhood, one for each act of worship (0 … 30)
  windows?: number;   // how many of the neighbourhood's windows are lit (centre first; 99 = all)
  // Level 6
  house?: boolean;    // a house of five pillars in front of the neighbourhood
  pillars?: number;   // how many of its pillars have risen (0 … 5)
  pillarsLit?: number; // how many of them glow
  roof?: 0 | 1 | 2;   // no roof, the roof settled on top, the roof glowing
  parts?: number;     // three lines of light across the sky, for the three parts of Islam (0 … 3)
  messengers?: number; // a path of small lights across the horizon, one per messenger (0 … 5); no messenger is ever drawn
  // Level 7
  trail?: number;     // lights along the path toward the distant city (0 … 14)
  marks?: number;     // brighter markers along that path, one per Quick Check answer (0 … 3)
  trailFull?: boolean; // the whole path glows
}

/**
 * An ayah used as evidence. Always the COMPLETE ayah — every word listed, recited from start to end,
 * and a translation of the whole ayah. Never cut an ayah short. Text, word meanings and translation come from
 * `npm run fetch-ayah`; `t` (when each word starts) from `npm run align-quran`.
 */
export interface Evidence {
  audio?: string;
  /** a hadith: the whole Arabic text, read by the narrator (`words` is then empty) */
  text?: string;
  /** `t2`: when the reciter repeats a word or phrase, the time it is said again (it lights up again) */
  words: { ar: string; en: string; t?: number; t2?: number }[];
  /** the ayah in meaning units: word ranges (inclusive) with their English, which together make up `en` */
  chunks?: { from: number; to: number; en: string }[];
  en: string;
  ref: string;
}

/** a line on the back of a card, read aloud in turn: a book answer, a name of Allah, a dua to say, a promise */
export interface CardLine {
  lead?: string;      // short English lead-in shown (and read) before the line, e.g. "When rain falls we say:"
  qAr?: string;       // the book's question, shown small above
  ar?: string;
  en: string;
  kind?: 'line' | 'name' | 'turn' | 'promise';
  note?: string;      // shown under the line, not read
  /** small tappable cards under the line (Arabic with its meaning), each read aloud when tapped */
  chips?: { ar: string; en: string }[];
}

export interface Pillar {
  key: string;
  icon: CardIcon;
  /** the card's question; Arabic is optional (Level 3 opens some cards with a plain English question) */
  qAr?: string; qEn: string;
  /** the card's main answer, when it has one */
  aAr?: string; aEn?: string;
  /** Levels 1–2: narrator line(s) before this question in the Presentation */
  intro?: string | string[];
  cueQ?: SceneCue; cueA?: SceneCue;
  /**
   * Recall prompt before the next card. Without `options`, the child picks this card's answer from the lesson's answers.
   * With `options`, exactly one (`answer`) is correct. With `say`, the child answers aloud and taps when done.
   */
  recall?: { prompt: string; options?: string[]; answer?: number; instruction?: string; feedback?: string; say?: boolean };
  /** Level 2: extra question-and-answer pairs revealed on the card back, one after another */
  sequence?: { qAr: string; aAr: string; en: string }[];
  /** Level 3+: lines revealed on the card back, one after another */
  lines?: CardLine[];
  /** the ayah for this card; cards can share one by giving it only to the last card of the pair */
  evidence?: Evidence;
  /** evidence still to be supplied: a marked box shown in development only, never in production. Replace with `evidence`. */
  evidencePending?: string;
  /** Level 4: a wide scene shown on the card front */
  image?: string;
  /** a note for parents, closed by default and never read aloud */
  parentsNote?: string;
  /** Level 5: a key word shown first as a small chip (Arabic, transliteration, one line of meaning) */
  word?: KeyWord | KeyWord[];
}

/** a key word chip: the Arabic (optional), a simple transliteration or the English word, and one line of meaning */
export interface KeyWord { ar?: string; tr: string; en: string }

/** Presentation beats (Level 3+). Levels 1–2 derive theirs from the pillars. */
export type Beat =
  | { k: 'say'; lines: string[]; cue?: SceneCue; shots?: { cue: SceneCue; ms: number; caption?: string }[];
      /** show one line at a time instead of building them up, for lines too long to stack on a phone */
      solo?: boolean;
      /** light one more of the messengers' lights as each of these names is spoken in that line */
      lights?: { line: number; names: string[] } }
  | { k: 'ask'; qAr?: string; qEn: string; aAr?: string; aEn: string; cueQ?: SceneCue; cueA?: SceneCue }
  | { k: 'state'; ar?: string; en: string; cue?: SceneCue; /** one further line beneath, read after `en` */ sub?: string }
  /** the Quran itself: a complete ayah recited, its words lit, its meaning beneath each part */
  | { k: 'recite'; evidence: Evidence; cue?: SceneCue }
  /** words that appear quietly one at a time, each lighting a small light over the neighbourhood (Level 5) */
  | { k: 'list'; items: string[]; cue?: SceneCue; adds?: 'worship' | 'parts' | 'pillars'; speak?: 'en' | 'ar' };

/** `keep` saves the recording so a parent can play it back from the Parent view */
export interface SpeakItem { prompt: string; promptAr?: string; image?: string; modelAr?: string; modelEn?: string; keep?: boolean; /** longest recording, default 8 */ seconds?: number }
/** a tappable moment in a picture: its box as [x, y, w, h] in percent, and one line read when it is tapped */
export interface MomentSpot { id: string; label: string; line: string; box: [number, number, number, number]; /** Level 6: the pillar of the house this moment lights */ pillar?: number }
export interface BlessingSpot { id: string; label: string; ar?: string; box?: [number, number, number, number] }

export type Activity =
  | { k: 'match'; title: string; hint: string; pairs: [string, string][]; sample?: number; /** both sides Arabic */ arabic?: boolean; /** keyed by the left side: shown and read once that pair is matched */ meanings?: Record<string, string> }
  | { k: 'complete'; title: string; hint: string; items: { before: string; after: string; answer: string; choices: string[] }[] }
  | { k: 'arabic'; title: string; hint: string; pairs: [string, string][]; sample?: number }
  | { k: 'listen'; title: string; hint: string; items?: { qAr: string; aAr: string }[]; sample?: number; /** true sentences offered beside the answer, when the pool has too few of its own */ others?: string[] }
  | { k: 'build'; title: string; hint: string; sentences: string[][] }
  | { k: 'speak'; title: string; hint: string; items?: SpeakItem[] }
  | { k: 'look'; title: string; hint: string; intro: string; spots: LookSpot[] }
  // Level 3
  | { k: 'order'; title: string; hint: string; items: string[]; reveal?: { ar: string; en: string }; lights?: boolean; /** a pillar rises in a small house for each card placed; the roof settles at the end */ house?: boolean }
  | { k: 'wordbank'; title: string; hint: string; items: { before: string; after: string; answer: string }[]; /** the sentences and words are Arabic */ arabic?: boolean }
  | { k: 'blessings'; title: string; hint: string; intro: string; image: string; spots: BlessingSpot[]; self: BlessingSpot[]; after: number; line: string; thank: string }
  // Level 4
  /** the whole ayah is recited with one part lit; the child picks that part's meaning */
  | { k: 'ayahMeaning'; title: string; hint: string; items: { evidence: Evidence; chunk: number }[]; sample?: number }
  /** a short scene is read aloud; the child picks the true statement it shows */
  | { k: 'scenes'; title: string; hint: string; statements: string[]; items: { scene: string; answer: number }[]; sample?: number }
  /** the unit finale: sort statements into the three lanterns (Creates, Provides, Controls) */
  | { k: 'lanterns'; title: string; hint: string; names: [string, string, string]; cards: { text: string; lantern: 0 | 1 | 2 }[]; perLantern: number; ar: string; en: string }
  // Level 7
  /** a short question with its own options; exactly one (`answer`) is correct */
  | { k: 'choose'; title: string; hint: string; items: { q: string; options: string[]; answer: number }[] }
  // Level 5
  /** drag each card into one of two boxes; `why` is one sentence the child can open after a right drop */
  | { k: 'sort'; title: string; hint: string; bins: [string, string]; items: { ar?: string; en: string; bin: 0 | 1; why?: string }[]; sample?: number; whyLabel?: string }
  /** a calm exploration of one picture: each moment opens a close view and one line; no timer, score or ending */
  | { k: 'moments'; title: string; hint: string; intro: string; image: string; alt: string; spots: MomentSpot[]; line: string; house?: boolean; aspect?: number };

export type LookSpotId = 'sun' | 'cloud' | 'mountain' | 'sea' | 'tree' | 'bird' | 'flower';
export interface LookSpot { id: LookSpotId; label: string; said: string }

export interface ReadingPara { parts: ({ text: string } | { tap: string; note?: string })[] }

export interface ImmersiveLesson {
  id: string;
  level: number;
  topic: string;
  title: string;
  minutes: number;
  pillars: Pillar[];
  presentation: {
    predict: string;
    start: SceneCue;
    /** Level 3+: explicit beats. Otherwise opening → each pillar's intro/question/answer → closing. */
    beats?: Beat[];
    opening?: string[];
    closing?: string;
    /** Level 1 settles its answers on screen at the close; Level 2 lets the lit world speak instead */
    listAnswersAtClose?: boolean;
    close?: SceneCue;
  };
  /** `remember` lists the lines in the Remember box; otherwise each card's answer */
  reading: { title: string; paras: ReadingPara[]; remember?: { ar?: string; en: string }[] };
  activities: Activity[];
  quickCheck: {
    scene: SceneCue; final: SceneCue; badge: string; summary: string;
    summaryAr?: string[];
    /** Level 3+: its own questions; otherwise the pillars' questions and answers */
    questions?: { qEn: string; qAr?: string; aEn: string; aAr?: string }[];
    /** each correct answer releases a light from the meal (Level 3) */
    release?: boolean;
    /** each correct answer lights a lantern; the last joins them in one beam (Level 4) */
    lanterns?: boolean;
    /** each correct answer lights a window in the neighbourhood; the last spreads light across it (Level 5) */
    windows?: boolean;
    /** each correct answer lights pillars of the house; the last makes the roof glow (Level 6) */
    house?: boolean;
    /** each correct answer lights a marker along the path; the last makes the whole path glow (Level 7) */
    path?: boolean;
    /** the meaning of `summaryAr`, shown beneath it */
    summaryEn?: string;
  };
}

export const PHASES = ['Presentation', 'Learn', 'Reading', 'Practice', 'Quick Check'] as const;

/** Spoken on the star screen at the end of Practice — calm, not effusive. Keyed by stars earned. */
export const ENCOURAGE: Record<1 | 2 | 3, string> = {
  3: 'You know these answers well. Now let’s see if you can say them on your own.',
  2: 'You know most of these already. One more look, and they will be yours.',
  1: 'Every answer you practise makes it stronger. Take your time with the quick check.',
};

/** a lead is read aloud only when it is a sentence ("When rain falls we say:"); a label such as Look, Think or Because is shown, not read */
export const spokenLead = (l: CardLine) => (l.lead && /[.:?]$/.test(l.lead) ? l.lead : undefined);
export const introLines = (p: Pillar) => (p.intro === undefined ? [] : Array.isArray(p.intro) ? p.intro : [p.intro]);
/** a card's back lines, whichever way the lesson wrote them */
export const cardLines = (p: Pillar): CardLine[] => p.lines ?? p.sequence?.map(s => ({ qAr: s.qAr, ar: s.aAr, en: s.en })) ?? [];

/** the Presentation as a list of beats: explicit (Level 3+) or built from the pillars (Levels 1–2) */
export function lessonBeats(L: ImmersiveLesson): Beat[] {
  if (L.presentation.beats) return L.presentation.beats;
  return L.pillars.flatMap((p): Beat[] => [
    ...(p.intro ? [{ k: 'say' as const, lines: introLines(p) }] : []),
    { k: 'ask', qAr: p.qAr, qEn: p.qEn, aAr: p.aAr, aEn: p.aEn ?? '', cueQ: p.cueQ, cueA: p.cueA },
  ]);
}

/** the Quick Check's questions, whichever way the lesson wrote them */
export const checkQuestions = (L: ImmersiveLesson) =>
  L.quickCheck.questions ?? L.pillars.map(p => ({ qEn: p.qEn, qAr: p.qAr, aEn: p.aEn ?? '', aAr: p.aAr }));

/** Text as it is narrated: quotation marks are shown on screen but not read. */
export const unquote = (s: string) => s.replace(/[“”]/g, '');

// ---------- the optional “see the letters” breakdown, derived from the Arabic ----------
const LETTER_NAMES: Record<string, string> = {
  'ا': 'Alif', 'أ': 'Alif (hamzah)', 'إ': 'Alif (hamzah)', 'آ': 'Alif (maddah)', 'ٱ': 'Alif (waṣl)', 'ب': 'Bā', 'ت': 'Tā', 'ث': 'Thā',
  'ج': 'Jīm', 'ح': 'Ḥā', 'خ': 'Khā', 'د': 'Dāl', 'ذ': 'Dhāl', 'ر': 'Rā', 'ز': 'Zāy', 'س': 'Sīn', 'ش': 'Shīn', 'ص': 'Ṣād',
  'ض': 'Ḍād', 'ط': 'Ṭā', 'ظ': 'Ẓā', 'ع': 'ʿAyn', 'غ': 'Ghayn', 'ف': 'Fā', 'ق': 'Qāf', 'ك': 'Kāf', 'ل': 'Lām', 'م': 'Mīm',
  'ن': 'Nūn', 'ه': 'Hā', 'و': 'Wāw', 'ي': 'Yā', 'ى': 'Alif maqṣūrah', 'ة': 'Tā marbūṭah', 'ء': 'Hamzah', 'ؤ': 'Wāw (hamzah)', 'ئ': 'Yā (hamzah)',
};
export function lettersOf(ar: string): { word: string; letters: [string, string][] }[] {
  return ar.split(/\s+/).filter(w => w && w !== 'ﷺ').map(word => ({
    word,
    letters: [...word].filter(ch => LETTER_NAMES[ch]).map(ch => [ch, LETTER_NAMES[ch]] as [string, string]),
  }));
}

/** a card's key words, whether it gives one or several */
export const keyWords = (p: Pillar): KeyWord[] => (p.word ? (Array.isArray(p.word) ? p.word : [p.word]) : []);
