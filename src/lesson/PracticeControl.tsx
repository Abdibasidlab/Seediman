// Level 4 practice: Hear the Ayah (the whole ayah is recited with one part lit), Listen and Choose (a scene is read
// aloud; pick the true statement it shows), and Three Lanterns, the unit finale. Every sentence on screen is true;
// a wrong choice or drop simply floats back. Nothing here lets the child steer the world; they only sort and recognise.
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Activity } from '../data/lessonTypes';
import { ListenBtn, Words, useNarration } from '../components/ui';
import { DawnScene } from '../components/DawnScene';
import { burstOn, sfx, stopAll } from '../lib/audio';

const shuffled = <T,>(a: T[]) => a.map(x => [Math.random(), x] as const).sort((p, q) => p[0] - q[0]).map(([, x]) => x);
const Counter = ({ i, n }: { i: number; n: number }) => <span style={{ font: '700 12px var(--ui)', color: 'var(--muted-2)' }}>{i + 1} of {n}</span>;

/** one question at a time: a correct choice bursts and moves on, a wrong one shakes and can be tried again */
function useSteps(n: number, onComplete: (firstTry: number) => void) {
  const [i, setI] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<number | null>(null);
  const misses = useRef(new Set<number>());
  const refs = useRef<(HTMLElement | null)[]>([]);
  const choose = (ok: boolean, k: number) => {
    if (solved) return;
    if (ok) {
      setSolved(true); sfx.correct(); burstOn(refs.current[k]);
      setTimeout(() => { stopAll(); if (i + 1 < n) { setI(i + 1); setSolved(false); } else onComplete(n - misses.current.size); }, 1100);
    } else { misses.current.add(i); sfx.retry(); setWrong(k); setTimeout(() => setWrong(null), 450); }
  };
  return { i, solved, wrong, choose, refs };
}
const optStyle = (right: boolean): React.CSSProperties => ({
  minHeight: 60, padding: '12px 16px', borderRadius: 16, textAlign: 'left', cursor: 'pointer', font: '600 15px/1.4 var(--ui)', color: 'var(--ink)',
  border: `2px solid ${right ? 'var(--leaf)' : 'var(--line-2)'}`, background: right ? 'var(--ok-bg)' : '#fff', transition: 'all .2s',
});

/* ---------------- Hear the Ayah, Find the Meaning ---------------- */
export function AyahMeaning({ act, onComplete }: { act: Extract<Activity, { k: 'ayahMeaning' }>; onComplete: (n: number) => void }) {
  const items = useMemo(() => shuffled(act.items).slice(0, act.sample ?? 3), []);
  const s = useSteps(items.length, onComplete);
  const n = useNarration();
  const it = items[s.i], ev = it.evidence, part = ev.chunks![it.chunk];
  // the right meaning and two other true meanings from these ayat
  const opts = useMemo(() => {
    const others = act.items.flatMap(x => x.evidence.chunks!.map(c => c.en)).filter(e => e !== part.en);
    return shuffled([part.en, ...shuffled([...new Set(others)]).slice(0, 2)]);
  }, [s.i]);
  const play = () => n.recite(ev);
  useEffect(() => { const t = setTimeout(play, 500); return () => clearTimeout(t); }, [s.i]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Counter i={s.i} n={items.length} />
      <div style={{ padding: '16px 12px', borderRadius: 18, background: 'var(--sand)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div dir="rtl" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2px 4px' }}>
          {ev.words.map((w, k) => {
            const inPart = k >= part.from && k <= part.to, now = n.ar === k;
            return <span key={k} className="ar" style={{ font: `700 ${inPart ? 24 : 19}px/1.8 var(--arabic)`, padding: '0 4px', borderRadius: 8, transition: 'all .2s',
              color: inPart ? 'var(--ink)' : 'var(--muted-3)', background: now ? 'rgba(168,137,76,.3)' : inPart ? 'rgba(217,196,143,.35)' : 'transparent' }}>{w.ar}</span>;
          })}
        </div>
        <span style={{ font: '600 12px var(--ui)', color: 'var(--sand-ink)', textAlign: 'center' }}>{ev.ref}</span>
        <div style={{ display: 'flex', justifyContent: 'center' }}><ListenBtn label="Listen again" busy={n.busy} onClick={() => (n.busy ? n.stop() : play())} /></div>
      </div>
      <span style={{ font: '700 15px var(--ui)', color: 'var(--ink)' }}>What does the lit part mean?</span>
      {opts.map((o, k) => (
        <button key={o} ref={el => { s.refs.current[k] = el; }} onClick={() => s.choose(o === part.en, k)} className={s.wrong === k ? 'shake' : ''} style={optStyle(s.solved && o === part.en)}>{o}</button>
      ))}
    </div>
  );
}

