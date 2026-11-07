import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ENCOURAGE, type Activity, type ImmersiveLesson, type SpeakItem } from '../data/lessonTypes';
import { ListenBtn, SpeakerIcon, Words, useNarration } from '../components/ui';
import { burstOn, narrate, playClip, sfx, stopAll } from '../lib/audio';
import { LookAround } from './LookAround';
import { Blessings, Order, WordBank } from './PracticeMore';
import { AyahMeaning, Lanterns, Scenes } from './PracticeControl';
import { Moments, Sort } from './PracticeWorship';
import { saveRecording } from '../lib/recordings';

/** a fresh order every time an activity opens, so replays don't reward memorising positions */
const shuffled = <T,>(a: T[]) => a.map(x => [Math.random(), x] as const).sort((p, q) => p[0] - q[0]).map(([, x]) => x);
const chunk = <T,>(a: T[], n: number) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

/** how many first-try answers an activity can earn (speaking and exploring aren't scored) */
const scoreOf = (a: Activity, lesson: ImmersiveLesson) =>
  a.k === 'match' || a.k === 'arabic' ? Math.min(a.sample ?? Infinity, a.pairs.length) : a.k === 'complete' || a.k === 'wordbank' || a.k === 'order' || a.k === 'choose' || a.k === 'hear' ? a.items.length
    : a.k === 'build' ? a.sentences.length : a.k === 'listen' ? Math.min(a.sample ?? Infinity, listenItems(a, lesson).length)
    : a.k === 'ayahMeaning' || a.k === 'scenes' ? Math.min(a.sample ?? 3, a.items.length) : a.k === 'sort' ? Math.min(a.sample ?? Infinity, a.items.length) : 0;

/** Listen and Choose: the lesson's own question pool, or each card's question and answer */
const listenItems = (a: Extract<Activity, { k: 'listen' }>, lesson: ImmersiveLesson) =>
  a.items ?? lesson.pillars.filter(p => p.qAr && p.aAr).map(p => ({ qAr: p.qAr!, aAr: p.aAr! }));
/** Speak: the lesson's own prompts, or each card's question with its answer as the model */
const speakItems = (a: Extract<Activity, { k: 'speak' }>, lesson: ImmersiveLesson): SpeakItem[] =>
  a.items ?? lesson.pillars.filter(p => p.aEn).map(p => ({ prompt: p.qEn, modelEn: p.aEn }));

