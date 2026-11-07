import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Activity, LookSpotId } from '../data/lessonTypes';
import { Words, useNarration } from '../components/ui';
import { burstAt, sfx } from '../lib/audio';

type Look = Extract<Activity, { k: 'look' }>;
const shuffled = <T,>(a: T[]) => a.map(x => [Math.random(), x] as const).sort((p, q) => p[0] - q[0]).map(([, x]) => x);

/** where each thing sits in the 340×380 picture: hotspot centre + radius */
const SPOT: Record<LookSpotId, { x: number; y: number; r: number }> = {
  sun: { x: 262, y: 66, r: 34 }, cloud: { x: 92, y: 62, r: 30 }, bird: { x: 160, y: 108, r: 30 },
  mountain: { x: 128, y: 178, r: 40 }, sea: { x: 262, y: 262, r: 38 }, tree: { x: 76, y: 262, r: 44 }, flower: { x: 214, y: 334, r: 32 },
};

/** A calm scavenger hunt: tap something in the scene, name it, and a small mark of light settles on it. No timer, no score. */
export function LookAround({ act, onComplete }: { act: Look; onComplete: () => void }) {
  const n = useNarration();
  const [found, setFound] = useState<LookSpotId[]>([]);
  const [asking, setAsking] = useState<LookSpotId | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [lastSaid, setLastSaid] = useState<string | null>(null);
  const all = found.length === act.spots.length;
  useEffect(() => { const t = setTimeout(() => n.say(act.intro, 'en'), 400); return () => clearTimeout(t); }, []);
  useEffect(() => { if (all) onComplete(); }, [all]);

  const spot = asking ? act.spots.find(s => s.id === asking)! : null;
  const choices = useMemo(() => spot ? shuffled([spot, ...shuffled(act.spots.filter(s => s !== spot)).slice(0, 2)]) : [], [asking]);

  const tapSpot = (id: LookSpotId) => { if (!found.includes(id)) setAsking(id); };
  const choose = (label: string, ev: React.MouseEvent) => {
    if (!spot) return;
    if (label === spot.label) {
      sfx.correct();
      const svg = document.getElementById('look-scene')?.getBoundingClientRect();
      if (svg) { const k = svg.width / 340; burstAt(svg.left + SPOT[spot.id].x * k, svg.top + SPOT[spot.id].y * k); }
      setFound(f => [...f, spot.id]); setAsking(null); setLastSaid(spot.said);
      n.say(spot.said, 'en');
    } else {
      sfx.retry(); setWrong(label); setTimeout(() => setWrong(null), 450);
    }
    ev.stopPropagation();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Words className="pretty" text={act.intro} active={lastSaid ? -1 : n.en} onLight style={{ font: 'italic 400 17px/1.45 var(--serif)', color: 'var(--body)' }} />
      <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', border: '1px solid var(--line)', boxShadow: '0 12px 30px rgba(14,59,46,.1)' }}>
        <svg id="look-scene" viewBox="0 0 340 380" style={{ display: 'block', width: '100%' }}>
          <defs>
            <linearGradient id="lk-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#BFD9DE" /><stop offset=".7" stopColor="#F4E6C8" /><stop offset="1" stopColor="#F7DDB0" /></linearGradient>
            <radialGradient id="lk-sun"><stop offset="0" stopColor="#FFF8E1" /><stop offset=".55" stopColor="#F5D98C" /><stop offset="1" stopColor="#F5D98C" stopOpacity="0" /></radialGradient>
            <linearGradient id="lk-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7FB3B5" /><stop offset="1" stopColor="#4F8F95" /></linearGradient>
            <linearGradient id="lk-land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7FAE6A" /><stop offset="1" stopColor="#4E8455" /></linearGradient>
            <radialGradient id="lk-mark"><stop offset="0" stopColor="#FFFBEA" /><stop offset=".35" stopColor="#F3D98F" stopOpacity=".9" /><stop offset="1" stopColor="#E9C97A" stopOpacity="0" /></radialGradient>
          </defs>
          <rect width="340" height="380" fill="url(#lk-sky)" />
          {/* sun */}
          <circle cx="262" cy="66" r="46" fill="url(#lk-sun)" /><circle cx="262" cy="66" r="20" fill="#FBE3A0" />
          {/* cloud */}
          <path d="M58 72c0-10 8-17 18-17 3-9 12-14 21-12 7 1 12 6 14 12 9 0 15 6 15 14s-7 13-15 13H71c-7 0-13-4-13-10z" fill="#fff" opacity=".92" />
          {/* birds */}
          {[[140, 104, 1], [166, 94, .8], [182, 114, .7]].map(([x, y, s], i) => (
            <path key={i} d={`M${x - 11 * s} ${y - 3 * s}q${6 * s} -${5 * s} ${11 * s} ${3 * s}q${5 * s} -${8 * s} ${11 * s} -${3 * s}`} fill="none" stroke="#2C4A42" strokeWidth="2.2" strokeLinecap="round" />
          ))}
          {/* mountains */}
          <path d="M-10 238L60 150l38 42 34-60 60 84 36-34 60 56H-10z" fill="#9DB6A7" />
          <path d="M132 132l-14 20 10-3 6 8 7-10 8 5z" fill="#fff" opacity=".85" />
          <path d="M-10 240l52-44 40 30 50-26 70 40H-10z" fill="#7F9F8A" />
          {/* sea */}
          <path d="M150 232c60-6 130-4 200 0v70H150z" fill="url(#lk-sea)" />
          {[248, 264, 280].map((y, i) => <path key={y} d={`M${190 + i * 14} ${y}q10 -5 20 0t20 0`} fill="none" stroke="#E8F3F1" strokeWidth="1.8" strokeLinecap="round" opacity=".8" />)}
          {/* land and shore */}
          <path d="M-10 250c60-14 120-10 170 6 40 12 70 30 190 30v110H-10z" fill="url(#lk-land)" />
          <path d="M160 256c40 12 70 30 190 30v10c-120 0-150-18-194-34z" fill="#E9D7A8" />
          {/* tree */}
          <path d="M72 312c2-22 1-40 4-56h6c3 16 2 34 4 56z" fill="#6B4E33" />
          <circle cx="79" cy="236" r="30" fill="#3F7F4C" /><circle cx="58" cy="252" r="20" fill="#4C8D56" /><circle cx="101" cy="250" r="22" fill="#4C8D56" /><circle cx="80" cy="214" r="18" fill="#5B9A5C" />
          {/* flowers */}
          {[[200, 338, '#E8A0A8'], [216, 326, '#F3C969'], [232, 342, '#E8A0A8']].map(([x, y, c], i) => (
            <g key={i}><path d={`M${x} ${(y as number) + 4}v22`} stroke="#3F7F4C" strokeWidth="2" />
              {[0, 72, 144, 216, 288].map(a => <circle key={a} cx={(x as number) + 6 * Math.cos(a * Math.PI / 180)} cy={(y as number) + 6 * Math.sin(a * Math.PI / 180)} r="4.5" fill={c as string} />)}
              <circle cx={x} cy={y} r="3" fill="#FFF3C4" /></g>
          ))}

          {/* hotspots: a soft shimmer until found, then a small mark of light that stays */}
          {act.spots.map(s => {
            const p = SPOT[s.id], got = found.includes(s.id);
            return (
              <g key={s.id} role="button" aria-label={got ? s.label : 'Something in the picture'} onClick={() => tapSpot(s.id)} style={{ cursor: got ? 'default' : 'pointer' }}>
                <circle cx={p.x} cy={p.y} r={p.r} fill="transparent" />
                {!got && <circle cx={p.x} cy={p.y} r={p.r * 0.7} fill="none" stroke="#FFF6DA" strokeWidth="2" strokeDasharray="3 5" style={{ animation: 'pulseDot 2.6s ease-in-out infinite', pointerEvents: 'none' }} />}
                {got && <motion.circle cx={p.x} cy={p.y - p.r * 0.2} r={16} fill="url(#lk-mark)" initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }} transition={{ duration: .8 }} style={{ transformOrigin: `${p.x}px ${p.y - p.r * 0.2}px`, pointerEvents: 'none' }} />}
                {asking === s.id && <circle cx={p.x} cy={p.y} r={p.r * 0.8} fill="none" stroke="#F3D98F" strokeWidth="3" style={{ pointerEvents: 'none' }} />}
              </g>
            );
          })}
        </svg>
      </div>

      <AnimatePresence mode="wait">
        {spot ? (
          <motion.div key={spot.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ font: '700 15px var(--ui)', color: 'var(--ink)' }}>What is this?</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {choices.map(c => (
                <button key={c.id} onClick={e => choose(c.label, e)} className={wrong === c.label ? 'shake' : ''}
                  style={{ flex: '1 1 30%', height: 50, borderRadius: 14, border: '2px solid var(--line-2)', background: '#fff', font: '700 15px var(--ui)', color: 'var(--ink)', cursor: 'pointer' }}>{c.label}</button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key={lastSaid ?? 'start'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ minHeight: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, textAlign: 'center' }}>
            {lastSaid && <Words text={lastSaid} active={n.en} onLight style={{ font: '500 20px/1.35 var(--serif)', color: 'var(--ink)' }} />}
            <span style={{ font: '600 12px var(--ui)', color: 'var(--muted-2)' }}>
              {all ? 'You found them all. Everything here points back to your Lord.' : `${found.length} of ${act.spots.length} found · tap anything that shimmers`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
