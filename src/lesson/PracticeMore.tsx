// Level 3 practice activities: Follow the Food (ordering), the word-bank Complete the Answer, and Count the Blessings.
// Every sentence on screen is true; a wrong drop simply floats back.
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import type { Activity, BlessingSpot } from '../data/lessonTypes';
import { Words, useNarration } from '../components/ui';
import { burstAt, burstOn, narrate, sfx } from '../lib/audio';
import { PillarHouse } from '../components/PillarHouse';
import { PanStrip } from '../components/PanStrip';

const shuffled = <T,>(a: T[]) => a.map(x => [Math.random(), x] as const).sort((p, q) => p[0] - q[0]).map(([, x]) => x);
const derange = (n: number) => { let o: number[]; do { o = shuffled([...Array(n).keys()]); } while (n > 1 && o.some((v, k) => v === k && k < 2)); return o; };
const hitAt = (x: number, y: number, attr: string) => document.elementsFromPoint(x, y).find(el => (el as HTMLElement).dataset?.[attr] !== undefined) as HTMLElement | undefined;
const pointOf = (e: MouseEvent | TouchEvent | PointerEvent, info: { point: { x: number; y: number } }) => {
  const pe = e as PointerEvent; return { x: pe.clientX ?? info.point.x - window.scrollX, y: pe.clientY ?? info.point.y - window.scrollY };
};

/** a sentence that may contain a short Arabic phrase, e.g. “I say الْحَمْدُ لِلَّهِ.” */
function Mixed({ text }: { text: string }) {
  return <>{text.split(/([؀-ۿ][؀-ۿ\sً-ْ]*[؀-ۿً-ْ])/).map((part, i) =>
    /[؀-ۿ]/.test(part) ? <span key={i} className="ar" style={{ font: '700 1.25em var(--arabic)' }}>{part}</span> : <span key={i}>{part}</span>)}</>;
}