export function Practice({ lesson, onDone, onProgress }: { lesson: ImmersiveLesson; onDone: (stars: number) => void; onProgress: (f: number) => void }) {
  const acts = lesson.activities;
  // in dev, ?act=N opens straight on activity N (for checking one activity)
  const [act, setAct] = useState(() => (import.meta.env.DEV ? Number(new URLSearchParams(location.search).get('act')) || 0 : 0));
  const [ready, setReady] = useState(false);
  const [results, setResults] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const scored = acts.reduce((a, x) => a + scoreOf(x, lesson), 0);
  const right = Object.values(results).reduce((a, b) => a + b, 0);
  const stars = scored === 0 || right / scored >= 0.9 ? 3 : right / scored >= 0.65 ? 2 : 1;
  useEffect(() => { onProgress(act / acts.length); setReady(false); }, [act]);

  // one result per activity, so a repeated callback can never double-count
  const result = (firstTry: number) => { setResults(r => ({ ...r, [act]: Math.min(scoreOf(acts[act], lesson), firstTry) })); setReady(true); };
  const next = () => { if (act + 1 < acts.length) setAct(act + 1); else { setFinished(true); onProgress(1); sfx.complete(); } };
  // Speak is never scored, so skipping it costs nothing
  const skip = () => { stopAll(); result(0); next(); };

  if (finished) return <StarMoment stars={stars} right={right} scored={scored} onNext={() => onDone(stars)} />;
  const A = acts[act];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="noscroll" style={{ flex: 1, overflow: 'auto', padding: '14px 24px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="eyebrow" style={{ color: 'var(--ink)' }}>Practice · Activity {act + 1} of {acts.length}</span>
          <div style={{ display: 'flex', gap: 5 }}>{acts.map((_, i) => <span key={i} style={{ width: i === act ? 16 : 6, height: 6, borderRadius: 6, background: i <= act ? 'var(--leaf)' : 'var(--line-3)', transition: 'all .3s' }} />)}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="serif" style={{ font: '500 28px/1.2 var(--serif)' }}>{A.title}</span>
          <span style={{ font: '14px/1.45 var(--ui)', color: 'var(--muted)' }}>{A.hint}</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={act} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .3 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {A.k === 'match' && <MatchRounds pairs={A.pairs} sample={A.sample} onComplete={result} arabicLeft={A.arabic} arabicRight={A.arabic} meanings={A.meanings}
              leftFont={A.arabic ? '700 22px/1.5 var(--arabic)' : '700 15px/1.3 var(--ui)'} rightFont={A.arabic ? '700 22px/1.5 var(--arabic)' : '700 16px/1.3 var(--ui)'} />}
            {A.k === 'arabic' && <MatchRounds pairs={A.pairs} sample={A.sample} onComplete={result} arabicLeft leftFont="700 19px/1.45 var(--arabic)" rightFont="600 13px/1.3 var(--ui)" />}
            {A.k === 'complete' && <Complete items={A.items} onComplete={result} />}
            {A.k === 'listen' && <Listen items={listenItems(A, lesson)} sample={A.sample} others={A.others} onComplete={result} />}
            {A.k === 'choose' && <Choose items={A.items} onComplete={result} />}
            {A.k === 'hear' && <Hear items={A.items} onComplete={result} />}
            {A.k === 'build' && <Build sentences={A.sentences} onComplete={result} />}
            {A.k === 'speak' && <Speak items={speakItems(A, lesson)} lessonTitle={`${lesson.topic} Level ${lesson.level}`} onComplete={() => result(0)} />}
            {A.k === 'look' && <LookAround act={A} onComplete={() => result(0)} />}
            {A.k === 'order' && <Order act={A} onComplete={result} />}
            {A.k === 'wordbank' && <WordBank act={A} onComplete={result} />}
            {A.k === 'blessings' && <Blessings act={A} onComplete={() => result(0)} />}
            {A.k === 'ayahMeaning' && <AyahMeaning act={A} onComplete={result} />}
            {A.k === 'scenes' && <Scenes act={A} onComplete={result} />}
            {A.k === 'lanterns' && <Lanterns act={A} onComplete={() => result(0)} />}
            {A.k === 'sort' && <Sort key={act} act={A} onComplete={result} />}
            {A.k === 'moments' && <Moments act={A} onComplete={() => result(0)} />}
          </motion.div>
        </AnimatePresence>
      </div>
      <div style={{ flex: 'none', padding: '12px 24px 28px' }}>
        {!(A.k === 'speak' && !ready) && <button className="btn" disabled={!ready} onClick={next}>{act + 1 < acts.length ? 'Next activity' : 'Finish practice'}</button>}
        {A.k === 'speak' && !ready && <button className="link-btn" onClick={skip} style={{ width: '100%', marginTop: 8 }}>Skip</button>}
      </div>
    </div>
  );
}

/* ---------------- match & arabic: drag a line between pairs, in rounds of four ---------------- */
function MatchRounds({ pairs, sample, onComplete, arabicLeft, arabicRight, meanings, leftFont, rightFont }: { pairs: [string, string][]; sample?: number; onComplete: (n: number) => void; arabicLeft?: boolean; arabicRight?: boolean; meanings?: Record<string, string>; leftFont: string; rightFont: string }) {
  // after each match, that pair's meaning appears and is read
  const [shown, setShown] = useState<string[]>([]);
  const say = useNarration();
  const matched = (left: string) => { const m = meanings?.[left]; if (m) { setShown(s => [...s, m]); say.say(m, 'en'); } };
  // a fresh sample from the pool each session, in rounds of four
  const rounds = useMemo(() => chunk(shuffled(pairs).slice(0, sample ?? pairs.length), 4), [pairs]);
  const [r, setR] = useState(0);
  const total = useRef(0);
  const cur = rounds[r];
  const left = useMemo(() => cur.map(([a], i) => ({ id: String(i), node: <span className={arabicLeft ? 'ar' : ''} style={{ font: leftFont }}>{a}</span> })), [r]);
  const right = useMemo(() => shuffled(cur.map(([, b], i) => ({ id: String(i), node: <span className={arabicRight ? 'ar' : ''} style={{ font: rightFont }}>{b}</span> }))), [r]);
  return (
    <>
      {rounds.length > 1 && <span style={{ font: '700 12px var(--ui)', color: 'var(--muted-2)' }}>Round {r + 1} of {rounds.length}</span>}
      <LineMatch key={r} left={left} right={right} onMatch={id => matched(cur[+id][0])} onComplete={n => {
        total.current += n;
        if (r + 1 < rounds.length) setTimeout(() => setR(r + 1), 500); else onComplete(total.current);
      }} />
      {shown.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          {shown.map((m, k) => (
            <motion.div key={m} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '8px 14px', borderRadius: 12, background: 'var(--ok-bg)', font: '600 15px/1.4 var(--ui)', color: 'var(--leaf)', textAlign: 'center' }}>
              <Words text={m} active={k === shown.length - 1 ? say.en : -1} onLight />
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}

type Item = { id: string; node: ReactNode };
function LineMatch({ left, right, onComplete, onMatch }: { left: Item[]; right: Item[]; onComplete: (firstTry: number) => void; onMatch?: (id: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const els = useRef<Record<string, HTMLElement | null>>({});
  const [pts, setPts] = useState<Record<string, { x: number; y: number }>>({});
  const [matched, setMatched] = useState<string[]>([]);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [shake, setShake] = useState<string[]>([]);
  const miss = useRef(new Set<string>());
  const done = useRef<string[]>([]);

  const measure = () => {
    const b = box.current?.getBoundingClientRect(); if (!b) return;
    const out: Record<string, { x: number; y: number }> = {};
    for (const [k, el] of Object.entries(els.current)) {
      if (!el) continue; const rr = el.getBoundingClientRect();
      out[k] = { x: (k[0] === 'l' ? rr.right : rr.left) - b.left, y: rr.top + rr.height / 2 - b.top };
    }
    setPts(out);
  };
  useLayoutEffect(() => { measure(); const ro = new ResizeObserver(measure); ro.observe(box.current!); document.fonts?.ready.then(measure); return () => ro.disconnect(); }, []);

  const attempt = (lid: string, rid: string) => {
    setSel(null);
    if (lid === rid) {
      done.current = [...done.current, lid]; setMatched(done.current);
      sfx.correct(); burstOn(els.current['r:' + rid]); onMatch?.(lid);
      if (done.current.length === left.length) setTimeout(() => onComplete(left.length - miss.current.size), 400);
    } else {
      miss.current.add(lid); sfx.retry();
      setShake(['l:' + lid, 'r:' + rid]); setTimeout(() => setShake([]), 450);
    }
  };

  const down = (lid: string, e: React.PointerEvent) => {
    if (done.current.includes(lid)) return;
    measure();
    const b = box.current!.getBoundingClientRect(), sx = e.clientX, sy = e.clientY;
    const move = (ev: PointerEvent) => setDrag({ id: lid, x: ev.clientX - b.left, y: ev.clientY - b.top });
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move); setDrag(null);
      const moved = Math.hypot(ev.clientX - sx, ev.clientY - sy) > 10;
      const target = (document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null)?.closest('[data-rid]') as HTMLElement | null;
      if (moved && target) attempt(lid, target.dataset.rid!);
      else if (!moved) setSel(s => (s === lid ? null : lid));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
  };

  const tile = (on: boolean, m: boolean): React.CSSProperties => ({
    minHeight: 76, padding: '10px 12px', borderRadius: 16, borderStyle: 'solid', borderWidth: '2px 2px 4px', borderColor: m ? '#CFE0D6' : on ? 'var(--leaf)' : 'var(--line-2)',
    background: m ? 'var(--sel-bg)' : on ? 'var(--ok-bg)' : '#fff', color: m ? 'var(--leaf)' : 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', transition: 'background .2s, border-color .2s',
  });
  const origin = drag ? pts['l:' + drag.id] : null;

  return (
    <div ref={box} style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 40, rowGap: 12, marginTop: 6, userSelect: 'none' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {left.map(it => (
          <div key={it.id} ref={el => { els.current['l:' + it.id] = el; }} onPointerDown={e => down(it.id, e)} className={shake.includes('l:' + it.id) ? 'shake' : ''}
            style={{ ...tile(sel === it.id || drag?.id === it.id, matched.includes(it.id)), cursor: matched.includes(it.id) ? 'default' : 'grab', touchAction: 'none' }}>{it.node}</div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {right.map(it => (
          <div key={it.id} data-rid={it.id} ref={el => { els.current['r:' + it.id] = el; }} onClick={() => sel && !matched.includes(it.id) && attempt(sel, it.id)} className={shake.includes('r:' + it.id) ? 'shake' : ''}
            style={{ ...tile(false, matched.includes(it.id)), cursor: sel ? 'pointer' : 'default' }}>{it.node}</div>
        ))}
      </div>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
        {left.map(it => { const p = pts['l:' + it.id]; return p && <circle key={'d' + it.id} cx={p.x} cy={p.y} r={5} fill={matched.includes(it.id) ? 'var(--leaf)' : 'var(--gold)'} />; })}
        {right.map(it => { const p = pts['r:' + it.id]; return p && <circle key={'e' + it.id} cx={p.x} cy={p.y} r={5} fill={matched.includes(it.id) ? 'var(--leaf)' : 'var(--line-3)'} />; })}
        {matched.map(id => { const a = pts['l:' + id], b = pts['r:' + id]; return a && b && (
          <motion.line key={id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--leaf)" strokeWidth={3} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .3 }} />); })}
        {origin && drag && <line x1={origin.x} y1={origin.y} x2={drag.x} y2={drag.y} stroke="var(--gold)" strokeWidth={3} strokeLinecap="round" strokeDasharray="2 7" />}
      </svg>
    </div>
  );
}

/* ---------------- shared: one question at a time with choices ---------------- */
function useSequence(n: number, onComplete: (firstTry: number) => void) {
  const [i, setI] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<number | null>(null);
  const misses = useRef(new Set<number>());
  const refs = useRef<(HTMLElement | null)[]>([]);
  const choose = (ok: boolean, k: number) => {
    if (solved) return;
    if (ok) {
      setSolved(true); sfx.correct(); burstOn(refs.current[k]);
      setTimeout(() => { if (i + 1 < n) { setI(i + 1); setSolved(false); } else onComplete(n - misses.current.size); }, 900);
    } else { misses.current.add(i); sfx.retry(); setWrong(k); setTimeout(() => setWrong(null), 450); }
  };
  return { i, solved, wrong, choose, refs };
}

function Counter({ i, n }: { i: number; n: number }) {
  return <span style={{ font: '700 12px var(--ui)', color: 'var(--muted-2)' }}>{i + 1} of {n}</span>;
}

/* ---------------- complete the answer ---------------- */
function Complete({ items, onComplete }: { items: Extract<Activity, { k: 'complete' }>['items']; onComplete: (n: number) => void }) {
  const order = useMemo(() => shuffled(items), [items]);
  const s = useSequence(order.length, onComplete);
  const it = order[s.i];
  const choices = useMemo(() => shuffled(it.choices), [s.i]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Counter i={s.i} n={order.length} />
      <div style={{ padding: '26px 18px', borderRadius: 20, background: '#fff', border: '1px solid var(--line)', textAlign: 'center', font: '500 26px/1.35 var(--serif)' }}>
        {it.before}{' '}
        <span style={{ display: 'inline-block', minWidth: 110, borderBottom: `3px solid ${s.solved ? 'var(--leaf)' : 'var(--line-3)'}`, color: 'var(--leaf)', transition: 'all .3s' }}>
          <AnimatePresence>{s.solved && <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>{it.answer}</motion.span>}</AnimatePresence>
          {!s.solved && ' '}
        </span>{it.after === '.' ? '.' : ` ${it.after}`}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {choices.map((c, k) => (
          <button key={c} ref={el => { s.refs.current[k] = el; }} onClick={() => s.choose(c === it.answer, k)} className={s.wrong === k ? 'shake' : ''}
            style={{ height: 58, borderRadius: 16, border: `2px solid ${s.solved && c === it.answer ? 'var(--leaf)' : 'var(--line-2)'}`, background: s.solved && c === it.answer ? 'var(--ok-bg)' : '#fff', font: '700 17px var(--ui)', color: 'var(--ink)', cursor: 'pointer' }}>{c}</button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- listen and choose ---------------- */
/* ---------------- hear an Arabic line, find its meaning (no reading needed) ---------------- */
function Hear({ items, onComplete }: { items: Extract<Activity, { k: 'hear' }>['items']; onComplete: (n: number) => void }) {
  const order = useMemo(() => shuffled(items), [items]);
  const s = useSequence(order.length, onComplete);
  const [playing, setPlaying] = useState(false);
  const p = order[s.i];
  const opts = useMemo(() => shuffled(items.map(x => x.en)), [s.i]);
  // an ayah is recited by the reciter; a dua is read by the narrator
  const play = async () => {
    stopAll(); setPlaying(true);
    if (p.evidence?.audio) await playClip(p.evidence.audio, p.evidence.words.map(w => w.t ?? 0), Infinity, () => {});
    else await narrate(p.ar, { lang: 'ar' });
    setPlaying(false);
  };
  useEffect(() => { const t = setTimeout(play, 400); return () => { clearTimeout(t); stopAll(); }; }, [s.i]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Counter i={s.i} n={order.length} />
      <button onClick={play} aria-label="Hear it again" style={{ alignSelf: 'center', width: 96, height: 96, borderRadius: '50%', border: 0, cursor: 'pointer', background: playing ? 'var(--leaf)' : 'var(--ink)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}>
        <SpeakerIcon size={38} />
      </button>
      <div dir="rtl" className="ar" style={{ textAlign: 'center', font: `700 ${p.ar.length > 30 ? 22 : 30}px/1.7 var(--arabic)`, color: 'var(--ink)' }}>{p.ar}</div>
      {opts.map((en, k) => (
        <button key={en} ref={el => { s.refs.current[k] = el; }} onClick={() => s.choose(en === p.en, k)} className={s.wrong === k ? 'shake' : ''}
          style={{ minHeight: 60, padding: '12px 16px', borderRadius: 16, cursor: 'pointer', textAlign: 'left', font: '700 16px/1.35 var(--ui)', color: 'var(--ink)', border: `2px solid ${s.solved && en === p.en ? 'var(--leaf)' : 'var(--line-2)'}`, background: s.solved && en === p.en ? 'var(--ok-bg)' : '#fff' }}>
          “{en}”
        </button>
      ))}
    </div>
  );
}

/* ---------------- a short question with its own two options, read aloud ---------------- */
function Choose({ items, onComplete }: { items: Extract<Activity, { k: 'choose' }>['items']; onComplete: (n: number) => void }) {
  const order = useMemo(() => shuffled(items), [items]);
  const s = useSequence(order.length, onComplete);
  const n = useNarration();
  const p = order[s.i];
  const opts = useMemo(() => shuffled(p.options.map((t, k) => ({ t, right: k === p.answer }))), [s.i]);
  useEffect(() => { const t = setTimeout(() => n.say(p.q, 'en'), 350); return () => clearTimeout(t); }, [s.i]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Counter i={s.i} n={order.length} />
      <div style={{ padding: '18px', borderRadius: 22, background: 'var(--ink)', color: 'var(--paper)' }}>
        <Words className="pretty" text={p.q} active={n.en} style={{ font: '500 21px/1.3 var(--serif)' }} />
      </div>
      {opts.map((o, k) => (
        <button key={o.t} ref={el => { s.refs.current[k] = el; }} onClick={() => s.choose(o.right, k)} className={s.wrong === k ? 'shake' : ''}
          style={{ minHeight: 64, padding: '12px 16px', borderRadius: 16, cursor: 'pointer', textAlign: 'left', font: '700 16px/1.3 var(--ui)', color: 'var(--ink)', border: `2px solid ${s.solved && o.right ? 'var(--leaf)' : 'var(--line-2)'}`, background: s.solved && o.right ? 'var(--ok-bg)' : '#fff' }}>
          {o.t}
        </button>
      ))}
    </div>
  );
}

function Listen({ items, sample, others, onComplete }: { items: { qAr: string; aAr: string }[]; sample?: number; others?: string[]; onComplete: (n: number) => void }) {
  const order = useMemo(() => shuffled(items).slice(0, sample ?? items.length), [items]);
  const s = useSequence(order.length, onComplete);
  const n = useNarration();
  const p = order[s.i];
  // the right answer and up to two others (all true sentences), freshly shuffled
  const opts = useMemo(() => shuffled([p, ...(others ? others.map(aAr => ({ qAr: '', aAr })) : shuffled(items.filter(o => o !== p)).slice(0, 2))]), [s.i]);
  useEffect(() => { const t = setTimeout(() => n.say(p.qAr, 'ar'), 350); return () => clearTimeout(t); }, [s.i]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Counter i={s.i} n={order.length} />
      <button onClick={() => n.say(p.qAr, 'ar')} style={{ alignSelf: 'center', width: 110, height: 110, borderRadius: '50%', border: 0, cursor: 'pointer', background: 'radial-gradient(circle at 40% 35%, #2F8A63, #0E3B2E)', color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: n.busy ? '0 0 0 10px rgba(217,196,143,.35)' : '0 12px 30px rgba(14,59,46,.25)', transition: 'box-shadow .3s' }} aria-label="Play the question">
        <SpeakerIcon size={42} />
      </button>
      <div style={{ textAlign: 'center', minHeight: 44 }}>
        {s.solved ? <span className="ar" style={{ font: '700 28px var(--arabic)' }}>{p.qAr}</span> : <span style={{ font: '13px var(--ui)', color: 'var(--muted)' }}>Tap to hear it again</span>}
      </div>
      {opts.map((o, k) => (
        <button key={o.aAr} ref={el => { s.refs.current[k] = el; }} onClick={() => s.choose(o === p, k)} className={s.wrong === k ? 'shake' : ''}
          style={{ minHeight: 64, padding: '6px 12px', borderRadius: 16, border: `2px solid ${s.solved && o === p ? 'var(--leaf)' : 'var(--line-2)'}`, background: s.solved && o === p ? 'var(--ok-bg)' : '#fff', cursor: 'pointer' }}>
          <span className="ar" style={{ font: `700 ${o.aAr.length > 24 ? 21 : 26}px/1.5 var(--arabic)`, color: 'var(--ink)' }}>{o.aAr}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------------- build the sentence (drag tiles into order) ---------------- */
const TILT = [-5, 4, -3, 6, -4], LIFT = [6, -8, 10, -4, 4];
function Build({ sentences, onComplete }: { sentences: string[][]; onComplete: (n: number) => void }) {
  const order = useMemo(() => shuffled(sentences), [sentences]);
  const [si, setSi] = useState(0);
  const words = order[si];
  const [slots, setSlots] = useState<(number | null)[]>(() => words.map(() => null));
  const [wrong, setWrong] = useState<number | null>(null);
  const [doneRow, setDoneRow] = useState(false);
  const misses = useRef(new Set<number>());
  const row = useRef<HTMLDivElement>(null);
  const poolOrder = useMemo(() => { let o: number[]; do { o = shuffled(words.map((_, k) => k)); } while (o.every((v, k) => v === k) && words.length > 1); return o; }, [si]);

  const place = (w: number, slot: number) => {
    if (doneRow || slots[slot] !== null) return false;
    if (words[w] !== words[slot]) { misses.current.add(si); sfx.retry(); setWrong(w); setTimeout(() => setWrong(null), 450); return false; }
    const ns = slots.slice(); ns[slot] = w; setSlots(ns);
    if (ns.every(x => x !== null)) {
      setDoneRow(true); sfx.correct(); setTimeout(() => burstOn(row.current), 50);
      setTimeout(() => {
        if (si + 1 < order.length) { setSi(si + 1); setSlots(order[si + 1].map(() => null)); setDoneRow(false); }
        else onComplete(order.length - misses.current.size);
      }, 1100);
    }
    return true;
  };
  const drop = (w: number, x: number, y: number) => {
    const hit = document.elementsFromPoint(x, y).find(el => (el as HTMLElement).dataset?.slot !== undefined) as HTMLElement | undefined;
    if (hit) place(w, +hit.dataset.slot!);
  };
  const tapTile = (w: number) => { const empty = slots.findIndex(s => s === null); if (empty >= 0) place(w, empty); };

  return (
    <LayoutGroup id={`build-${si}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Counter i={si} n={order.length} />
        <div ref={row} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, padding: '18px 10px', borderRadius: 20, background: doneRow ? 'var(--ok-bg)' : '#fff', border: `2px dashed ${doneRow ? 'var(--leaf)' : 'var(--line-3)'}`, transition: 'all .3s' }}>
          {slots.map((w, k) => (
            <div key={k} data-slot={k} style={{ minWidth: 34 + words[k].length * 10, height: 52, borderRadius: 12, background: w === null ? 'var(--track)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {w !== null && <motion.div layoutId={`t${si}-${w}`} style={tileStyle(true)}>{words[w]}</motion.div>}
            </div>
          ))}
        </div>
        <div style={{ minHeight: 150, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', gap: 14, padding: '8px 0' }}>
          {poolOrder.map((w, k) => !slots.includes(w) && (
            <motion.div key={w} layoutId={`t${si}-${w}`} drag dragSnapToOrigin dragElastic={0.9} whileDrag={{ scale: 1.08, rotate: 0, zIndex: 10, boxShadow: '0 12px 24px rgba(14,59,46,.22)' }}
              onDragEnd={(e, info) => { const pe = e as PointerEvent; drop(w, pe.clientX ?? info.point.x - window.scrollX, pe.clientY ?? info.point.y - window.scrollY); }}
              onTap={() => tapTile(w)} className={wrong === w ? 'shake' : ''}
              style={{ ...tileStyle(false), rotate: TILT[k % TILT.length], y: LIFT[k % LIFT.length], touchAction: 'none', cursor: 'grab' }}>{words[w]}</motion.div>
          ))}
        </div>
      </div>
    </LayoutGroup>
  );
}
const tileStyle = (placed: boolean): React.CSSProperties => ({
  padding: '0 16px', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap',
  borderRadius: 12, borderStyle: 'solid', borderWidth: '2px 2px 4px', borderColor: placed ? 'var(--leaf)' : 'var(--line-2)', background: placed ? 'var(--sel-bg)' : '#fff',
  font: '700 17px var(--ui)', color: 'var(--ink)', userSelect: 'none', position: 'relative',
});

/* ---------------- speak (record + compare) ---------------- */
function Speak({ items, lessonTitle, onComplete }: { items: SpeakItem[]; lessonTitle: string; onComplete: () => void }) {
  const [i, setI] = useState(0);
  const [state, setState] = useState<'idle' | 'rec' | 'done'>('idle');
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [allDone, setAllDone] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef<{ rec?: MediaRecorder; stream?: MediaStream; ctx?: AudioContext; raf?: number; timer?: number }>({});
  const n = useNarration();
  const p = items[i];
  const ask = () => (p.promptAr ? n.sayPair(p.promptAr, p.prompt) : n.say(p.prompt, 'en'));
  const model = () => (p.modelAr && p.modelEn ? n.sayPair(p.modelAr, p.modelEn) : p.modelAr ? n.say(p.modelAr, 'ar') : n.say(p.modelEn!, 'en'));

  useEffect(() => { const t = setTimeout(ask, 300); return () => clearTimeout(t); }, [i]);
  useEffect(() => () => cleanup(), []);
  useEffect(() => { drawFlat(); }, [i, state]);

  function cleanup() {
    const L = live.current;
    if (L.rec) L.rec.onstop = null; // leaving mid recording (Skip) keeps nothing
    if (L.raf) cancelAnimationFrame(L.raf); if (L.timer) clearTimeout(L.timer);
    L.stream?.getTracks().forEach(t => t.stop()); L.ctx?.close().catch(() => {});
    live.current = {};
  }
  function drawFlat() {
    const c = canvas.current; if (!c || state === 'rec') return;
    const g = c.getContext('2d')!; c.width = c.clientWidth * 2; c.height = c.clientHeight * 2;
    g.clearRect(0, 0, c.width, c.height); g.fillStyle = state === 'done' ? '#9CC3AE' : '#DCD6C6';
    const bars = 36, bw = c.width / bars;
    for (let k = 0; k < bars; k++) { const h = state === 'done' ? (0.2 + 0.6 * Math.abs(Math.sin(k * 0.7) * Math.sin(k * 0.23))) * c.height : 6; g.fillRect(k * bw + bw * 0.3, (c.height - h) / 2, bw * 0.4, h); }
  }
  async function start() {
    setErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream); const chunks: Blob[] = [];
      rec.ondataavailable = e => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: rec.mimeType }); setUrl(u => { if (u) URL.revokeObjectURL(u); return URL.createObjectURL(blob); }); setState('done'); cleanup();
        if (p.keep) saveRecording(lessonTitle, p.prompt, blob); // a reflection for the family, kept for the Parent view
      };
      const ctx = new AudioContext(); const an = ctx.createAnalyser(); an.fftSize = 1024;
      ctx.createMediaStreamSource(stream).connect(an);
      live.current = { rec, stream, ctx };
      const buf = new Uint8Array(an.fftSize);
      const draw = () => {
        const c = canvas.current; if (!c) return;
        const g = c.getContext('2d')!; if (c.width !== c.clientWidth * 2) { c.width = c.clientWidth * 2; c.height = c.clientHeight * 2; }
        an.getByteTimeDomainData(buf);
        g.clearRect(0, 0, c.width, c.height); g.fillStyle = '#1F6B4C';
        const bars = 36, bw = c.width / bars, step = Math.floor(buf.length / bars);
        for (let k = 0; k < bars; k++) {
          let peak = 0; for (let j = 0; j < step; j++) peak = Math.max(peak, Math.abs(buf[k * step + j] - 128));
          const h = Math.max(6, (peak / 128) * c.height * 1.6);
          g.fillRect(k * bw + bw * 0.3, (c.height - Math.min(h, c.height)) / 2, bw * 0.4, Math.min(h, c.height));
        }
        live.current.raf = requestAnimationFrame(draw);
      };
      rec.start(); setState('rec'); draw();
      live.current.timer = window.setTimeout(() => rec.state === 'recording' && rec.stop(), (p.seconds ?? 8) * 1000);
    } catch {
      setErr('The microphone isn’t available here. You can still say it aloud and continue.');
    }
  }
  const stop = () => { const r = live.current.rec; if (r && r.state === 'recording') r.stop(); };
  const nextQ = () => {
    if (i + 1 < items.length) { setI(i + 1); setState('idle'); setUrl(null); }
    else { setAllDone(true); onComplete(); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Counter i={i} n={items.length} />
      {p.image && <img src={p.image} alt="" style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 18, border: '1px solid var(--line)' }} />}
      <div style={{ padding: '20px 18px', borderRadius: 20, background: 'var(--ink)', color: 'var(--paper)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>The app asks</span>
        {p.promptAr && <Words className="ar" text={p.promptAr} active={n.ar} style={{ font: '700 24px/1.6 var(--arabic)', color: '#F6E7BD' }} />}
        <Words className="pretty" text={p.prompt} active={n.en} style={{ font: '500 24px/1.25 var(--serif)' }} />
        {(p.modelAr || p.modelEn) && <span style={{ font: '14px/1.5 var(--ui)', color: '#B9CCC2', marginTop: 6 }}>Answer out loud: {p.modelAr && <span className="ar" style={{ font: '700 19px var(--arabic)', color: '#F6E7BD' }}>{p.modelAr}</span>}{p.modelEn && <>“{p.modelEn}”</>}</span>}
        {p.keep && <span style={{ font: '13px/1.5 var(--ui)', color: '#B9CCC2', marginTop: 6 }}>Your recording is saved for a grown up to hear in the Parent view.</span>}
      </div>
      <canvas ref={canvas} style={{ width: '100%', height: 70, borderRadius: 16, background: '#fff', border: '1px solid var(--line)' }} />
      {err && <span style={{ font: '13px/1.45 var(--ui)', color: 'var(--err)' }}>{err}</span>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
        {state !== 'rec'
          ? <button onClick={start} aria-label="Record" style={{ width: 72, height: 72, borderRadius: '50%', border: '4px solid var(--err-bg)', background: 'var(--err)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff' }} /></button>
          : <button onClick={stop} aria-label="Stop recording" style={{ width: 72, height: 72, borderRadius: '50%', border: '4px solid var(--err-bg)', background: 'var(--err)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulseDot 1.4s infinite' }}>
              <span style={{ width: 22, height: 22, borderRadius: 5, background: '#fff' }} /></button>}
      </div>
      <span style={{ textAlign: 'center', font: '600 13px var(--ui)', color: 'var(--muted)' }}>{state === 'rec' ? 'Listening… tap to stop' : state === 'done' ? (p.modelAr || p.modelEn ? 'Now compare your voice with the model' : 'Recorded. Tap Play mine to hear it.') : 'Tap to record'}</span>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {url && <ListenBtn label="Play mine" onClick={() => new Audio(url).play()} />}
        {(p.modelAr || p.modelEn) && <ListenBtn label="Hear the model" busy={n.busy} onClick={model} />}
      </div>
      {(state === 'done' || err) && !allDone && (
        <button className="btn leaf" style={{ height: 50 }} onClick={nextQ}>{i + 1 < items.length ? 'Next' : 'Done speaking'}</button>
      )}
    </div>
  );
}

/* ---------------- the one milestone at the end ---------------- */
function StarMoment({ stars, right, scored, onNext }: { stars: number; right: number; scored: number; onNext: () => void }) {
  const n = useNarration();
  const note = ENCOURAGE[stars as 1 | 2 | 3];
  useEffect(() => { const t = setTimeout(() => n.say(note, 'en'), 1500); return () => clearTimeout(t); }, []);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '30px 24px 28px', gap: 18 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, textAlign: 'center' }}>
        <span className="eyebrow" style={{ color: 'var(--muted-2)' }}>Practice complete</span>
        <div style={{ display: 'flex', gap: 14 }}>
          {[0, 1, 2].map(k => (
            <motion.svg key={k} width="72" height="72" viewBox="0 0 24 24" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3 + k * 0.35, type: 'spring', stiffness: 220, damping: 14 }}>
              <path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill={k < stars ? '#D9B45E' : '#E8E3D6'} stroke={k < stars ? '#A8894C' : '#DCD6C6'} strokeWidth="1" strokeLinejoin="round" />
            </motion.svg>
          ))}
        </div>
        <span className="serif" style={{ font: '500 30px/1.15 var(--serif)' }}>{stars === 3 ? 'Steady and sure.' : stars === 2 ? 'Nearly there.' : 'Keep going.'}</span>
        <span style={{ font: '15px/1.5 var(--ui)', color: 'var(--muted)' }}>{right} of {scored} answered on the first try.</span>
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: .8 }} className="pretty"
          style={{ marginTop: 6, maxWidth: 300, font: 'italic 400 19px/1.5 var(--serif)', color: 'var(--body)' }}>
          <Words text={note} active={n.en} onLight />
        </motion.span>
      </div>
      <button className="btn" onClick={onNext}>On to Quick Check</button>
    </div>
  );
}
