import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PHASES, type ImmersiveLesson } from '../data/lessonTypes';
import { SoundToggle } from '../components/ui';
import { stopAll } from '../lib/audio';
import { Presentation } from './Presentation';
import { LearnCards } from './LearnCards';
import { Reading } from './Reading';
import { Practice } from './Practice';
import { QuickCheck } from './QuickCheck';

export interface LessonResult { stars: number; right: number; total: number }

/** Runs any immersive lesson through its five phases. */
export function ImmersiveLessonView({ lesson, startPhase = 0, onExit, onComplete, onPhase }: {
  lesson: ImmersiveLesson; startPhase?: number; onExit: () => void; onComplete: (r: LessonResult) => void; onPhase?: (p: number) => void;
}) {
  const [phase, setPhase] = useState(startPhase);
  useEffect(() => { onPhase?.(phase); }, [phase]);
  const [sub, setSub] = useState(0); // progress within the phase, 0..1
  const [stars, setStars] = useState(2);
  const dark = phase === 0 || phase === 4;
  const go = (p: number) => { stopAll(); setSub(0); setPhase(p); };

  return (
    <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0, background: dark ? '#10241f' : 'var(--paper)' }}>
      <div style={{ position: dark ? 'absolute' : 'relative', top: 0, left: 0, right: 0, zIndex: 20, padding: 'calc(var(--sb) + 6px) 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className={`icon-btn ${dark ? 'light' : ''}`} onClick={() => { stopAll(); onExit(); }} aria-label="Leave lesson">×</button>
        <div style={{ flex: 1, display: 'flex', gap: 5 }}>
          {PHASES.map((name, k) => (
            <div key={name} title={name} style={{ flex: 1, height: 6, borderRadius: 6, background: dark ? 'rgba(251,249,243,.18)' : 'var(--line)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 6, background: dark ? 'var(--gold-light)' : 'var(--leaf)', width: k < phase ? '100%' : k === phase ? `${Math.max(8, sub * 100)}%` : '0%', transition: 'width .5s ease' }} />
            </div>
          ))}
        </div>
        <SoundToggle light={dark} />
      </div>
      {!dark && <span className="eyebrow" style={{ padding: '6px 24px 0', color: 'var(--muted-2)' }}>{lesson.topic} · Level {lesson.level} · {PHASES[phase]}</span>}

      <AnimatePresence mode="wait">
        <motion.div key={phase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .4 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: dark ? 'absolute' : 'relative', inset: dark ? 0 : undefined }}>
          {phase === 0 && <Presentation lesson={lesson} onProgress={setSub} onDone={() => go(1)} />}
          {phase === 1 && <LearnCards lesson={lesson} onProgress={setSub} onDone={() => go(2)} />}
          {phase === 2 && <Reading lesson={lesson} onDone={() => go(3)} />}
          {phase === 3 && <Practice lesson={lesson} onProgress={setSub} onDone={s => { setStars(s); go(4); }} />}
          {phase === 4 && <QuickCheck lesson={lesson} onDone={right => onComplete({ stars, right, total: lesson.pillars.length })} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
