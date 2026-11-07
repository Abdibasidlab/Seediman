// Level 5 practice: the two box sorts (Words or Actions, Allah loves or Allah dislikes) and A Day of Worship.
// Every sentence on screen is true; a wrong drop simply floats back. The sorts are about actions, never people.
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import type { Activity, MomentSpot } from '../data/lessonTypes';
import { Words, useNarration } from '../components/ui';
import { burstAt, burstOn, sfx } from '../lib/audio';
import { PillarHouse } from '../components/PillarHouse';
import { PanStrip } from '../components/PanStrip';

const shuffled = <T,>(a: T[]) => a.map(x => [Math.random(), x] as const).sort((p, q) => p[0] - q[0]).map(([, x]) => x);
const hitAt = (x: number, y: number, attr: string) => document.elementsFromPoint(x, y).find(el => (el as HTMLElement).dataset?.[attr] !== undefined) as HTMLElement | undefined;

/* ---------------- Two Boxes / Loved or Disliked: drag each card into its box ---------------- */
export function Sort({ act, onComplete }: { act: Extract<Activity, { k: 'sort' }>; onComplete: (n: number) => void }) {
  // a fresh sample each session, always with at least one card for each box
  const items = useMemo(() => {
    let s: typeof act.items;
    do { s = shuffled(act.items).slice(0, act.sample ?? act.items.length); } while (!s.some(i => i.bin === 0) || !s.some(i => i.bin === 1));
    return s;
  }, [act]);
  const [placed, setPlaced] = useState<number[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null); // whose “why” is showing
  const misses = useRef(new Set<number>());
  const bins = useRef<(HTMLDivElement | null)[]>([]);
  const n = useNarration();

  const put = (it: number, bin: number) => {
    setSel(null);
    if (placed.includes(it)) return;
    if (items[it].bin !== bin) { misses.current.add(it); sfx.retry(); setWrong(it); setTimeout(() => setWrong(null), 450); return; }
    const next = [...placed, it]; setPlaced(next); sfx.correct(); burstOn(bins.current[bin]); setOpen(null);
    const c = items[it]; if (c.ar) n.sayPair(c.ar, c.en); else n.say(c.en, 'en');
    if (next.length === items.length) setTimeout(() => onComplete(items.length - misses.current.size), 600);
  };
  const why = (it: number) => { if (open === it) { setOpen(null); n.stop(); return; } setOpen(it); n.say(items[it].why!, 'en'); };

  return (
    <LayoutGroup id={`sort-${act.title}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${act.bins.length}, 1fr)`, gap: act.bins.length > 2 ? 6 : 10 }}>
          {act.bins.map((label, b) => (
            <div key={b} ref={el => { bins.current[b] = el; }} data-bin={b} onClick={() => sel !== null && put(sel, b)}
              style={{ minHeight: 170, padding: '10px 8px', borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 8, cursor: sel !== null ? 'pointer' : 'default',
                border: `2px dashed ${sel !== null ? 'var(--gold-light)' : 'var(--line-3)'}`, background: b === 0 ? 'var(--ok-bg)' : b === 2 ? '#E8EEF6' : 'var(--sand)', transition: 'border-color .2s' }}>
              <span style={{ font: '800 14px var(--ui)', color: b === 0 ? 'var(--leaf)' : 'var(--sand-ink)', textAlign: 'center', letterSpacing: '.02em' }}>{label}</span>
              {placed.filter(it => items[it].bin === b).map(it => (
                <motion.div key={it} layoutId={`s${it}`} style={{ ...card(true), flexDirection: 'column', alignItems: 'stretch', gap: 2 }}>
                  {items[it].ar && <Words className="ar" text={items[it].ar!} active={n.ar >= 0 && placed[placed.length - 1] === it ? n.ar : -1} onLight style={{ font: '700 17px/1.5 var(--arabic)', color: 'var(--ink)', textAlign: 'center' }} />}
                  <span style={{ font: '600 12.5px/1.3 var(--ui)', color: 'var(--body)', textAlign: 'center' }}>{items[it].en}</span>
                  {items[it].why && (
                    <button onClick={e => { if (sel !== null) return; /* a card is waiting: this tap places it in the box */ e.stopPropagation(); why(it); }} style={{ marginTop: 4, border: 0, background: 'none', cursor: 'pointer', font: '700 11.5px var(--ui)', color: 'var(--leaf)', textDecoration: 'underline' }}>
                      {act.whyLabel ?? 'Why?'}
                    </button>
                  )}
                  <AnimatePresence>
                    {open === it && (
                      <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pretty"
                        style={{ font: '12.5px/1.45 var(--ui)', color: 'var(--body-2)', textAlign: 'center', overflow: 'hidden' }}>
                        <Words text={items[it].why!} active={n.en} onLight />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((c, it) => !placed.includes(it) && (
            <motion.div key={it} layoutId={`s${it}`} drag dragSnapToOrigin dragElastic={0.9} whileDrag={{ scale: 1.04, zIndex: 10, boxShadow: '0 12px 24px rgba(14,59,46,.22)' }}
              onDragEnd={e => { const pe = e as PointerEvent; const b = hitAt(pe.clientX, pe.clientY, 'bin'); if (b) put(it, +b.dataset.bin!); }}
              onTap={() => setSel(s => (s === it ? null : it))} className={wrong === it ? 'shake' : ''}
              style={{ ...card(false), borderColor: sel === it ? 'var(--leaf)' : 'var(--line-2)', background: sel === it ? 'var(--ok-bg)' : '#fff', touchAction: 'none', cursor: 'grab' }}>
              <span style={{ flex: 1, font: '600 15px/1.35 var(--ui)', color: 'var(--ink)' }}>{c.en}</span>
              {c.ar && <span className="ar" style={{ font: '700 19px/1.5 var(--arabic)', color: 'var(--leaf)', flex: 'none', maxWidth: '48%', textAlign: 'right' }}>{c.ar}</span>}
            </motion.div>
          ))}
          {placed.length === items.length && <span style={{ font: '600 13px var(--ui)', color: 'var(--muted)', textAlign: 'center' }}>Every card is in its box.</span>}
        </div>
      </div>
    </LayoutGroup>
  );
}
const card = (placed: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 10, padding: placed ? '8px 8px' : '10px 14px', minHeight: placed ? 0 : 56, borderRadius: 14, userSelect: 'none',
  borderStyle: 'solid', borderWidth: placed ? 1.5 : '2px 2px 4px', borderColor: placed ? '#CFE0D6' : 'var(--line-2)', background: '#fff',
});

/* ---------------- A Day of Worship: a calm exploration with no timer, score or ending ---------------- */
/** the shape of the close view: as wide as 16:9, as tall as a portrait panel */
const thumbAspect = ([, , w, h]: MomentSpot['box'], IMG_ASPECT: number) => Math.min(16 / 9, Math.max(0.62, (w * IMG_ASPECT) / h));
/** the part of the picture to show, as background size and position, for a close view of a moment */
function closeView(box: MomentSpot['box'], IMG_ASPECT: number) {
  const [x, y, w, h] = box, a = thumbAspect(box, IMG_ASPECT);
  // a little room around the moment, then widen or heighten to the close view's shape
  let rw = Math.max(w * 1.2, 16), rh = (rw * IMG_ASPECT) / a;
  if (rh < h * 1.1) { rh = h * 1.1; rw = (rh * a) / IMG_ASPECT; }
  if (rh > 100) { rh = 100; rw = (rh * a) / IMG_ASPECT; }
  if (rw > 100) { rw = 100; rh = (rw * IMG_ASPECT) / a; }
  const left = Math.min(100 - rw, Math.max(0, x + w / 2 - rw / 2)), top = Math.min(100 - rh, Math.max(0, y + h / 2 - rh / 2));
  return { backgroundSize: `${(100 / rw) * 100}% ${(100 / rh) * 100}%`, backgroundPosition: `${rw < 100 ? (left / (100 - rw)) * 100 : 0}% ${rh < 100 ? (top / (100 - rh)) * 100 : 0}%` };
}

export function Moments({ act, onComplete }: { act: Extract<Activity, { k: 'moments' }>; onComplete: () => void }) {
  const n = useNarration(), m = useNarration();
  const IMG_ASPECT = act.aspect ?? 2000 / 620;
  const [found, setFound] = useState<string[]>([]);
  const [cur, setCur] = useState<MomentSpot | null>(null);
  const [showLine, setShowLine] = useState(false);
  const [lineW, setLineW] = useState(-1);
  const [labelOn, setLabelOn] = useState(false);
  const [focus, setFocus] = useState<{ at: number } | null>(null);
  const mid = (s: MomentSpot) => s.box[0] + s.box[2] / 2;
  useEffect(() => { const t = setTimeout(() => n.say(act.intro, 'en'), 400); return () => clearTimeout(t); }, []);

  // after every moment has been seen, a quiet line appears; exploring carries on
  const reached = useRef(false);
  useEffect(() => {
    if (found.length >= act.spots.length && !reached.current) {
      reached.current = true; onComplete();
      setTimeout(async () => { setShowLine(true); sfx.pulse(); await n.say(act.line, 'en'); }, 1800);
    }
  }, [found]);

  const turn = useRef(0);
  const tap = async (s: MomentSpot, x: number, y: number) => {
    const my = ++turn.current; // a newer tap takes over the narration
    burstAt(x, y); sfx.pulse();
    setCur(s); setFound(f => (f.includes(s.id) ? f : [...f, s.id]));
    setLabelOn(true); setLineW(-1); await m.say(s.label, 'en'); if (turn.current !== my) return; setLabelOn(false);
    setLineW(0); await m.say(s.line, 'en'); if (turn.current !== my) return; setLineW(-1);
    // then the picture glides on to the next moment still to find, going forward first
    const i = act.spots.indexOf(s), order = [...act.spots.slice(i + 1), ...act.spots.slice(0, i)];
    const next = order.find(o => !foundRef.current.includes(o.id));
    if (next) setFocus({ at: mid(next) });
  };
  const foundRef = useRef(found); foundRef.current = found;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {act.house && <PillarHouse risen={[0, 1, 2, 3, 4].map(() => true)} lit={[0, 1, 2, 3, 4].map(i => act.spots.some(s => s.pillar === i && found.includes(s.id)))} roof glow={found.length >= act.spots.length} size={170} />}
      <Words className="pretty" text={act.intro} active={n.en >= 0 && !showLine ? n.en : -1} onLight style={{ font: 'italic 400 17px/1.45 var(--serif)', color: 'var(--body)' }} />
      {/* the picture slides sideways: finger, mouse drag, arrows or dots */}
      <PanStrip width={IMG_ASPECT < 2.5 ? 640 : 1000} aspect={IMG_ASPECT} focus={focus}
        stops={act.spots.map(s => ({ at: mid(s), done: found.includes(s.id), label: s.label }))}>
          <img src={act.image} alt={act.alt} draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
          {act.spots.map(s => {
            const [x, y, w, h] = s.box, got = found.includes(s.id);
            return (
              <button key={s.id} aria-label={s.label} onClick={e => tap(s, e.clientX, e.clientY)}
                style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, border: 0, padding: 0, cursor: 'pointer', borderRadius: 14,
                  background: cur?.id === s.id ? 'rgba(255,244,214,.18)' : 'transparent', transition: 'background .3s' }}>
                {/* a small light over each moment once it has been seen */}
                {got && <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: .8 }}
                  style={{ position: 'absolute', left: '50%', top: -6, width: 26, height: 26, marginLeft: -13, borderRadius: '50%', pointerEvents: 'none',
                    background: 'radial-gradient(circle, #FFFBEA 0%, #F3D98F 42%, rgba(233,201,122,0) 72%)', animation: 'floaty 4.5s ease-in-out infinite' }} />}
              </button>
            );
          })}
      </PanStrip>
      {(() => {
        const left = act.spots.length - found.length;
        return (
          <span style={{ font: '600 12px var(--ui)', color: left ? 'var(--sand-ink)' : 'var(--muted-2)', textAlign: 'center' }}>
            {found.length === 0 ? `${act.spots.length} moments to find. Use the arrow or slide the picture.`
              : left ? `${found.length} of ${act.spots.length} found. ${left === 1 ? 'One more to go.' : `${left} more to go.`}`
              : `All ${act.spots.length} moments found.`}
          </span>
        );
      })()}
      <div style={{ minHeight: 120 }}>
        <AnimatePresence mode="wait">
          {cur ? (
            <motion.div key={cur.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .45 }}
              style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 10, borderRadius: 18, background: '#fff', border: '1px solid var(--line)' }}>
              <div style={{ width: thumbAspect(cur.box, IMG_ASPECT) < 1 ? 84 : 132, flex: 'none', aspectRatio: `${thumbAspect(cur.box, IMG_ASPECT)}`, borderRadius: 12, backgroundImage: `url(${act.image})`, backgroundRepeat: 'no-repeat', ...closeView(cur.box, IMG_ASPECT) }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Words text={cur.label} active={labelOn ? m.en : -1} onLight style={{ font: '700 14px var(--ui)', color: 'var(--sand-ink)' }} />
                <Words className="pretty" text={cur.line} active={lineW >= 0 ? m.en : -1} onLight style={{ font: '500 16px/1.4 var(--serif)', color: 'var(--ink)' }} />
                {cur.ar && <span className="ar" style={{ font: '700 20px/1.6 var(--arabic)', color: 'var(--leaf)' }}>{cur.ar}</span>}
              </div>
            </motion.div>
          ) : (
            <motion.span key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'block', textAlign: 'center', font: '13px var(--ui)', color: 'var(--muted)', paddingTop: 30 }}>Tap anywhere something is happening.</motion.span>
          )}
        </AnimatePresence>
        {showLine && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4 }} style={{ textAlign: 'center', marginTop: 14 }}>
            <Words text={act.line} active={n.en} onLight style={{ font: 'italic 400 20px/1.4 var(--serif)', color: 'var(--sand-ink)' }} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
