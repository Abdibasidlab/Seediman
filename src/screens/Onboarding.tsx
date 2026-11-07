import { useEffect, useMemo } from 'react';
import { LEVELS, PAL, PLACEMENT, TOPICS } from '../data/topics';
import { narrate, stopAll } from '../lib/audio';
import { levelStart, type AppState } from '../lib/store';

const N = PLACEMENT.length;

const ORDER = ['ob0', 'ob1', 'ob2', 'ob3', 'ob4', 'ob5', 'ob6', 'ob7'] as const;
type Set = (p: Partial<AppState>) => void;

const H1 = ({ children }: { children: React.ReactNode }) => <span className="serif pretty" style={{ font: '500 30px/1.15 var(--serif)' }}>{children}</span>;
const Sub = ({ children }: { children: React.ReactNode }) => <span style={{ font: '15px/1.5 var(--ui)', color: 'var(--muted)', marginBottom: 6 }}>{children}</span>;
const Col = ({ children, gap = 14 }: { children: React.ReactNode; gap?: number }) => <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 24px 32px', gap, overflow: 'auto' }} className="noscroll">{children}</div>;

export function Onboarding({ s, set, onLogin }: { s: AppState; set: Set; onLogin: () => void }) {
  const obi = ORDER.indexOf(s.screen as typeof ORDER[number]);
  const valid: Record<string, boolean> = { ob1: !!s.role, ob2: !!(s.name.trim() && s.age), ob3: s.exp !== null, ob4: s.focus.length > 0 };
  const ok = valid[s.screen] ?? true;
  const next = () => { if (ok && obi < 7) set({ screen: ORDER[obi + 1] }); };
  const back = () => { if (obi > 0) set({ screen: ORDER[obi - 1], pq: 0, sc: 0, pMiss: null }); };
  const cta = <button className="btn" disabled={!ok} onClick={next}>Continue</button>;

  const computeLevel = (score: number | null) => {
    const pts = (s.exp ?? 1) + (score === null ? 1 : score >= 5 ? 2 : score >= 3 ? 1 : 0);
    const level = pts <= 1 ? 'Seed' : pts <= 3 ? 'Sprout' : 'Sapling';
    return { level, ...levelStart(level), pScore: score } as const;
  };
  // Tawheed starts at the first level whose question was missed; the levels before it count as done
  const place = (score: number | null, miss: number | null) => {
    const plan = computeLevel(score);
    const start = score === null ? 0 : miss ?? N - 1;
    const done = plan.done.slice(); done[0] = start;
    return { ...plan, done };
  };
  const pickPQ = (i: number) => {
    const right = PLACEMENT[s.pq].a === i;
    const sc = s.sc + (right ? 1 : 0), pMiss = s.pMiss ?? (right ? null : s.pq);
    if (s.pq < N - 1) set({ pq: s.pq + 1, sc, pMiss }); else { stopAll(); set({ screen: 'ob7', pq: 0, sc: 0, pMiss, ...place(sc, pMiss) }); }
  };
  // a fresh order of options for each question, and the question read aloud
  const opts = useMemo(() => PLACEMENT[s.pq].opts.map((o, k) => ({ ...o, k })).sort(() => Math.random() - 0.5), [s.pq, s.screen]);
  useEffect(() => {
    if (s.screen !== 'ob6') return;
    const t = setTimeout(() => narrate(PLACEMENT[s.pq].q, { lang: 'en' }), 600);
    return () => { clearTimeout(t); stopAll(); };
  }, [s.pq, s.screen]);

  return (
    <>
      {obi > 0 && obi < 7 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '6px 20px 0' }}>
          <button className="icon-btn" onClick={back} style={{ color: 'var(--ink)', fontSize: 26 }} aria-label="Back">‹</button>
          <div className="track" style={{ flex: 1 }}><div style={{ width: `${Math.round(obi / 7 * 100)}%` }} /></div>
          <span style={{ width: 44 }} />
        </div>
      )}

      {s.screen === 'ob0' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 28px 36px', gap: 22 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, textAlign: 'center' }}>
            <img src="seediman-mark.png" alt="" style={{ width: 150, mixBlendMode: 'multiply' }} />
            <img src="seediman-wordmark.png" alt="SeedIman" style={{ width: 200, mixBlendMode: 'multiply' }} />
            <span className="serif pretty" style={{ font: '400 22px/1.35 var(--serif)', maxWidth: 290 }}>Help your child grow in knowledge of Islam, one small seed a day.</span>
            <span style={{ font: '14px/1.5 var(--ui)', color: 'var(--muted)', maxWidth: 280 }}>Tawheed · Fiqh · Hadith · Arabic · Adab · Adhkar &amp; Dua</span>
          </div>
          <button className="btn" onClick={next}>Get started</button>
          <button className="link-btn" onClick={onLogin}>Log in</button>
          <span style={{ font: '12px/1.45 var(--ui)', color: 'var(--muted)', textAlign: 'center' }}>We count which lessons are opened so we can improve SeedIman. Your child’s name stays on this device.</span>
        </div>
      )}

      {s.screen === 'ob1' && (
        <Col>
          <H1>Who's setting up SeedIman?</H1><Sub>We'll tailor the parent view to you.</Sub>
          {([['parent', 'I’m a parent', 'Set up for my child and follow their progress'], ['teacher', 'I’m a teacher', 'Weekend school, madrasah or homeschool']] as const).map(([k, label, sub]) => (
            <button key={k} className={`optcard ${s.role === k ? 'on' : ''}`} onClick={() => set({ role: k })} style={{ flexDirection: 'column', gap: 4, padding: 18 }}>
              <span style={{ font: '700 17px var(--ui)' }}>{label}</span><span style={{ font: '14px/1.4 var(--ui)', color: 'var(--muted)' }}>{sub}</span>
            </button>
          ))}
          <span style={{ flex: 1 }} />{cta}
        </Col>
      )}

      {s.screen === 'ob2' && (
        <Col>
          <H1>Who's learning?</H1>
          <span style={{ font: '600 13px var(--ui)', color: 'var(--muted)', marginTop: 8 }}>Child's first name</span>
          <input value={s.name} onChange={e => set({ name: e.target.value })} placeholder="e.g. Maryam"
            style={{ height: 56, borderRadius: 16, border: '2px solid var(--line-3)', background: '#fff', padding: '0 18px', font: '600 18px var(--ui)', color: 'var(--ink)' }}
            onFocus={e => (e.target.style.borderColor = 'var(--leaf)')} onBlur={e => (e.target.style.borderColor = 'var(--line-3)')} />
          <span style={{ font: '600 13px var(--ui)', color: 'var(--muted)', marginTop: 10 }}>Age</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
            {[8, 9, 10, 11, 12].map(a => (
              <button key={a} className={`optcard ${s.age === a ? 'on' : ''}`} onClick={() => set({ age: a })} style={{ height: 52, justifyContent: 'center', alignItems: 'center', borderRadius: 14, font: '700 17px var(--ui)' }}>{a}</button>
            ))}
          </div>
          <span style={{ flex: 1 }} />{cta}
        </Col>
      )}

      {s.screen === 'ob3' && (
        <Col gap={12}>
          <H1>How much has {s.name || 'your child'} learned so far?</H1><Sub>No wrong answers — we'll fine-tune with a short check next.</Sub>
          {([['Just starting', 'New to most topics — we’ll begin with the foundations.', 'Seed', 'a'], ['Knows the basics', 'Prays, knows short surahs and a few duas.', 'Sprout', 'g'], ['Studies regularly', 'Attends weekend or Islamic school.', 'Sapling', 'd']] as const).map(([label, sub, badge, p], i) => (
            <button key={label} className={`optcard ${s.exp === i ? 'on' : ''}`} onClick={() => set({ exp: i })} style={{ gap: 14, alignItems: 'center', padding: 16 }}>
              <span style={{ width: 44, height: 44, flex: 'none', borderRadius: 14, background: PAL[p].tint, color: PAL[p].ink, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 13px var(--ui)' }}>{badge}</span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}><span style={{ font: '700 16px var(--ui)' }}>{label}</span><span style={{ font: '13px/1.4 var(--ui)', color: 'var(--muted)' }}>{sub}</span></span>
            </button>
          ))}
          <span style={{ flex: 1 }} />{cta}
        </Col>
      )}

      {s.screen === 'ob4' && (
        <Col gap={12}>
          <H1>What should {s.name || 'your child'} start with?</H1><Sub>Pick any. Every topic stays open to explore.</Sub>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {TOPICS.map(T => {
              const on = s.focus.includes(T.name), ink = PAL[T.p].ink;
              return (
                <button key={T.name} className={`optcard ${on ? 'on' : ''}`} onClick={() => set({ focus: on ? s.focus.filter(f => f !== T.name) : [...s.focus, T.name] })} style={{ flexDirection: 'column', gap: 10, padding: 16, minHeight: 100 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, border: `2px solid ${ink}`, background: on ? ink : '#fff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 14px var(--ui)' }}>{on ? '✓' : ''}</span>
                  <span style={{ font: '700 15px var(--ui)' }}>{T.name}</span>
                </button>
              );
            })}
          </div>
          <span style={{ flex: 1 }} />{cta}
        </Col>
      )}

      {s.screen === 'ob5' && (
        <Col gap={12}>
          <H1>Set a gentle daily goal</H1><Sub>Small and steady beats long and rare. You can change it anytime.</Sub>
          {([[5, 'A little each day'], [10, 'Steady'], [15, 'Focused'], [20, 'Dedicated']] as const).map(([g, sub]) => (
            <button key={g} className={`optcard ${s.goal === g ? 'on' : ''}`} onClick={() => set({ goal: g })} style={{ justifyContent: 'space-between', alignItems: 'center', padding: 18 }}>
              <span style={{ font: '700 17px var(--ui)' }}>{g} min</span><span style={{ font: '600 14px var(--ui)', color: 'var(--muted)' }}>{sub}</span>
            </button>
          ))}
          <span style={{ flex: 1 }} />{cta}
        </Col>
      )}

      {s.screen === 'ob6' && (
        <Col gap={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 16, background: 'var(--sand)' }}>
            <img src="seediman-mark.png" alt="" style={{ width: 34, mixBlendMode: 'multiply' }} />
            <span style={{ font: '600 14px/1.4 var(--ui)', color: 'var(--sand-ink)' }}>Now hand the phone to {s.name || 'your child'} for a short check: {N} questions, about 3 minutes.</span>
          </div>
          <span className="eyebrow" style={{ color: 'var(--muted-2)', marginTop: 10 }}>Quick check · {s.pq + 1} of {N} · Level {PLACEMENT[s.pq].level}</span>
          <span className="serif pretty" style={{ font: '500 26px/1.2 var(--serif)' }}>{PLACEMENT[s.pq].q}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
            {opts.map(o => (
              <button key={o.en} className="optcard" onClick={() => pickPQ(o.k)} style={{ minHeight: 58, padding: '12px 16px', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 2, borderRadius: 16, textAlign: 'left' }}>
                <span style={{ font: '700 15px/1.35 var(--ui)' }}>{o.en}</span>
                {o.ar && <span className="ar" style={{ font: '700 18px/1.6 var(--arabic)', color: 'var(--leaf)', alignSelf: 'flex-end' }}>{o.ar}</span>}
              </button>
            ))}
          </div>
          <span style={{ flex: 1 }} />
          <button className="link-btn" onClick={() => { stopAll(); set({ screen: 'ob7', pMiss: null, ...place(null, null) }); }}>Not sure? Skip the check</button>
        </Col>
      )}

      {s.screen === 'ob7' && (
        <Col gap={16}>
          <H1>{s.name || 'Your child'}'s plan is ready</H1>
          <div style={{ borderRadius: 24, background: 'var(--ink)', color: 'var(--paper)', padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>Starting level</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span className="serif" style={{ font: '500 40px/1 var(--serif)' }}>{s.level}</span>
              <span style={{ font: '14px var(--ui)', color: '#B9CCC2' }}>{({ Seed: 'starting from the foundations', Sprout: 'building on the basics', Sapling: 'ready for more depth', Tree: '' })[s.level]}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {LEVELS.map((l, i) => { const on = i <= LEVELS.indexOf(s.level); return (
                <div key={l} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ height: 6, borderRadius: 6, background: on ? 'var(--gold-light)' : 'rgba(255,255,255,.15)' }} />
                  <span style={{ font: '600 11px var(--ui)', color: on ? 'var(--gold-light)' : '#7F9C8E' }}>{l}</span>
                </div>); })}
            </div>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <Row l="Daily goal" r={`${s.goal} min a day`} />
            <Row l="Starting with" r={s.focus.join(', ')} />
            <Row l="Tawheed starts at" r={`Level ${s.done[0] + 1}: ${PLACEMENT[Math.min(s.done[0], N - 1)].title}`} />
            <Row l="Check result" r={s.pScore === null ? 'Skipped' : `${s.pScore} of ${N} correct`} last />
          </div>
          <span style={{ flex: 1 }} />
          <button className="btn" onClick={() => set({ screen: 'app', tab: 'home', onboarded: true, learnTopic: Math.max(0, TOPICS.findIndex(t => t.name === s.focus[0])) })}>Start learning</button>
        </Col>
      )}
    </>
  );
}

function Row({ l, r, last }: { l: string; r: string; last?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '16px 18px', borderBottom: last ? 0 : '1px solid #EEEAE0' }}>
      <span style={{ font: '14px var(--ui)', color: 'var(--muted)', flex: 'none' }}>{l}</span>
      <span style={{ font: '700 14px/1.4 var(--ui)', textAlign: 'right' }}>{r}</span>
    </div>
  );
}
