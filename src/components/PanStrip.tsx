// A wide picture that slides sideways. Works by finger, trackpad, mouse drag, the arrow buttons and the dots,
// so a learner always sees there is more to the right and has an obvious way to get there.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';

export type PanStop = { at: number; done: boolean; label: string };

export function PanStrip({ width, aspect, stops, focus, children }: {
  width: number; aspect: number;
  /** points along the picture (0 to 100, centre of each moment) shown as dots under it; lit once done */
  stops?: PanStop[];
  /** each new value glides the picture so that point (0 to 100) is centred */
  focus?: { at: number } | null;
  children: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ left: false, right: true, view: [0, 100] as [number, number] });
  const drag = useRef<{ x: number; sl: number; moved: boolean } | null>(null);
  const wasDrag = useRef(false);

  const measure = () => {
    const el = box.current; if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ left: el.scrollLeft > 4, right: el.scrollLeft < max - 4,
      view: [(el.scrollLeft / el.scrollWidth) * 100, ((el.scrollLeft + el.clientWidth) / el.scrollWidth) * 100] });
  };
  useEffect(() => { measure(); const r = new ResizeObserver(measure); if (box.current) r.observe(box.current); return () => r.disconnect(); }, []);

  const goTo = (pct: number) => {
    const el = box.current; if (!el) return;
    el.scrollTo({ left: (pct / 100) * el.scrollWidth - el.clientWidth / 2, behavior: 'smooth' });
  };
  useEffect(() => { if (focus) goTo(focus.at); }, [focus]);
  const nudge = (dir: 1 | -1) => box.current?.scrollBy({ left: dir * box.current.clientWidth * 0.7, behavior: 'smooth' });

  // a mouse can grab the picture and drag it, like a finger; a drag never counts as a tap
  const down = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !box.current) return;
    drag.current = { x: e.clientX, sl: box.current.scrollLeft, moved: false };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current; if (!d || !box.current) return;
    if (Math.abs(e.clientX - d.x) > 6) { d.moved = true; box.current.setPointerCapture(e.pointerId); }
    if (d.moved) box.current.scrollLeft = d.sl - (e.clientX - d.x);
  };
  const up = () => { wasDrag.current = !!drag.current?.moved; drag.current = null; };

  const arrow = (dir: 1 | -1, show: boolean) => (
    <motion.button aria-label={dir > 0 ? 'Slide right' : 'Slide left'} onClick={() => nudge(dir)}
      initial={false} animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.8 }} transition={{ duration: .25 }}
      style={{ position: 'absolute', top: '50%', [dir > 0 ? 'right' : 'left']: 8, marginTop: -22, width: 44, height: 44, borderRadius: '50%', zIndex: 2,
        border: '1.5px solid var(--line-2)', background: 'rgba(255,255,255,.94)', boxShadow: '0 6px 16px rgba(14,59,46,.18)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: show ? 'auto' : 'none' }}>
      <svg width="20" height="20" viewBox="0 0 20 20" style={{ transform: dir < 0 ? 'scaleX(-1)' : undefined }}>
        <path d="M7.5 4.5 13 10l-5.5 5.5" fill="none" stroke="#0E3B2E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.button>
  );
  const fade = (side: 'left' | 'right', show: boolean) => (
    <div style={{ position: 'absolute', top: 0, bottom: 0, [side]: 0, width: 48, zIndex: 1, pointerEvents: 'none', transition: 'opacity .3s', opacity: show ? 1 : 0,
      background: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, rgba(14,59,46,.28), rgba(14,59,46,0))` }} />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--line)' }}>
        <div ref={box} className="noscroll" onScroll={measure}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
          onClickCapture={e => { if (wasDrag.current) { e.stopPropagation(); e.preventDefault(); wasDrag.current = false; } }}
          onDragStart={e => e.preventDefault()}
          style={{ overflowX: 'auto', cursor: 'grab', overscrollBehaviorX: 'contain' }}>
          <div style={{ position: 'relative', width, aspectRatio: `${aspect}` }}>{children}</div>
        </div>
        {fade('left', edge.left)}{fade('right', edge.right)}
        {arrow(-1, edge.left)}{arrow(1, edge.right)}
      </div>
      {stops && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {stops.map((s, i) => {
            const inView = s.at >= edge.view[0] && s.at <= edge.view[1];
            return (
              <button key={i} aria-label={s.label} onClick={() => goTo(s.at)}
                style={{ width: 28, height: 28, padding: 0, border: 0, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.span animate={{ scale: inView ? 1 : 0.75 }}
                  style={{ width: 12, height: 12, borderRadius: '50%', display: 'block',
                    background: s.done ? 'radial-gradient(circle, #FFFBEA 0%, #F3D98F 55%, #E1BE6A 100%)' : inView ? 'var(--line-2)' : '#fff',
                    border: `1.5px solid ${s.done ? '#D9B862' : 'var(--line-2)'}`, boxShadow: s.done ? '0 0 8px rgba(243,217,143,.9)' : 'none' }} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
