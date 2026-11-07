import type { Member } from '../lib/api';
import { LEVELS, PAL, TOPICS, lessonAt, pathTitles, stageOf } from '../data/topics';
import { useEffect, useState } from 'react';
import type { AppState, Tab } from '../lib/store';
import { listRecordings, type Recording } from '../lib/recordings';

const TABS: [Tab, string, string][] = [
  ['home', 'Home', 'M4 11l8-7 8 7v9h-5v-6H9v6H4z'],
  ['learn', 'Learn', 'M4 5h6a2 2 0 012 2v12a2 2 0 00-2-2H4zM20 5h-6a2 2 0 00-2 2v12a2 2 0 012-2h6z'],
  ['progress', 'Progress', 'M5 20V11M12 20V5M19 20v-7'],
  ['parent', 'Parent', 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c1-4 4.5-6 8-6s7 2 8 6'],
];

export function topicView(s: AppState) {
  return TOPICS.map((T, ti) => {
    const titles = pathTitles(ti, s.at[ti]);
    const done = s.done[ti], total = titles.length, p = done / total, stage = stageOf(p);
    const nextStage = LEVELS[LEVELS.indexOf(stage) + 1];
    const need = nextStage ? Math.ceil(({ Seed: 0, Sprout: .15, Sapling: .4, Tree: .75 })[nextStage] * total) - done : 0;
    return { ...PAL[T.p], ti, name: T.name, done, total, p, stage, pct: Math.round(p * 100) + '%',
      toNext: nextStage ? `${need} to ${nextStage}` : 'fully grown', titles, currentTitle: titles[Math.min(done, total - 1)] };
  });
}
type TV = ReturnType<typeof topicView>[number];

const Ring = ({ size, r, w, p, ink, track = '#EEEAE0', children }: { size: number; r: number; w: number; p: number; ink: string; track?: string; children?: React.ReactNode }) => {
  const C = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: 'none' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={w} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ink} strokeWidth={w} strokeLinecap="round" strokeDasharray={`${(C * p).toFixed(1)} ${C.toFixed(1)}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dasharray .6s ease' }} />
      {children}
    </svg>
  );
};

export interface Account { member: Member | null; rate: () => void; signup: () => void; logout: () => void }
interface Props { s: AppState; set: (p: Partial<AppState>) => void; openLesson: (ti: number, idx: number) => void; flash: (m: string) => void; account: Account }

export function AppTabs(props: Props) {
  const { s, set } = props;
  return (
    <>
      <div className="noscroll" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {s.tab === 'home' && <Home {...props} />}
        {s.tab === 'learn' && <Learn {...props} />}
        {s.tab === 'progress' && <Progress {...props} />}
        {s.tab === 'parent' && <Parent {...props} />}
      </div>
      <nav style={{ height: 84, flex: 'none', background: '#fff', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-around', paddingTop: 10 }}>
        {TABS.map(([k, name, d]) => { const c = s.tab === k ? 'var(--leaf)' : 'var(--muted-3)'; return (
          <button key={k} onClick={() => set({ tab: k })} aria-current={s.tab === k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 72, height: 52, border: 0, background: 'none', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
            <span style={{ font: '700 11px var(--ui)', color: c }}>{name}</span>
          </button>); })}
      </nav>
    </>
  );
}

/** the first focus topic (then any topic) whose next spot in the path has an authored lesson */
function nextLesson(s: AppState) {
  const order = s.focus.map(n => TOPICS.findIndex(t => t.name === n)).concat([0, 1, 2, 3, 4, 5]);
  const ti = order.find(t => t >= 0 && lessonAt(t, s.done[t], s.at[t]) && !(TOPICS[t].lesson && s.fin[t]));
  return ti === undefined ? undefined : { ti, idx: s.done[ti], pl: lessonAt(ti, s.done[ti], s.at[ti])! };
}

function Home({ s, set, openLesson, account }: Props) {
  const topics = topicView(s);
  const nx = nextLesson(s);
  const gp = Math.min(1, s.today / s.goal);
  return (
    <div style={{ padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="seediman-mark.png" alt="" style={{ width: 38, mixBlendMode: 'multiply' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ font: '500 13px var(--ui)', color: 'var(--muted)' }}>Assalamu alaykum,</span><span style={{ font: '700 20px var(--ui)' }}>{s.name}</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 999, background: 'var(--sand)', font: '700 14px var(--ui)', color: 'var(--sand-ink)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }} />{s.streak} day streak
        </div>
      </div>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16 }}>
        <Ring size={64} r={26} w={7} p={gp} ink="var(--leaf)"><text x="32" y="37" textAnchor="middle" style={{ font: '800 15px var(--ui)', fill: 'var(--ink)' }}>{s.today}</text></Ring>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ font: '700 16px var(--ui)' }}>{gp >= 1 ? 'Daily goal reached' : s.today > 0 ? 'Keep going — nearly there' : 'Today’s goal'}</span>
          <span style={{ font: '13px/1.4 var(--ui)', color: 'var(--muted)' }}>{s.today} of {s.goal} minutes today</span>
        </div>
      </div>
      {nx && (() => {
        const T = TOPICS[nx.ti], imm = nx.pl.kind === 'immersive';
        return (
          <div role="button" tabIndex={0} onClick={() => openLesson(nx.ti, nx.idx)} onKeyDown={e => e.key === 'Enter' && openLesson(nx.ti, nx.idx)}
            style={{ position: 'relative', overflow: 'hidden', background: 'var(--ink)', borderRadius: 24, padding: 22, color: 'var(--paper)', display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer' }}>
            {imm && <div aria-hidden style={{ position: 'absolute', right: -30, bottom: -40, width: 170, height: 170, borderRadius: '50%', background: 'radial-gradient(circle, rgba(246,225,170,.45) 0%, rgba(217,196,143,.12) 40%, rgba(217,196,143,0) 70%)' }} />}
            <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>Up next · {T.name}{nx.pl.kind === 'immersive' ? ` · Level ${nx.pl.lesson.level}` : ''}</span>
            <span className="serif pretty" style={{ font: '500 26px/1.15 var(--serif)' }}>{nx.pl.lesson.title}</span>
            <span style={{ font: '14px var(--ui)', color: '#C9D6CF' }}>{nx.pl.kind === 'immersive' ? `5 parts · about ${nx.pl.lesson.minutes} min` : `${nx.pl.lesson.steps.length} steps · about 4 min`}</span>
            <span style={{ alignSelf: 'flex-start', padding: '12px 20px', borderRadius: 999, background: 'var(--paper)', color: 'var(--ink)', font: '700 15px var(--ui)', position: 'relative' }}>Start lesson</span>
          </div>
        );
      })()}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ font: '700 18px var(--ui)' }}>Your garden</span>
        <button onClick={() => set({ tab: 'progress' })} style={{ border: 0, background: 'none', font: '700 13px var(--ui)', color: 'var(--leaf)', cursor: 'pointer' }}>Progress</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {topics.map(t => (
          <div key={t.name} role="button" tabIndex={0} onClick={() => set({ tab: 'learn', learnTopic: t.ti })} className="card" style={{ borderRadius: 18, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Ring size={36} r={14} w={4} p={t.p} ink={t.ink} />
              <span className="pill" style={{ background: t.tint, color: t.ink }}>{t.stage}</span>
            </div>
            <span style={{ font: '700 15px var(--ui)' }}>{t.name}</span>
            <span style={{ font: '12px var(--ui)', color: 'var(--muted)' }}>{t.done} of {t.total} lessons</span>
          </div>
        ))}
      </div>
      <button onClick={account.rate} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', cursor: 'pointer', textAlign: 'left', border: '1.5px solid var(--gold-light)', background: 'var(--sand)' }}>
        <span aria-hidden="true" style={{ font: '26px/1 var(--ui)', color: 'var(--gold)' }}>★</span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ font: '700 15px var(--ui)', color: 'var(--ink)' }}>Rate SeedIman</span>
          <span style={{ font: '13px/1.35 var(--ui)', color: 'var(--sand-ink)' }}>Parents and teachers, your feedback shapes what we build next.</span>
        </span>
      </button>
    </div>
  );
}

function Learn({ s, set, openLesson, flash }: Props) {
  const topics = topicView(s);
  const lt: TV = topics[s.learnTopic];
  const at = s.at[lt.ti];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0 24px' }}>
      <span className="serif" style={{ font: '500 30px var(--serif)', padding: '0 20px' }}>Learn</span>
      <div className="noscroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '8px 20px 12px' }}>
        {topics.map(t => { const on = t.ti === s.learnTopic; return (
          <button key={t.name} onClick={() => set({ learnTopic: t.ti })} style={{ flex: 'none', padding: '10px 15px', borderRadius: 999, border: `1.5px solid ${on ? 'var(--ink)' : 'var(--line-3)'}`, background: on ? 'var(--ink)' : '#fff', font: '700 13px var(--ui)', color: on ? 'var(--paper)' : 'var(--ink)', cursor: 'pointer' }}>{t.name}</button>); })}
      </div>
      <div style={{ margin: '0 20px', padding: 18, borderRadius: 20, background: lt.tint, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="eyebrow" style={{ color: lt.ink }}>{lt.stage} stage</span>
          <span className="serif" style={{ font: '500 24px var(--serif)' }}>{lt.name}</span>
          <span style={{ font: '13px var(--ui)', color: 'var(--body-2)' }}>{lt.done} of {lt.total} lessons · {lt.toNext}</span>
        </div>
        <Ring size={56} r={22} w={6} p={lt.p} ink={lt.ink} track="rgba(14,59,46,.12)" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '18px 20px 0' }}>
        {lt.titles.map((title, i) => {
          const isDone = i < lt.done, cur = i === lt.done, last = i === lt.titles.length - 1;
          const pl = lessonAt(lt.ti, i, at), authored = !!pl;
          const open = () => {
            if (authored && (cur || isDone)) openLesson(lt.ti, i);
            else if (cur) flash('This lesson is still being written. Try Tawheed or another topic.');
            else if (!isDone) flash('Finish the lessons before this one to unlock it.');
          };
          return (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 48, flex: 'none' }}>
                <div style={{ width: 2, height: 10, background: i === 0 ? 'transparent' : i <= lt.done ? lt.ink : 'var(--line-2)' }} />
                <button onClick={open} aria-label={title} style={{ width: 48, height: 48, flex: 'none', borderRadius: '50%', cursor: 'pointer', font: '800 15px var(--ui)',
                  border: isDone ? 0 : cur ? '3px solid var(--gold)' : '2px solid var(--line-2)', background: isDone ? lt.ink : cur ? 'var(--paper)' : '#F4F1E9',
                  color: isDone ? '#fff' : cur ? 'var(--sand-ink)' : '#B3BAB5', boxShadow: cur ? '0 0 0 6px rgba(168,137,76,.18)' : 'none' }}>{isDone ? '✓' : cur ? '▶' : i + 1}</button>
                <div style={{ width: 2, flex: 1, minHeight: 10, background: last ? 'transparent' : i < lt.done ? lt.ink : 'var(--line-2)' }} />
              </div>
              <div onClick={open} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3, padding: '10px 0', cursor: 'pointer' }}>
                <span style={{ font: '700 15px var(--ui)', color: i > lt.done ? 'var(--muted-3)' : 'var(--ink)' }}>{title}</span>
                <span style={{ font: '12px var(--ui)', color: 'var(--muted-2)' }}>{isDone ? (authored ? 'Completed · tap to review' : 'Completed') : cur ? (pl?.kind === 'immersive' ? `Up next · Level ${pl.lesson.level} · about ${pl.lesson.minutes} min` : 'Up next · about 4 min') : 'Locked'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Progress({ s, set }: Props) {
  const topics = topicView(s);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'], mx = Math.max(s.goal * 2, 20);
  const weekTotal = s.hist.reduce((a, b) => a + b, 0) + s.today;
  const accPct = s.acc[1] ? Math.round(s.acc[0] / s.acc[1] * 100) + '%' : '—';
  const stats = [{ v: s.streak, l: 'day streak', c: 'var(--gold)' }, { v: s.done.reduce((a, b) => a + b, 0), l: 'lessons done', c: 'var(--leaf)' }, { v: accPct, l: 'answers correct', c: 'var(--ink)' }];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 20px 24px' }}>
      <span className="serif" style={{ font: '500 30px var(--serif)' }}>Progress</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {stats.map(st => <div key={st.l} className="card" style={{ padding: 14, borderRadius: 18, display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ font: '800 24px var(--ui)', color: st.c }}>{st.v}</span><span style={{ font: '12px/1.3 var(--ui)', color: 'var(--muted)' }}>{st.l}</span></div>)}
      </div>
      <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><span style={{ font: '700 16px var(--ui)' }}>This week</span><span style={{ font: '13px var(--ui)', color: 'var(--muted)' }}>{weekTotal} min · goal {s.goal}/day</span></div>
        <div style={{ position: 'relative', height: 120, display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: `${Math.min(100, s.goal / mx * 100)}%`, borderTop: '1.5px dashed var(--gold)' }} />
          {days.map((_, i) => { const v = i === 6 ? s.today : s.hist[i]; return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
              <div style={{ height: `${Math.min(100, v / mx * 100)}%`, minHeight: 3, borderRadius: '8px 8px 3px 3px', background: v >= s.goal ? 'var(--leaf)' : v > 0 ? '#9CC3AE' : 'var(--track)', transition: 'height .5s ease' }} />
            </div>); })}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>{days.map((l, i) => <span key={i} style={{ flex: 1, textAlign: 'center', font: '700 11px var(--ui)', color: i === 6 ? 'var(--ink)' : 'var(--muted-3)' }}>{l}</span>)}</div>
      </div>
      <div className="card" style={{ padding: '6px 18px', display: 'flex', flexDirection: 'column' }}>
        {topics.map(t => (
          <div key={t.name} onClick={() => set({ tab: 'learn', learnTopic: t.ti })} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--line-soft)', cursor: 'pointer' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ font: '700 14px var(--ui)' }}>{t.name}</span><span style={{ font: '600 12px var(--ui)', color: 'var(--muted)' }}>{t.done}/{t.total}</span></div>
              <div style={{ display: 'flex', gap: 3 }}>{Array.from({ length: t.total }, (_, i) => <div key={i} style={{ flex: 1, height: 6, borderRadius: 4, background: i < t.done ? t.ink : 'var(--track)' }} />)}</div>
            </div>
            <span style={{ width: 62, textAlign: 'right', font: '700 12px var(--ui)', color: t.ink }}>{t.stage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Parent({ s, set, account }: Props) {
  const topics = topicView(s);
  const weekTotal = s.hist.reduce((a, b) => a + b, 0) + s.today;
  const days = s.hist.filter(v => v > 0).length + (s.today > 0 ? 1 : 0);
  const accPct = s.acc[1] ? Math.round(s.acc[0] / s.acc[1] * 100) + '%' : '—';
  const dn = s.name.trim() || 'your child';
  const summary = weekTotal > 0 ? `${dn} learned on ${days} of 7 days this week — ${weekTotal} minutes in total, with ${accPct} of answers correct.` : `${dn} is all set. Their first lesson is waiting on the Home tab.`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="serif" style={{ font: '500 30px var(--serif)' }}>{s.role === 'teacher' ? 'Teacher view' : 'Parent view'}</span>
      </div>
      <div style={{ padding: 20, borderRadius: 22, background: 'var(--ink)', color: 'var(--paper)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>{s.name} · age {s.age ?? '—'} · {s.level}</span>
        <span className="serif pretty" style={{ font: '400 20px/1.4 var(--serif)' }}>{summary}</span>
      </div>
      <span style={{ font: '700 16px var(--ui)', marginTop: 4 }}>Where {s.name} is</span>
      <div className="card" style={{ padding: '4px 18px' }}>
        {topics.map(t => (
          <div key={t.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--line-soft)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ font: '700 14px var(--ui)' }}>{t.name}</span><span style={{ font: '12px var(--ui)', color: 'var(--muted)' }}>Now: {t.currentTitle}</span></div>
            <span className="pill" style={{ background: t.tint, color: t.ink }}>{t.stage}</span>
          </div>
        ))}
      </div>
      <Reflections name={s.name} />
      <span style={{ font: '700 16px var(--ui)', marginTop: 4 }}>Settings</span>
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        {account.member
          ? <button onClick={account.logout} style={rowBtn}><span style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}><span style={{ font: '700 14px var(--ui)', color: 'var(--ink)' }}>{account.member.name}</span><span style={{ font: '12px var(--ui)', color: 'var(--muted)' }}>{account.member.email}</span></span><span style={{ font: '700 14px var(--ui)', color: 'var(--leaf)' }}>Log out</span></button>
          : <button onClick={account.signup} style={rowBtn}><span style={{ font: '14px var(--ui)', color: 'var(--ink)' }}>Save progress with an account</span><span style={{ font: '700 14px var(--ui)', color: 'var(--leaf)' }}>Create or log in</span></button>}
        <button onClick={account.rate} style={rowBtn}><span style={{ font: '14px var(--ui)', color: 'var(--ink)' }}>How are we doing?</span><span style={{ font: '700 14px var(--ui)', color: 'var(--leaf)' }}>Rate SeedIman</span></button>
        <button onClick={() => { const g = [5, 10, 15, 20]; set({ goal: g[(g.indexOf(s.goal) + 1) % 4] }); }} style={rowBtn}><span style={{ font: '14px var(--ui)' }}>Daily goal</span><span style={{ font: '700 14px var(--ui)', color: 'var(--leaf)' }}>{s.goal} min ›</span></button>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '16px 18px', borderBottom: '1px solid var(--line-soft)' }}><span style={{ font: '14px var(--ui)', flex: 'none' }}>Focus topics</span><span style={{ font: '700 14px/1.4 var(--ui)', color: 'var(--muted)', textAlign: 'right' }}>{s.focus.join(', ')}</span></div>
        <button onClick={() => set({ screen: 'ob0' })} style={{ ...rowBtn, borderBottom: 0 }}><span style={{ font: '14px var(--ui)' }}>Redo setup &amp; level check</span><span style={{ font: '700 14px var(--ui)', color: 'var(--leaf)' }}>›</span></button>
      </div>
    </div>
  );
}
const rowBtn: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', border: 0, borderBottom: '1px solid var(--line-soft)', background: 'none', cursor: 'pointer', minHeight: 52, color: 'var(--ink)' };

/** recordings the child made for the family in Speak activities, saved on this device only */
function Reflections({ name }: { name: string }) {
  const [recs, setRecs] = useState<Recording[]>([]);
  useEffect(() => { listRecordings().then(setRecs); }, []);
  if (!recs.length) return null;
  return (
    <>
      <span style={{ font: '700 16px var(--ui)', marginTop: 4 }}>Reflections from {name}</span>
      <div className="card" style={{ padding: '4px 18px' }}>
        {recs.slice(0, 6).map(r => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--line-soft)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="pretty" style={{ font: '700 14px/1.35 var(--ui)' }}>{r.prompt}</span>
              <span style={{ font: '12px var(--ui)', color: 'var(--muted)' }}>{r.lesson} · {new Date(r.at).toLocaleDateString()}</span>
            </div>
            <button onClick={() => new Audio(URL.createObjectURL(r.blob)).play()} style={{ flex: 'none', padding: '8px 14px', borderRadius: 999, border: '1.5px solid var(--line-3)', background: '#fff', cursor: 'pointer', font: '700 13px var(--ui)', color: 'var(--ink)' }}>Play</button>
          </div>
        ))}
      </div>
    </>
  );
}
