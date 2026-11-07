import { useEffect, useState } from 'react';
import { START, TOPICS, type Level } from '../data/topics';

export type Screen = 'ob0' | 'ob1' | 'ob2' | 'ob3' | 'ob4' | 'ob5' | 'ob6' | 'ob7' | 'app' | 'lesson' | 'tawheed' | 'done';
export type Tab = 'home' | 'learn' | 'progress' | 'parent';

export interface AppState {
  screen: Screen; tab: Tab;
  /** set once the parent finishes setup; from then on the app always opens on Home */
  onboarded: boolean;
  role: 'parent' | 'teacher' | null; name: string; age: number | null; exp: number | null;
  focus: string[]; goal: number; pq: number; sc: number; /** the first knowledge check question missed (its level is where Tawheed starts) */ pMiss: number | null; pScore: number | null; level: Level;
  done: number[]; at: number[]; fin: boolean[];
  streak: number; today: number; hist: number[]; acc: [number, number];
  learnTopic: number; lessonTi: number; tawheedPhase: number;
  /** which spot in the topic's path is open (for Tawheed: 0 = Level 1, 1 = Level 2, …) */
  lessonIdx: number;
  last: { ti: number; right: number; total: number; stars?: number } | null;
}

// a topic's sample step lesson sits where the child was when they started; immersive levels have fixed places
const atFor = (done: number[]) => done.map((d, i) => (TOPICS[i].levels ? 0 : d));

export function fresh(): AppState {
  const done = START.Sprout.slice();
  return { screen: 'ob0', tab: 'home', onboarded: false, role: null, name: '', age: null, exp: null, focus: ['Tawheed', 'Fiqh'], goal: 10, pq: 0, sc: 0, pMiss: null, pScore: null, level: 'Sprout',
    done, at: atFor(done), fin: TOPICS.map(() => false), streak: 0, today: 0, hist: [0, 0, 0, 0, 0, 0], acc: [0, 0],
    learnTopic: 0, lessonTi: 0, tawheedPhase: 0, lessonIdx: 0, last: null };
}

export function demo(): AppState {
  const done = START.Sapling.slice();
  return { ...fresh(), name: 'Yusuf', screen: 'app', onboarded: true, role: 'parent', age: 10, exp: 1, pScore: 3, level: 'Sapling', focus: ['Tawheed', 'Hadith', 'Adhkar & Dua'],
    done, at: atFor(done), streak: 12, hist: [12, 8, 15, 10, 6, 14], acc: [43, 50] };
}

export const levelStart = (level: 'Seed' | 'Sprout' | 'Sapling') => { const done = START[level].slice(); return { done, at: atFor(done) }; };

const KEY = 'seediman:v1';
function load(): AppState {
  // deep links for demos: #tawheed/0..4 (Level 1) or #tawheed2/0..4 (Level 2), #tawheed3/0..4 (Level 3), #tawheed4/0..4 (Level 4) opens a lesson phase,
  // #home, #learn, #progress, #parent, #onboarding
  const h = location.hash.slice(1);
  const m = /^tawheed(\d?)\/([0-4])$/.exec(h);
  if (m) {
    const idx = Math.max(1, +(m[1] || 1)) - 1, d = demo();
    d.done[0] = idx; // earlier levels count as finished
    return { ...d, screen: 'tawheed', lessonTi: 0, lessonIdx: idx, tawheedPhase: +m[2] };
  }
  if (h === 'onboarding') return fresh();
  if (['home', 'learn', 'progress', 'parent'].includes(h)) return { ...demo(), tab: h as Tab, learnTopic: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<AppState>;
      // saves from before the flag existed: anyone already past setup counts as onboarded
      const onboarded = saved.onboarded ?? !String(saved.screen ?? 'ob0').startsWith('ob');
      const s: AppState = { ...fresh(), ...saved, onboarded };
      const screen = openScreen(s);
      return screen === 'app' ? { ...s, screen, tab: 'home' } : s; // returning users always land on Home
    }
  } catch { /* storage unavailable */ }
  return fresh();
}

/** Once onboarded, the app never reopens on a setup screen (e.g. after an abandoned "Redo setup"). */
const openScreen = (s: AppState): Screen =>
  s.screen === 'lesson' || s.screen === 'tawheed' || s.screen === 'done' || (s.onboarded && s.screen.startsWith('ob')) ? 'app' : s.screen;

export function useAppState() {
  const [s, setS] = useState<AppState>(load);
  useEffect(() => {
    try {
      // never persist mid-lesson or re-setup screens; reopen on the app
      localStorage.setItem(KEY, JSON.stringify({ ...s, screen: openScreen(s) }));
    } catch { /* ignore */ }
  }, [s]);
  const set = (patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => setS(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  const replace = (n: AppState) => setS(n);
  return { s, set, replace };
}
