import { useState } from 'react';
import { PAL, TOPICS, perm, type Step } from '../data/topics';
import { sfx } from '../lib/audio';

interface LS { step: number; sel: number | null; checked: boolean; ok: boolean; placed: number[]; mSel: [number | null, number | null]; matched: number[]; wrong: [number, number] | null; miss: number; right: number; total: number }
const blank = (step: number, right = 0, total = 0): LS => ({ step, sel: null, checked: false, ok: false, placed: [], mSel: [null, null], matched: [], wrong: null, miss: 0, right, total });

export function StepLesson({ ti, onQuit, onFinish }: { ti: number; onQuit: () => void; onFinish: (right: number, total: number) => void }) {
  const T = TOPICS[ti];
  const steps = T.lesson?.steps ?? [];
  const [ls, setLs] = useState<LS>(blank(0));
  const st: Step = steps[ls.step], n = steps.length, ink = PAL[T.p].ink;
  const upd = (o: Partial<LS>) => setLs(p => ({ ...p, ...o }));
  const advance = () => { if (ls.step + 1 >= n) onFinish(ls.right, ls.total); else setLs(blank(ls.step + 1, ls.right, ls.total)); };
  const mark = (ok: boolean) => { ok ? sfx.correct() : sfx.retry(); upd({ checked: true, ok, right: ls.right + (ok ? 1 : 0), total: ls.total + 1 }); };

  let canCheck = false, correctText = '', body: React.ReactNode = null;
  if (st.t === 'read') {
    body = <>
      <span className="serif pretty" style={{ font: '500 28px/1.2 var(--serif)' }}>{st.title}</span>
      {st.quote && <div style={{ padding: 20, borderRadius: 20, background: 'var(--ink)', color: 'var(--paper)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ font: 'italic 400 21px/1.4 var(--serif)', color: 'var(--gold-pale)' }}>“{st.quote}”</span>
        <span style={{ font: '15px/1.5 var(--ui)', color: '#D8E6DE' }}>{st.meaning}</span>
        <span style={{ font: '600 12px var(--ui)', color: '#9FB8AB' }}>{st.ref}</span>
      </div>}
      {st.body.map(t => <div key={t} style={{ display: 'flex', gap: 12, padding: '14px 16px', borderRadius: 16, background: '#fff', border: '1px solid var(--line)' }}>
        <span style={{ width: 8, height: 8, marginTop: 7, flex: 'none', borderRadius: '50%', background: 'var(--gold)' }} /><span className="pretty" style={{ font: '15px/1.55 var(--ui)', color: 'var(--body)' }}>{t}</span></div>)}
    </>;
  } else if (st.t === 'mcq') {
    canCheck = ls.sel !== null; correctText = st.opts[st.a];
    body = <>
      <span className="serif pretty" style={{ font: '500 26px/1.25 var(--serif)' }}>{st.q}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        {st.opts.map((label, i) => {
          const chosen = ls.sel === i, right = ls.checked && i === st.a, wrong = ls.checked && chosen && i !== st.a;
          return <button key={label} onClick={() => !ls.checked && upd({ sel: i })} style={{ display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', minHeight: 58, padding: '12px 16px', borderRadius: 16, cursor: 'pointer', transition: 'all .15s', font: '700 16px var(--ui)', color: 'var(--ink)',
            border: `2px solid ${right ? 'var(--leaf)' : wrong ? 'var(--err)' : chosen ? 'var(--ink)' : 'var(--line-2)'}`, background: right ? 'var(--ok-bg)' : wrong ? 'var(--err-bg)' : chosen ? 'var(--sel-bg)' : '#fff' }}>
            <span style={{ width: 28, height: 28, flex: 'none', borderRadius: 9, border: '1.5px solid var(--line-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 12px var(--ui)', color: 'var(--muted-2)', background: '#fff' }}>{String.fromCharCode(65 + i)}</span>{label}</button>;
        })}
      </div>
    </>;
  } else if (st.t === 'order') {
    const k = st.items.length; canCheck = ls.placed.length === k; correctText = st.items.join(' → ');
    body = <>
      <span className="serif pretty" style={{ font: '500 26px/1.25 var(--serif)' }}>{st.q}</span>
      <div style={{ minHeight: 120, padding: 12, borderRadius: 18, border: `2px dashed ${ls.checked ? (ls.ok ? 'var(--leaf)' : 'var(--err)') : 'var(--line-3)'}`, background: '#fff', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ls.placed.map((ii, pos) => <button key={ii} onClick={() => !ls.checked && upd({ placed: ls.placed.filter(x => x !== ii) })} style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', minHeight: 46, padding: '8px 12px', borderRadius: 12, border: 0, cursor: 'pointer', font: '700 15px var(--ui)', color: 'var(--ink)', background: ls.checked ? (ii === pos ? 'var(--ok-bg)' : 'var(--err-bg)') : 'var(--sel-bg)' }}>
          <span style={{ width: 24, height: 24, flex: 'none', borderRadius: '50%', background: 'var(--leaf)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 12px var(--ui)' }}>{pos + 1}</span>{st.items[ii]}</button>)}
        {ls.placed.length === 0 && <span style={{ margin: 'auto', font: '14px var(--ui)', color: 'var(--muted-3)' }}>Tap the steps below in order</span>}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {Array.from({ length: k }, (_, j) => { const ii = st.items.findIndex((_, x) => perm(k, x) === j); const used = ls.placed.includes(ii);
          return <button key={ii} onClick={() => !used && !ls.checked && upd({ placed: [...ls.placed, ii] })} style={{ minHeight: 46, padding: '8px 14px', borderRadius: 12, borderStyle: 'solid', borderWidth: '2px 2px 4px', borderColor: 'var(--line-2)', background: '#fff', font: '700 15px var(--ui)', color: 'var(--ink)', cursor: 'pointer', visibility: used ? 'hidden' : 'visible' }}>{st.items[ii]}</button>; })}
      </div>
    </>;
  } else {
    const k = st.pairs.length, rOrder = st.pairs.map((_, i) => k - 1 - i);
    const tryPair = (l: number | null, r: number | null) => {
      if (l === null || r === null) return upd({ mSel: [l, r] });
      if (l === r) {
        const matched = [...ls.matched, l], all = matched.length === k; sfx.correct();
        upd({ mSel: [null, null], matched, ...(all ? { checked: true, ok: ls.miss === 0, right: ls.right + (ls.miss === 0 ? 1 : 0), total: ls.total + 1 } : {}) });
      } else { sfx.retry(); upd({ mSel: [null, null], wrong: [l, r], miss: ls.miss + 1 }); setTimeout(() => setLs(p => ({ ...p, wrong: null })), 600); }
    };
    const sty = (on: boolean, m: boolean, w: boolean): React.CSSProperties => ({ minHeight: 64, padding: 10, borderRadius: 14, borderStyle: 'solid', borderWidth: '2px 2px 4px', borderColor: w ? 'var(--err)' : m ? '#CFE0D6' : on ? 'var(--leaf)' : 'var(--line-2)', background: w ? 'var(--err-bg)' : m ? 'var(--sel-bg)' : on ? 'var(--ok-bg)' : '#fff', color: m ? '#9CC3AE' : 'var(--ink)', opacity: m ? .6 : 1, cursor: 'pointer', transition: 'all .15s' });
    body = <>
      <span className="serif pretty" style={{ font: '500 26px/1.25 var(--serif)' }}>{st.q}</span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{st.pairs.map((p, i) => <button key={i} className={ls.wrong?.[0] === i ? 'shake' : ''} onClick={() => !ls.matched.includes(i) && tryPair(i, ls.mSel[1])} style={{ ...sty(ls.mSel[0] === i, ls.matched.includes(i), ls.wrong?.[0] === i), font: '700 15px/1.3 var(--ui)' }}>{p[0]}</button>)}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{rOrder.map(i => <button key={i} className={ls.wrong?.[1] === i ? 'shake' : ''} onClick={() => !ls.matched.includes(i) && tryPair(ls.mSel[0], i)} style={{ ...sty(ls.mSel[1] === i, ls.matched.includes(i), ls.wrong?.[1] === i), font: '600 13px/1.3 var(--ui)' }}>{st.pairs[i][1]}</button>)}</div>
      </div>
    </>;
  }

  const check = () => { if (!canCheck) return; if (st.t === 'mcq') mark(ls.sel === st.a); if (st.t === 'order') mark(ls.placed.every((ii, pos) => ii === pos)); };
  const isRead = st.t === 'read';
  const btn = isRead ? 'Continue' : ls.checked ? (ls.step + 1 >= n ? 'Finish lesson' : 'Continue') : st.t === 'match' ? 'Match all pairs' : 'Check';
  const btnBg = isRead || ls.checked ? (ls.checked && !ls.ok ? 'var(--err)' : 'var(--leaf)') : canCheck ? 'var(--ink)' : 'var(--disabled)';
  const why = 'why' in st ? st.why : undefined;
  const fbTitle = ls.ok ? 'That’s right' : st.t === 'match' ? 'All matched — with a few retries' : 'Not quite';
  const fbText = st.t === 'match' ? (ls.ok ? 'Every pair on the first try.' : 'Take another look at the pairs you missed next time.') : ls.ok ? (why || 'Keep going.') : `Correct answer: ${correctText}. ${why || ''}`;
  const kind = { read: 'Learn', mcq: 'Question', order: 'Put in order', match: 'Match' }[st.t];
  const pct = Math.round((ls.step + (ls.checked || isRead ? 1 : 0)) / n * 100);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 20px 0' }}>
        <button className="icon-btn" onClick={onQuit} aria-label="Leave lesson">×</button>
        <div className="track" style={{ flex: 1, height: 10 }}><div style={{ width: `${pct}%` }} /></div>
        <span style={{ font: '700 13px var(--ui)', color: 'var(--muted-2)', width: 44, textAlign: 'right' }}>{ls.step + 1}/{n}</span>
      </div>
      <div className="noscroll" style={{ flex: 1, overflow: 'auto', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span className="eyebrow" style={{ color: ink }}>{T.name} · {kind}</span>
        {body}
      </div>
      <div style={{ flex: 'none', padding: '18px 24px 30px', background: ls.checked ? (ls.ok ? 'var(--ok-bg)' : 'var(--err-bg)') : 'var(--paper)', display: 'flex', flexDirection: 'column', gap: 12, transition: 'background .2s' }}>
        {ls.checked && <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ font: '800 18px var(--ui)', color: ls.ok ? 'var(--leaf)' : 'var(--err)' }}>{fbTitle}</span><span className="pretty" style={{ font: '14px/1.45 var(--ui)', color: 'var(--body)' }}>{fbText}</span></div>}
        <button onClick={isRead || ls.checked ? advance : check} style={{ height: 56, border: 0, borderRadius: 18, background: btnBg, color: '#fff', font: '700 17px var(--ui)', cursor: 'pointer' }}>{btn}</button>
      </div>
    </>
  );
}

export function Done({ name, title, topic, stage, toNext, pct, stats, onContinue }: { name: string; title: string; topic: string; stage: string; toNext: string; pct: string; stats: { v: string | number; l: string; c: string }[]; onContinue: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '30px 24px 32px', gap: 18 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
        <img src="seediman-mark.png" alt="" style={{ width: 120, mixBlendMode: 'multiply' }} />
        <span className="serif" style={{ font: '500 34px/1.1 var(--serif)' }}>Mā shā' Allāh, {name}!</span>
        <span style={{ font: '15px/1.5 var(--ui)', color: 'var(--muted)', maxWidth: 280 }}>You finished “{title}”.</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, width: '100%', marginTop: 8 }}>
          {stats.map(s => <div key={s.l} className="card" style={{ padding: '14px 8px', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ font: '800 22px var(--ui)', color: s.c }}>{s.v}</span><span style={{ font: '12px var(--ui)', color: 'var(--muted)' }}>{s.l}</span></div>)}
        </div>
        <div style={{ width: '100%', padding: 16, borderRadius: 18, background: 'var(--sand)', display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ font: '700 14px var(--ui)', color: 'var(--sand-ink)' }}>{topic} · {stage}</span><span style={{ font: '600 13px var(--ui)', color: 'var(--sand-ink)' }}>{toNext}</span></div>
          <div style={{ height: 8, borderRadius: 8, background: 'rgba(122,98,50,.18)' }}><div style={{ width: pct, height: '100%', borderRadius: 8, background: 'var(--gold)', transition: 'width .8s ease' }} /></div>
        </div>
      </div>
      <button className="btn" onClick={onContinue}>Continue</button>
    </div>
  );
}
