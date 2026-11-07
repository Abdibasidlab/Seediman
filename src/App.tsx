import { useEffect, useRef, useState } from 'react';
import { TOPICS, lessonAt } from './data/topics';
import { PHASES } from './data/lessonTypes';
import { TAWHEED_LEVELS } from './data/lessons';
import { demo, fresh, useAppState, type AppState } from './lib/store';
import { stopAll } from './lib/audio';
import { authClient, loadProgress, mark, once, saveProgress, seen, setMember, track, type Member } from './lib/api';
import { AuthSheet, RateSheet } from './screens/Account';
import { Onboarding } from './screens/Onboarding';
import { AppTabs, topicView } from './screens/Tabs';
import { Done, StepLesson } from './screens/StepLesson';
import { ImmersiveLessonView } from './lesson/TawheedLesson';

export default function App() {
  const { s, set, replace } = useAppState();
  const [toast, setToast] = useState<string | null>(null);
  const [lessonKey, setLessonKey] = useState(0);
  const [phase, setPhase] = useState(0);
  const t = useRef(0);
  const [member, setMemberState] = useState<Member | null>(null);
  const [sheet, setSheet] = useState<'signup' | 'login' | 'rate' | null>(null);
  const signedIn = (m: Member | null) => { setMember(m); setMemberState(m); };

  // a parent who logs in picks up their saved progress; the child's name only ever lives on the device
  const restore = async () => {
    const saved = await loadProgress();
    if (saved?.onboarded) replace({ ...s, ...saved, screen: 'app', tab: 'home', name: s.name || 'your child' });
  };

  useEffect(() => {
    track({ event: 'open' });
    authClient?.getSession().then(r => { const u = r.data?.user; if (u) signedIn({ name: u.name, email: u.email }); }).catch(() => {});
  }, []);

  // once setup is finished, offer an account one time
  useEffect(() => {
    if (!s.onboarded) return;
    if (once('seediman:setup-tracked')) track({ event: 'setup_done', role: s.role, age: s.age });
    if (!member && authClient && once('seediman:account-offered')) setSheet('signup');
  }, [s.onboarded]);

  // keep a signed in parent's progress saved
  useEffect(() => {
    if (!member || !s.onboarded) return;
    const id = setTimeout(() => saveProgress(s), 1500);
    return () => clearTimeout(id);
  }, [member, s.done, s.fin, s.acc, s.today, s.streak, s.goal, s.level]);
  const flash = (m: string) => { setToast(m); clearTimeout(t.current); t.current = window.setTimeout(() => setToast(null), 2600); };

  /** open the lesson at spot `idx` of topic `ti`'s path */
  const openLesson = (ti: number, idx: number, startPhase = 0, base: AppState = s) => {
    const pl = lessonAt(ti, idx, base.at[ti]); if (!pl) return;
    stopAll(); setLessonKey(k => k + 1);
    if (pl.kind !== 'immersive') track({ event: 'lesson_open', topic: TOPICS[ti].name, role: base.role, age: base.age });
    replace({ ...base, screen: pl.kind === 'immersive' ? 'tawheed' : 'lesson', lessonTi: ti, lessonIdx: idx, tawheedPhase: startPhase });
  };
  const complete = (ti: number, idx: number, right: number, total: number, minutes: number): Partial<AppState> => {
    const done = s.done.slice(); done[ti] = Math.max(done[ti], idx + 1);
    const fin = s.fin.slice(); fin[ti] = true;
    return { done, fin, today: s.today + minutes, streak: s.today === 0 ? s.streak + 1 : s.streak, acc: [s.acc[0] + right, s.acc[1] + total], last: { ti, right, total } };
  };
  /** demo jump straight into a Tawheed level; earlier levels count as finished */
  const jumpLevel = (idx: number, ph: number) => {
    const base = s.screen.startsWith('ob') ? demo() : { ...s };
    base.done = base.done.slice(); base.done[0] = Math.max(base.done[0], idx);
    openLesson(0, idx, ph, base);
  };

  const jumps: [string, () => void][] = [
    // previewing setup keeps the onboarded flag, so a reload still returns to Home
    ['Onboarding', () => replace({ ...fresh(), onboarded: s.onboarded })],
    ['Placement check', () => replace({ ...fresh(), onboarded: s.onboarded, exp: 1, age: 10, role: 'parent', screen: 'ob6' })],
    ['Home (demo account)', () => replace(demo())],
    ['Progress', () => replace({ ...demo(), tab: 'progress' })],
    ['Parent view', () => replace({ ...demo(), tab: 'parent' })],
    ['Lesson: Fiqh (order steps)', () => { const d = demo(); openLesson(1, d.done[1], 0, d); }],
  ];
  const dark = s.screen === 'tawheed' && (phase === 0 || phase === 4);
  const pl = s.screen === 'tawheed' ? lessonAt(s.lessonTi, s.lessonIdx, s.at[s.lessonTi]) : null;

  let body: React.ReactNode;
  if (s.screen.startsWith('ob')) body = <Onboarding s={s} set={set} onLogin={() => setSheet('login')} />;
  else if (s.screen === 'lesson') body = (
    <StepLesson key={lessonKey} ti={s.lessonTi} onQuit={() => set({ screen: 'app' })}
      onFinish={(right, total) => { track({ event: 'lesson_done', topic: TOPICS[s.lessonTi].name, role: s.role, age: s.age }); set({ screen: 'done', ...complete(s.lessonTi, s.lessonIdx, right, total, 4) }); }} />
  );
  else if (pl?.kind === 'immersive') body = (
    <ImmersiveLessonView key={lessonKey} lesson={pl.lesson} startPhase={s.tawheedPhase}
      onPhase={p => { setPhase(p); track({ event: 'phase', topic: pl.lesson.topic, level: pl.lesson.level, phase: PHASES[p], role: s.role, age: s.age }); }}
      onExit={() => { set({ screen: 'app', tab: 'learn', learnTopic: s.lessonTi }); if (!seen('seediman:rated') && once('seediman:rate-offered')) setSheet('rate'); }}
      onComplete={r => {
        set({ screen: 'app', tab: 'learn', learnTopic: s.lessonTi, ...complete(s.lessonTi, s.lessonIdx, r.right, r.total, pl.lesson.minutes) });
        flash(`${pl.lesson.topic} Level ${pl.lesson.level} complete. A new seed is planted in your garden.`);
        track({ event: 'level_done', topic: pl.lesson.topic, level: pl.lesson.level, stars: r.stars, role: s.role, age: s.age });
        if (!seen('seediman:rated') && once('seediman:rate-offered')) setSheet('rate');
      }} />
  );
  else if (s.screen === 'done' && s.last) {
    const tv = topicView(s)[s.last.ti];
    body = <Done name={s.name} title={TOPICS[s.last.ti].lesson?.title ?? ''} topic={tv.name} stage={tv.stage} toNext={tv.toNext} pct={tv.pct}
      stats={[{ v: `${s.last.right}/${s.last.total}`, l: 'correct', c: 'var(--leaf)' }, { v: '+4', l: 'minutes', c: 'var(--ink)' }, { v: s.streak, l: 'day streak', c: 'var(--gold)' }]}
      onContinue={() => set({ screen: 'app', tab: 'learn', learnTopic: s.last!.ti })} />;
  } else body = <AppTabs s={s} set={set} openLesson={(ti, idx) => openLesson(ti, idx)} flash={flash}
    account={{ member, rate: () => setSheet('rate'), signup: () => setSheet('signup'), logout: async () => { await authClient?.signOut().catch(() => {}); signedIn(null); flash('You are logged out.'); } }} />;

  return (
    <div className="stage">
      {import.meta.env.DEV && <aside className="side">
        <img src="seediman-wordmark.png" alt="SeedIman" style={{ width: 170, mixBlendMode: 'multiply' }} />
        <p>Parent onboarding with placement check, lessons, progress and parent view. Tawheed Levels 1–{TAWHEED_LEVELS.length} are full immersive lessons. Jump to:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {jumps.map(([label, go]) => <button key={label} className="jump" onClick={go}>{label}</button>)}
        </div>
        {TAWHEED_LEVELS.map((L, idx) => (
          <div key={L.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h4>Tawheed Level {L.level}</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PHASES.map((ph, i) => <button key={ph} className="jump" style={{ padding: '7px 10px', fontSize: 12 }} onClick={() => jumpLevel(idx, i)}>{i + 1}. {ph}</button>)}
            </div>
          </div>
        ))}
      </aside>}
      <div className="device">
        <div className={`statusbar ${s.screen === 'tawheed' ? 'overlay' : ''} ${dark ? 'light' : ''}`}>
          <span>9:41</span><span className="notch" /><span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>●●● ▮</span>
        </div>
        {body}
        {toast && <div className="toast">{toast}</div>}
        {(sheet === 'signup' || sheet === 'login') && <AuthSheet mode={sheet} onClose={() => setSheet(null)} onDone={m => { signedIn(m); setSheet(null); flash(`Welcome, ${m.name}.`); if (sheet === 'login') restore(); }} />}
        {sheet === 'rate' && <RateSheet member={member} role={s.role} onClose={() => setSheet(null)} onDone={() => mark('seediman:rated')} />}
      </div>
    </div>
  );
}