/* ---------------- Listen and Choose: a short scene, three true statements ---------------- */
export function Scenes({ act, onComplete }: { act: Extract<Activity, { k: 'scenes' }>; onComplete: (n: number) => void }) {
  const items = useMemo(() => shuffled(act.items).slice(0, act.sample ?? 3), []);
  const s = useSteps(items.length, onComplete);
  const n = useNarration();
  const it = items[s.i];
  const order = useMemo(() => shuffled(act.statements.map((_, k) => k)), [s.i]);
  useEffect(() => { const t = setTimeout(() => n.say(it.scene, 'en'), 450); return () => clearTimeout(t); }, [s.i]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Counter i={s.i} n={items.length} />
      <button onClick={() => n.say(it.scene, 'en')} style={{ padding: '22px 20px', borderRadius: 20, border: 0, background: 'var(--ink)', color: 'var(--paper)', textAlign: 'left', cursor: 'pointer' }}>
        <span className="eyebrow" style={{ color: 'var(--gold-light)', display: 'block', marginBottom: 6 }}>Listen</span>
        <Words className="pretty" text={it.scene} active={n.en} style={{ font: '500 22px/1.35 var(--serif)' }} />
      </button>
      <span style={{ font: '700 15px var(--ui)', color: 'var(--ink)' }}>Which of these does it show?</span>
      {order.map((k, j) => (
        <button key={k} ref={el => { s.refs.current[j] = el; }} onClick={() => s.choose(k === it.answer, j)} className={s.wrong === j ? 'shake' : ''} style={optStyle(s.solved && k === it.answer)}>{act.statements[k]}</button>
      ))}
    </div>
  );
}