/* ---------------- Follow the Food: drag the cards into order ---------------- */
export function Order({ act, onComplete }: { act: Extract<Activity, { k: 'order' }>; onComplete: (n: number) => void }) {
  const n = act.items.length;
  const pool = useMemo(() => derange(n), []);
  const [placed, setPlaced] = useState<number[]>([]); // placed[k] = item in slot k; always the correct prefix
  const [wrong, setWrong] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const misses = useRef(0);
  const list = useRef<HTMLDivElement>(null);
  const say = useNarration();

  const place = (item: number, slot: number) => {
    if (done) return;
    if (slot !== placed.length || item !== slot) { misses.current++; sfx.retry(); setWrong(item); setTimeout(() => setWrong(null), 450); return; }
    const next = [...placed, item]; setPlaced(next); sfx.correct();
    if (next.length === n) {
      setDone(true);
      setTimeout(() => { burstOn(list.current); sfx.complete(); if (act.reveal) say.sayPair(act.reveal.ar, act.reveal.en); }, 400);
      onComplete(Math.max(0, n - misses.current));
    }
  };
  const drop = (item: number, x: number, y: number) => { const s = hitAt(x, y, 'slot'); if (s) place(item, +s.dataset.slot!); };

  return (
    <LayoutGroup id="order">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {act.house && <PillarHouse risen={act.items.map((_, k) => k < placed.length)} lit={act.items.map((_, k) => k < placed.length)} roof={done} glow={done} size={220} />}
        <AnimatePresence>
          {done && act.reveal && (
            <motion.div initial={{ opacity: 0, y: 10, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .9 }}
              style={{ alignSelf: 'center', padding: '8px 22px', borderRadius: 18, background: 'radial-gradient(circle at 50% 0%, #FFF8E4, #F3E6C2)', boxShadow: '0 0 28px rgba(233,207,143,.7)', textAlign: 'center' }}>
              <Words className="ar" text={act.reveal.ar} active={say.ar} onLight style={{ font: '700 30px/1.6 var(--arabic)', color: 'var(--ink)' }} />
              <div><Words text={act.reveal.en} active={say.en} onLight style={{ font: '600 14px var(--ui)', color: 'var(--sand-ink)' }} /></div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={list} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* the line of light that runs through all five cards when the order is right */}
          <motion.div initial={false} animate={{ scaleY: done ? 1 : 0 }} transition={{ duration: 1.2, ease: 'easeInOut' }}
            style={{ position: 'absolute', left: 25, top: 20, bottom: 20, width: 4, borderRadius: 4, transformOrigin: 'top', background: 'linear-gradient(#F2DFA8, #D9B45E)', boxShadow: '0 0 12px rgba(233,207,143,.9)' }} />
          {act.items.map((_, k) => {
            const it = placed[k];
            return (
              <div key={k} data-slot={k} style={{ minHeight: 56, borderRadius: 14, border: `2px dashed ${it === undefined ? (k === placed.length ? 'var(--gold-light)' : 'var(--line-3)') : 'transparent'}`, background: it === undefined ? 'var(--track)' : 'transparent', display: 'flex', alignItems: 'stretch', position: 'relative' }}>
                {it === undefined
                  ? <span style={{ margin: 'auto 0 auto 16px', font: '700 13px var(--ui)', color: 'var(--muted-3)' }}>{k + 1}</span>
                  : <motion.div layoutId={`o${it}`} style={{ ...cardStyle(true), flex: 1, ...(act.lights && done && k === n - 1 ? GLOW_CARD : {}) }}>{act.lights && k < n - 1 ? <Light lit={true} /> : <Num k={k} lit={done} />}<Mixed text={act.items[it]} /></motion.div>}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pool.map(it => !placed.includes(it) && (
            <motion.div key={it} layoutId={`o${it}`} drag dragSnapToOrigin dragElastic={0.9} whileDrag={{ scale: 1.04, zIndex: 10, boxShadow: '0 12px 24px rgba(14,59,46,.22)' }}
              onDragEnd={(e, info) => { const p = pointOf(e, info); drop(it, p.x, p.y); }} onTap={() => place(it, placed.length)}
              className={wrong === it ? 'shake' : ''} style={{ ...cardStyle(false), touchAction: 'none', cursor: 'grab' }}><Mixed text={act.items[it]} /></motion.div>
          ))}
        </div>
      </div>
    </LayoutGroup>
  );
}
/** Build the Argument: the three lights from Level 4 sit on the first cards, and join to light the conclusion */
const Light = ({ lit }: { lit: boolean }) => (
  <span style={{ width: 24, height: 24, flex: 'none', borderRadius: '50%', position: 'relative', zIndex: 1, background: lit ? 'radial-gradient(circle, #FFFBEA 0%, #F3D98F 45%, #D9B45E 100%)' : 'var(--line-3)', boxShadow: lit ? '0 0 14px rgba(233,207,143,.9)' : 'none' }} />
);
const GLOW_CARD: React.CSSProperties = { background: 'radial-gradient(circle at 50% 0%, #FFF8E4, #F3E6C2)', borderColor: 'var(--gold-light)', boxShadow: '0 0 26px rgba(233,207,143,.75)', transition: 'all .8s' };
const Num = ({ k, lit }: { k: number; lit: boolean }) => (
  <span style={{ width: 24, height: 24, flex: 'none', borderRadius: '50%', background: lit ? '#D9B45E' : 'var(--leaf)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 12px var(--ui)', transition: 'background .6s', position: 'relative', zIndex: 1 }}>{k + 1}</span>
);
const cardStyle = (placed: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', minHeight: 52, borderRadius: 14, userSelect: 'none', font: '600 15px/1.35 var(--ui)', color: 'var(--ink)',
  borderStyle: 'solid', borderWidth: '2px 2px 4px', borderColor: placed ? '#CFE0D6' : 'var(--line-2)', background: placed ? 'var(--sel-bg)' : '#fff',
});

/* ---------------- Complete the Answer: a word bank, each word used once ---------------- */
export function WordBank({ act, onComplete }: { act: Extract<Activity, { k: 'wordbank' }>; onComplete: (n: number) => void }) {
  const items = useMemo(() => shuffled(act.items), []);
  const bank = useMemo(() => shuffled(items.map((_, i) => i)), []);
  const [filled, setFilled] = useState<number[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const misses = useRef(new Set<number>());
  const rows = useRef<(HTMLDivElement | null)[]>([]);

  const put = (word: number, row: number) => {
    setSel(null);
    if (filled.includes(row)) return;
    if (word !== row) { misses.current.add(word); sfx.retry(); setWrong(word); setTimeout(() => setWrong(null), 450); return; }
    const f = [...filled, row]; setFilled(f); sfx.correct(); burstOn(rows.current[row]);
    if (f.length === items.length) setTimeout(() => onComplete(items.length - misses.current.size), 500);
  };
  const drop = (word: number, x: number, y: number) => { const r = hitAt(x, y, 'row'); if (r) put(word, +r.dataset.row!); };

  return (
    <LayoutGroup id="wordbank">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((it, r) => (
            <div key={r} ref={el => { rows.current[r] = el; }} data-row={r} onClick={() => sel !== null && put(sel, r)}
              style={{ padding: '14px 14px', borderRadius: 16, background: '#fff', border: `1.5px solid ${filled.includes(r) ? '#CFE0D6' : 'var(--line)'}`, font: act.arabic ? '700 21px/1.9 var(--arabic)' : '500 19px/1.6 var(--serif)', direction: act.arabic ? 'rtl' : undefined, color: 'var(--ink)', cursor: sel !== null ? 'pointer' : 'default' }}>
              {it.before}{' '}
              <span style={{ display: 'inline-flex', minWidth: 96, justifyContent: 'center', verticalAlign: 'middle', borderBottom: `3px solid ${filled.includes(r) ? 'var(--leaf)' : 'var(--line-3)'}` }}>
                {filled.includes(r) ? <motion.span layoutId={`w${r}`} style={{ color: 'var(--leaf)', font: act.arabic ? '700 21px/1.6 var(--arabic)' : '700 17px var(--ui)', padding: '0 4px' }}>{it.answer}</motion.span> : ' '}
              </span>
              {it.after === '.' ? '.' : ` ${it.after}`}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', padding: '12px', borderRadius: 18, background: 'var(--track)' }}>
          {bank.map(w => !filled.includes(w) && (
            <motion.div key={w} layoutId={`w${w}`} drag dragSnapToOrigin dragElastic={0.9} whileDrag={{ scale: 1.08, zIndex: 10, boxShadow: '0 12px 24px rgba(14,59,46,.22)' }}
              onDragEnd={(e, info) => { const p = pointOf(e, info); drop(w, p.x, p.y); }} onTap={() => setSel(s => (s === w ? null : w))}
              className={wrong === w ? 'shake' : ''}
              style={{ padding: '0 16px', height: 46, display: 'flex', alignItems: 'center', borderRadius: 12, userSelect: 'none', touchAction: 'none', cursor: 'grab', font: act.arabic ? '700 21px/1.6 var(--arabic)' : '700 16px var(--ui)', color: 'var(--ink)',
                borderStyle: 'solid', borderWidth: '2px 2px 4px', borderColor: sel === w ? 'var(--leaf)' : 'var(--line-2)', background: sel === w ? 'var(--ok-bg)' : '#fff' }}>{items[w].answer}</motion.div>
          ))}
          {filled.length === items.length && <span style={{ font: '600 13px var(--ui)', color: 'var(--muted)' }}>Every word is in its place.</span>}
        </div>
      </div>
    </LayoutGroup>
  );
}

/* ---------------- Count the Blessings: a calm exploration with no timer, score or ending ---------------- */
export function Blessings({ act, onComplete }: { act: Extract<Activity, { k: 'blessings' }>; onComplete: () => void }) {
  const n = useNarration();
  const [found, setFound] = useState<string[]>([]);
  const [last, setLast] = useState<BlessingSpot | null>(null);
  const [showLine, setShowLine] = useState(false);
  const pic = useRef<HTMLDivElement>(null);
  const count = found.length;
  useEffect(() => { const t = setTimeout(() => n.say(act.intro, 'en'), 400); return () => clearTimeout(t); }, []);
  // smallest spot first, so the birds win over the window they sit in
  const spots = useMemo(() => [...act.spots].sort((a, b) => b.box![2] * b.box![3] - a.box![2] * a.box![3]), [act]);

  // after enough blessings are noticed, the quiet line appears (the counter keeps going)
  const reached = useRef(false);
  useEffect(() => {
    if (count >= act.after && !reached.current) { reached.current = true; onComplete(); setTimeout(async () => { setShowLine(true); await narrate(act.line, { lang: 'en' }); }, 1600); }
  }, [count]);

  const tap = async (s: BlessingSpot, x: number, y: number) => {
    burstAt(x, y); sfx.pulse();
    setLast(s);
    setFound(f => (f.includes(s.id) ? f : [...f, s.id]));
    if (s.ar) { await narrate(s.label, { lang: 'en' }); await narrate(s.ar, { lang: 'ar' }); } else await narrate(s.label, { lang: 'en' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Words className="pretty" text={act.intro} active={n.en} onLight style={{ font: 'italic 400 17px/1.45 var(--serif)', color: 'var(--body)' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <motion.span key={count} initial={{ scale: 1.4, color: '#A8894C' }} animate={{ scale: 1, color: '#0E3B2E' }} style={{ font: '800 28px var(--ui)', display: 'inline-block' }}>{count}</motion.span>
          <span style={{ font: '600 13px var(--ui)', color: 'var(--muted)' }}>blessings found</span>
        </span>
        <button onClick={() => n.say(act.thank, 'ar')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, border: '1.5px solid var(--gold-light)', background: 'var(--sand)', cursor: 'pointer' }}>
          <span className="ar" style={{ font: '700 18px var(--arabic)', color: 'var(--ink)' }}><Words className="ar" text={act.thank} active={n.ar} onLight /></span>
        </button>
      </div>
      {/* the picture pans sideways so small things stay big enough to tap */}
      <PanStrip width={620} aspect={1600 / 894}>
        <div ref={pic} style={{ position: 'absolute', inset: 0 }}>
          <img src={act.image} alt="A home in morning light with food on the table, books, a lamp, a bed and a window onto a garden" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
          {spots.map(s => {
            const [x, y, w, h] = s.box!, got = found.includes(s.id);
            return (
              <button key={s.id} aria-label={s.label} onClick={e => tap(s, e.clientX, e.clientY)}
                style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, border: 0, background: 'transparent', cursor: 'pointer', padding: 0 }}>
                {got && <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: .6 }}
                  style={{ position: 'absolute', left: '50%', top: '30%', width: 18, height: 18, marginLeft: -9, marginTop: -9, borderRadius: '50%', background: 'radial-gradient(circle, #FFFBEA 0%, #F3D98F 45%, rgba(233,201,122,0) 72%)', pointerEvents: 'none' }} />}
              </button>
            );
          })}
        </div>
      </PanStrip>
      <span style={{ font: '600 12px var(--ui)', color: 'var(--muted-2)', textAlign: 'center' }}>Use the arrow or slide the picture to see the whole room.</span>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ font: '700 13px var(--ui)', color: 'var(--ink)' }}>And in you:</span>
        {act.self.map(s => (
          <button key={s.id} onClick={e => tap(s, e.clientX, e.clientY)}
            style={{ flex: 1, height: 48, borderRadius: 14, border: `1.5px solid ${found.includes(s.id) ? 'var(--gold-light)' : 'var(--line-2)'}`, background: found.includes(s.id) ? 'var(--sand)' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, font: '700 14px var(--ui)', color: 'var(--ink)' }}>
            {s.label}{s.ar && <span className="ar" style={{ font: '700 18px var(--arabic)', color: 'var(--leaf)' }}>{s.ar}</span>}
          </button>
        ))}
      </div>
      <div style={{ minHeight: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, textAlign: 'center' }}>
        <AnimatePresence mode="wait">
          {last && (
            <motion.div key={last.id + count} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ font: '500 20px var(--serif)', color: 'var(--ink)' }}>{last.label}</span>
              {last.ar && <span className="ar" style={{ font: '700 22px var(--arabic)', color: 'var(--leaf)' }}>{last.ar}</span>}
            </motion.div>
          )}
        </AnimatePresence>
        {showLine && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }} style={{ font: 'italic 400 18px/1.4 var(--serif)', color: 'var(--sand-ink)' }}>{act.line}</motion.span>}
      </div>
    </div>
  );
}
