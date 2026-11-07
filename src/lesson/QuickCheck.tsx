import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DawnScene, type DawnHandle } from '../components/DawnScene';
import { RoomScene } from '../components/RoomScene';
import { Words, useNarration } from '../components/ui';
import { sfx } from '../lib/audio';
import { LanternRow } from './PracticeControl';
import { checkQuestions, type ImmersiveLesson } from '../data/lessonTypes';

const shuffled = <T,>(a: T[]) => a.map(x => [Math.random(), x] as const).sort((p, q) => p[0] - q[0]).map(([, x]) => x);

export function QuickCheck({ lesson, onDone }: { lesson: ImmersiveLesson; onDone: (firstTry: number) => void }) {
  const QC = lesson.quickCheck, qs = checkQuestions(lesson), N = qs.length;
  const scene = useRef<DawnHandle>(null);
  const n = useNarration();
  const [i, setI] = useState(-1); // -1 = intro, N = all answered
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  const misses = useRef(new Set<number>());
  const p = i >= 0 && i < N ? qs[i] : null;
  // every answer is a true sentence; only one answers this question
  const opts = useMemo(() => (p ? shuffled(qs.map((_, k) => k)) : []), [i]);

  useEffect(() => { const t = setTimeout(() => setI(0), 2600); return () => clearTimeout(t); }, []);
  useEffect(() => { if (p) { setSolved(false); n.say(p.qEn, 'en'); } }, [i]);

  const pick = (o: number) => {
    if (!p || solved) return;
    if (o === i) {
      setSolved(true); sfx.correct(); scene.current?.pulse();
      if (QC.release) scene.current?.release(); // one small light rises from the meal
      setTimeout(() => {
        if (i + 1 < N) setI(i + 1);
        else { setI(N); setTimeout(() => { setComplete(true); sfx.complete(); }, 1400); }
      }, 1000);
    } else { misses.current.add(i); sfx.retry(); setWrong(o); setTimeout(() => setWrong(null), 450); }
  };

  // the light grows with each answer, then settles into the lesson's final steady glow
  const base = QC.scene.glow ?? 0.62, fin = QC.final.glow ?? 1;
  const answered = Math.max(0, Math.min(N, i + (solved && i >= 0 && i < N ? 1 : 0)));
  // Level 5: each correct answer lights one window in the neighbourhood; at the end the light spreads across all of it
  const cue = complete ? { ...QC.scene, ...QC.final } : { ...QC.scene, glow: base + (fin - base) * 0.6 * Math.max(0, Math.min(i, N)) / N, ...(QC.windows ? { windows: answered } : {}), ...(QC.path ? { marks: answered } : {}), ...(QC.room ? { roomLit: answered } : {}), ...(QC.house ? { pillarsLit: [0, 2, 4, 5][answered] } : {}) };

  return (
    <div onPointerDown={e => scene.current?.nudge(e.clientX, e.clientY)} style={{ position: 'absolute', inset: 0, color: 'var(--paper)', userSelect: 'none' }}>
      {lesson.world === 'room' ? <RoomScene ref={scene} scene={cue} /> : <DawnScene ref={scene} scene={cue} />}
      <div style={{ position: 'absolute', inset: 0, background: lesson.world === 'room' ? 'linear-gradient(180deg, rgba(42,30,14,.6) 0%, rgba(42,30,14,.4) 50%, rgba(42,30,14,.1) 75%)' : 'linear-gradient(180deg, rgba(6,22,18,.55) 0%, rgba(6,22,18,.12) 50%, rgba(6,22,18,0) 62%)', pointerEvents: 'none' }} />
      <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1.6 }} style={{ position: 'absolute', inset: 0, background: 'var(--paper)', pointerEvents: 'none' }} />

      {/* Level 4: the three lanterns stand dim at dusk; each correct answer lights one, and the last joins them in a beam */}
      {QC.lanterns && (
        <div style={{ position: 'absolute', left: 16, right: 16, top: 96, zIndex: 2 }}>
          <LanternRow names={['Creates', 'Provides', 'Controls']} lit={[0, 1, 2].map(k => (Math.max(0, Math.min(i, N)) > k ? 1 : 0))} beam={complete} />
        </div>
      )}
      <div style={{ position: 'absolute', left: 22, right: 22, top: QC.lanterns ? 250 : 104, bottom: 28, display: 'flex', flexDirection: 'column', textShadow: '0 2px 20px rgba(4,20,16,.55)' }}>
        <AnimatePresence mode="wait">
          {i === -1 && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} style={{ textAlign: 'center', marginTop: 60 }}>
              <span className="serif" style={{ font: '500 30px/1.2 var(--serif)' }}>Can you answer without help?</span>
            </motion.div>
          )}
          {p && (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .6 }} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span className="eyebrow" style={{ color: 'var(--gold-light)', textAlign: 'center' }}>Quick check · {i + 1} of {N}</span>
              <div style={{ textAlign: 'center', marginTop: 14, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {p.qAr && <span className="ar" style={{ font: `700 ${p.qAr.length > 18 ? 28 : 34}px/1.5 var(--arabic)` }}>{p.qAr}</span>}
                <Words className="pretty" text={p.qEn} active={n.en} style={{ font: '500 24px/1.25 var(--serif)' }} />
              </div>
              <span style={{ flex: 1 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textShadow: 'none' }}>
                {opts.map(k => {
                  const o = qs[k], right = solved && k === i;
                  return (
                    <button key={k} onClick={() => pick(k)} className={wrong === k ? 'shake' : ''}
                      style={{ minHeight: N > 3 ? 56 : 62, padding: '8px 14px', borderRadius: 16, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, textAlign: 'left',
                        border: `1.5px solid ${right ? 'var(--gold-light)' : 'rgba(251,249,243,.22)'}`, background: right ? 'rgba(217,196,143,.3)' : 'rgba(10,31,24,.6)', backdropFilter: 'blur(8px)', color: 'var(--paper)', transition: 'all .25s', opacity: solved && !right ? .45 : 1 }}>
                      <span style={{ font: `700 ${N > 3 ? 14 : 16}px/1.3 var(--ui)` }}>{o.aEn}</span>
                      {o.aAr && <span className="ar" style={{ font: `700 ${o.aAr.length > 24 ? 15 : 19}px/1.5 var(--arabic)`, color: '#F6E7BD', flex: 'none', maxWidth: '52%', textAlign: 'right' }}>{o.aAr}</span>}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
          {i === N && (
            <motion.div key="end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <AnimatePresence>
                {complete && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginTop: 10 }}>
                    <motion.div initial={{ scale: .6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                      style={{ width: QC.lanterns || QC.windows || QC.house || QC.path || QC.room ? 104 : 84, height: QC.lanterns || QC.windows || QC.house || QC.path || QC.room ? 104 : 84, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #FFF6DC, #D9B45E 60%, #A8894C)', boxShadow: '0 0 0 6px rgba(251,249,243,.15), 0 0 40px rgba(246,225,170,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="seediman-mark.png" alt="" style={{ width: 50, mixBlendMode: 'multiply' }} />
                    </motion.div>
                    <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>{lesson.topic}</span>
                    <span className="serif" style={{ font: `500 ${QC.lanterns || QC.windows || QC.house || QC.path || QC.room ? 40 : 34}px/1.1 var(--serif)` }}>{QC.badge}</span>
                    {QC.summaryAr?.map(a => <span key={a} className="ar" style={{ font: `700 ${a.length > 30 ? 19 : 26}px/1.7 var(--arabic)`, color: '#F6E7BD', maxWidth: 320 }}>{a}</span>)}
                    {QC.summaryEn && <span className="pretty" style={{ font: '500 15px/1.45 var(--ui)', color: '#FFFBF0', maxWidth: 310, textShadow: '0 1px 3px rgba(4,20,16,.85), 0 2px 18px rgba(4,20,16,.8)' }}>{QC.summaryEn}</span>}
                    <span className="serif pretty" style={{ font: 'italic 400 18px/1.55 var(--serif)', color: '#FFFBF0', maxWidth: 300, textShadow: '0 1px 3px rgba(4,20,16,.85), 0 2px 18px rgba(4,20,16,.8)' }}>{QC.summary}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <span style={{ flex: 1 }} />
              {complete && (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="btn light" onClick={() => onDone(N - misses.current.size)}>Finish</motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