/* ---------------- the three lanterns, shared by the finale and the Quick Check ---------------- */
export function LanternRow({ names, lit, beam }: { names: string[]; lit: number[]; beam: boolean }) {
  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', padding: '0 6px' }}>
      <div style={{ position: 'absolute', left: '8%', right: '8%', top: 6, height: 2, background: 'rgba(251,249,243,.35)', borderRadius: 2 }} />
      <AnimatePresence>
        {beam && <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ duration: 1.4, ease: 'easeInOut' }}
          style={{ position: 'absolute', left: '14%', right: '14%', top: 70, height: 6, borderRadius: 6, background: 'linear-gradient(90deg, rgba(255,236,180,.2), #FFF1C9, rgba(255,236,180,.2))', boxShadow: '0 0 24px 8px rgba(255,226,150,.65)' }} />}
      </AnimatePresence>
      {names.map((name, k) => {
        const l = Math.min(1, lit[k] ?? 0);
        return (
          <div key={name} data-lantern={k} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 92 }}>
            <svg width="64" height="104" viewBox="0 0 64 104" style={{ overflow: 'visible', pointerEvents: 'none' }}>
              <defs>
                <radialGradient id={`lg${k}`}><stop offset="0" stopColor="#FFF6D8" stopOpacity={0.35 + 0.65 * l} /><stop offset=".6" stopColor="#F2C86A" stopOpacity={0.25 + 0.7 * l} /><stop offset="1" stopColor="#B8863A" stopOpacity={0.35 + 0.4 * l} /></radialGradient>
                <radialGradient id={`lh${k}`}><stop offset="0" stopColor="#FFE9A8" stopOpacity={0.75 * l} /><stop offset="1" stopColor="#FFE9A8" stopOpacity="0" /></radialGradient>
              </defs>
              <circle cx="32" cy="64" r="46" fill={`url(#lh${k})`} style={{ transition: 'all .6s' }} />
              <path d="M32 0v16" stroke="#8a6a3a" strokeWidth="2" />
              <path d="M22 16h20l-3 6H25z" fill="#6b5130" />
              <path d="M20 24h24c3 12 5 22 5 34s-7 22-17 24c-10-2-17-12-17-24s2-22 5-34z" fill={`url(#lg${k})`} stroke="#6b5130" strokeWidth="2" style={{ transition: 'all .6s' }} />
              <path d="M24 84h16l-2 6H26z" fill="#6b5130" />
            </svg>
            <span style={{ font: '700 13px var(--ui)', color: l > 0.5 ? '#FFF1C9' : 'rgba(251,249,243,.8)', textShadow: '0 1px 8px rgba(4,20,16,.8)' }}>{name}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Three Lanterns, the unit finale ---------------- */
export function Lanterns({ act, onComplete }: { act: Extract<Activity, { k: 'lanterns' }>; onComplete: () => void }) {
  // a fresh sample each play: `perLantern` statements for each lantern, mixed together
  const cards = useMemo(() => shuffled([0, 1, 2].flatMap(l => shuffled(act.cards.filter(c => c.lantern === l)).slice(0, act.perLantern))), []);
  const [placed, setPlaced] = useState<number[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const [joined, setJoined] = useState(false);
  const n = useNarration();
  const box = useRef<HTMLDivElement>(null);
  const lit = [0, 1, 2].map(l => placed.filter(c => cards[c].lantern === l).length / act.perLantern);
  const showing = cards.map((_, k) => k).filter(k => !placed.includes(k)).slice(0, 2);

  const put = (card: number, lantern: number) => {
    setSel(null);
    if (cards[card].lantern !== lantern) { sfx.retry(); setWrong(card); setTimeout(() => setWrong(null), 450); return; } // floats back, no penalty
    const p = [...placed, card]; setPlaced(p); sfx.pulse();
    const el = box.current?.querySelector(`[data-lantern="${lantern}"]`); burstOn(el ?? null);
    if (p.length === cards.length) setTimeout(() => { setJoined(true); sfx.complete(); onComplete(); setTimeout(() => n.sayPair(act.ar, act.en), 1500); }, 700);
  };
  const drop = (card: number, x: number, y: number) => {
    const el = document.elementsFromPoint(x, y).find(e => (e as HTMLElement).dataset?.lantern !== undefined) as HTMLElement | undefined;
    if (el) put(card, +el.dataset.lantern!);
  };

  return (
    <div ref={box} style={{ position: 'relative', height: 540, borderRadius: 22, overflow: 'hidden', border: '1px solid var(--line)', color: 'var(--paper)' }}>
      <DawnScene scene={{ time: 'dusk', land: 1, tree: 2, wide: true, glow: joined ? 1.4 : 0.8, settled: true }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,22,18,.35), rgba(6,22,18,.05) 55%, rgba(6,22,18,.45))', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 14 }} onClick={e => {
        const el = (e.target as HTMLElement).closest('[data-lantern]') as HTMLElement | null; if (el && sel !== null) put(sel, +el.dataset.lantern!);
      }}>
        <LanternRow names={act.names} lit={lit} beam={joined} />
      </div>
      <AnimatePresence>
        {joined && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: .6 }}
            style={{ position: 'absolute', left: 16, right: 16, top: 190, textAlign: 'center', textShadow: '0 2px 18px rgba(4,20,16,.8)' }}>
            <Words className="ar" text={act.ar} active={n.ar} style={{ font: '700 44px/1.5 var(--arabic)', color: '#FFF1C9' }} />
            <div><Words text={act.en} active={n.en} style={{ font: '500 22px var(--serif)' }} /></div>
          </motion.div>
        )}
      </AnimatePresence>
      {!joined && (
        <div style={{ position: 'absolute', left: 14, right: 14, bottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ font: '600 12px var(--ui)', color: 'rgba(251,249,243,.85)', textAlign: 'center', textShadow: '0 1px 8px rgba(4,20,16,.8)' }}>Drag each card to its lantern, or tap a card and then a lantern.</span>
          <AnimatePresence>
            {showing.map((k, j) => (
              <motion.div key={k} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: [0, -4, 0] }} exit={{ opacity: 0, scale: .8 }}
                transition={{ opacity: { duration: .5 }, y: { duration: 3 + j * 0.4, repeat: Infinity, ease: 'easeInOut' } }}
                drag dragSnapToOrigin dragElastic={0.9} whileDrag={{ scale: 1.05, zIndex: 10 }}
                onDragEnd={(e, info) => { const pe = e as PointerEvent; drop(k, pe.clientX ?? info.point.x, pe.clientY ?? info.point.y); }}
                onTap={() => setSel(s => (s === k ? null : k))} className={wrong === k ? 'shake' : ''}
                style={{ padding: '12px 16px', borderRadius: 16, cursor: 'grab', touchAction: 'none', userSelect: 'none', font: '700 15px/1.35 var(--ui)', color: 'var(--ink)', textAlign: 'center',
                  background: sel === k ? '#FFF6DA' : 'rgba(251,249,243,.94)', border: `2px solid ${sel === k ? '#E2B85C' : 'rgba(255,241,201,.7)'}`, boxShadow: '0 0 18px rgba(255,226,150,.45)' }}>
                {cards[k].text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
