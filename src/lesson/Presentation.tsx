import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DawnScene, type DawnHandle } from '../components/DawnScene';
import { Words } from '../components/ui';
import { narrate, narratePair, playClip, sfx, stopAll, tokens } from '../lib/audio';
import { lessonBeats, unquote, type Beat, type ImmersiveLesson, type SceneCue } from '../data/lessonTypes';

/** one tap-to-advance step; an 'ask' beat becomes three (question, prediction pause, answer) */
type Step =
  | { k: 'open' } | { k: 'close' }
  | { k: 'say'; b: Extract<Beat, { k: 'say' }> }
  | { k: 'q' | 'p' | 'a'; b: Extract<Beat, { k: 'ask' }> }
  | { k: 'state'; b: Extract<Beat, { k: 'state' }> }
  | { k: 'recite'; b: Extract<Beat, { k: 'recite' }> }
  | { k: 'list'; b: Extract<Beat, { k: 'list' }> };

const isAr = (t: string) => /[؀-ۿ]/.test(t);
/** long lines and Arabic lines are stacked one under another; short words flow in a row */
const stacked = (items: string[]) => items.some(t => isAr(t) || t.length > 26);
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const shadow = '0 2px 24px rgba(4,20,16,.6)';
/** Arabic size that keeps longer lines on one or two lines */
const arSize = (s: string, big: number) => (s.length > 28 ? big * 0.7 : s.length > 18 ? big * 0.82 : big);

export function Presentation({ lesson, onDone, onProgress }: { lesson: ImmersiveLesson; onDone: () => void; onProgress?: (f: number) => void }) {
  const P = lesson.presentation;
  const steps: Step[] = useMemo(() => [
    ...(P.opening ? [{ k: 'open' as const }] : []),
    ...lessonBeats(lesson).flatMap((b): Step[] =>
      b.k === 'ask' ? [{ k: 'q', b }, { k: 'p', b }, { k: 'a', b }] : b.k === 'say' ? [{ k: 'say', b }] : b.k === 'recite' ? [{ k: 'recite', b }] : b.k === 'list' ? [{ k: 'list', b }] : [{ k: 'state', b }]),
    ...(P.closing ? [{ k: 'close' as const }] : []),
  ], [lesson]);

  const scene = useRef<DawnHandle>(null);
  const [i, setI] = useState(0);
  const [ready, setReady] = useState(false);
  const [line, setLine] = useState(-1);
  const [w, setW] = useState(-1);
  const [wa, setWa] = useState(-1);
  const [rw, setRw] = useState(-1); // word being recited
  const [reached, setReached] = useState(-1); // furthest word recited, so each part appears as it is reached
  const [ws, setWs] = useState(-1); // word lit in a statement's line beneath
  const [lit, setLit] = useState(0); // messengers' lights lit in this step
  const litNow = useRef(0);
  const [shot, setShot] = useState<{ cue: SceneCue; caption?: string } | null>(null);
  const [leaving, setLeaving] = useState(false);
  const skip = useRef(false);
  const step = steps[i];

  // the scene builds up: every cue reached so far applies in order (a journey's shots end where its last shot is)
  const cue = useMemo(() => {
    let c: SceneCue = { ...P.start };
    for (let k = 0; k <= i; k++) {
      const s = steps[k];
      if (s.k === 'say') {
        c = { ...c, ...s.b.cue }; if (k < i || !shot) for (const sh of s.b.shots ?? []) c = { ...c, ...sh.cue };
        if (s.b.lights) c.messengers = (c.messengers ?? 0) + (k < i ? s.b.lights.names.length : lit);
      }
      if (s.k === 'q') c = { ...c, ...s.b.cueQ };
      if (s.k === 'a') c = { ...c, ...s.b.cueA };
      if (s.k === 'state' || s.k === 'recite') c = { ...c, ...s.b.cue };
      if (s.k === 'close') c = { ...c, ...P.close };
      // each word in a list lights one more small light and one more window over the neighbourhood
      if (s.k === 'list') {
        const n = k < i ? s.b.items.length : line + 1;
        c = { ...c, ...s.b.cue };
        if (s.b.adds === 'parts') c.parts = (c.parts ?? 0) + n;
        else if (s.b.adds === 'pillars') { c.pillars = (c.pillars ?? 0) + n; c.pillarsLit = (c.pillarsLit ?? 0) + n; }
        else { c.worship = (c.worship ?? 0) + n; c.windows = (c.windows ?? 0) + n; }
      }
    }
    return shot ? { ...c, ...shot.cue } : c;
  }, [i, steps, shot, line, lit]);

  useEffect(() => {
    let dead = false; skip.current = false;
    const stop = () => dead || skip.current;
    onProgress?.(i / steps.length);
    setReady(false); setW(-1); setWa(-1); setWs(-1); setLine(-1); setRw(-1); setReached(-1); setLit(0); litNow.current = 0;
    const lines = async (ls: string[]) => {
      for (let n = 0; n < ls.length; n++) {
        if (stop()) return; setLine(n);
        // a light comes on as each messenger's name is spoken
        const L = step.k === 'say' && step.b.lights?.line === n ? step.b.lights : null;
        const marks = L ? tokens(ls[n]).flatMap((t, j) => (L.names.includes(t.replace(/[.,]/g, '')) ? [j] : [])) : [];
        await narrate(ls[n], { lang: 'en', onWord: x => {
          if (dead) return; setW(x);
          const c = marks.filter(m => m <= x).length;
          if (c > litNow.current) { litNow.current = c; setLit(c); sfx.pulse(); }
        } });
        if (stop()) return; setW(-1); await sleep(500);
      }
    };
    (async () => {
      if (step.k === 'open') { await sleep(1600); await lines(P.opening!); }
      else if (step.k === 'say') {
        await sleep(step.b.shots ? 300 : 600);
        for (const sh of step.b.shots ?? []) { if (stop()) return; setShot(sh); await sleep(sh.ms); }
        if (!stop()) setShot(null);
        await lines(step.b.lines);
      } else if (step.k === 'q') {
        await sleep(700); if (stop()) return;
        if (step.b.qAr) await narratePair(step.b.qAr, step.b.qEn, x => !dead && setWa(x), x => !dead && setW(x));
        else await narrate(step.b.qEn, { lang: 'en', onWord: x => !dead && setW(x) });
      } else if (step.k === 'recite') {
        const ev = step.b.evidence;
        await sleep(900); if (stop()) return;
        if (ev.audio) await playClip(ev.audio, ev.words.map(x => x.t ?? 0), Infinity, x => { if (!dead) { setRw(x); if (x >= 0) setReached(r => Math.max(r, x)); } }, undefined, ev.words.flatMap((x, k) => (x.t2 ? [{ t: x.t2, i: k }] : [])));
        if (stop()) return; setReached(ev.words.length); setRw(-1); await sleep(500);
        await narrate(unquote(ev.en), { lang: 'en', onWord: x => !dead && setW(x) });
      } else if (step.k === 'list') {
        await sleep(700);
        for (let n = 0; n < step.b.items.length; n++) {
          if (stop()) return; setLine(n); sfx.pulse();
          if (step.b.speak) { await sleep(500); if (stop()) return; await narrate(step.b.items[n], { lang: step.b.speak, onWord: x => !dead && setW(x) }); if (stop()) return; setW(-1); await sleep(450); }
          else await sleep(1400);
        }
        await sleep(600);
      } else if (step.k === 'p') {
        await sleep(2000); // ungraded pause, just a hook
      } else if (step.k === 'a' || step.k === 'state') {
        await sleep(500); if (stop()) return;
        scene.current?.pulse();
        const [ar, en] = step.k === 'a' ? [step.b.aAr, step.b.aEn] : step.k === 'state' ? [step.b.ar, step.b.en] : ['', ''];
        if (ar) await narratePair(ar, en, x => !dead && setWa(x), x => !dead && setW(x));
        else await narrate(en, { lang: 'en', onWord: x => !dead && setW(x) });
        if (step.k === 'state' && step.b.sub) {
          if (stop()) return; setW(-1); await sleep(300); if (stop()) return;
          await narrate(step.b.sub, { lang: 'en', onWord: x => !dead && setWs(x) });
        }
      } else {
        await sleep(900);
        const pillars = lesson.pillars;
        if (P.listAnswersAtClose) {
          for (let n = 0; n < pillars.length; n++) { if (stop()) return; setLine(n); scene.current?.pulse(); sfx.pulse(); await sleep(1500); }
        } else { scene.current?.pulse(); sfx.pulse(); await sleep(1600); }
        if (stop()) return; setLine(pillars.length);
        await narrate(P.closing!, { lang: 'en', onWord: x => !dead && setW(x) });
      }
      if (!stop()) { setReady(true); setW(-1); setWa(-1); setWs(-1); }
    })();
    return () => { dead = true; stopAll(); };
  }, [i]);

  const tap = (e: React.PointerEvent) => {
    scene.current?.nudge(e.clientX, e.clientY);
    if (leaving) return;
    if (!ready) { // first tap finishes the current step
      skip.current = true; stopAll(); setW(-1); setWa(-1); setWs(-1); setShot(null);
      if (step.k === 'say' && step.b.lights) { litNow.current = step.b.lights.names.length; setLit(litNow.current); }
      if (step.k === 'recite') setReached(step.b.evidence.words.length);
      setLine(step.k === 'open' ? P.opening!.length - 1 : step.k === 'say' ? step.b.lines.length - 1 : step.k === 'list' ? step.b.items.length - 1 : step.k === 'close' ? lesson.pillars.length : -1);
      setReady(true); return;
    }
    if (i + 1 < steps.length) setI(i + 1);
    else { setLeaving(true); setTimeout(onDone, 1100); }
  };

  const ask = step.k === 'q' || step.k === 'p' || step.k === 'a' ? step.b : null;
  return (
    <div onPointerUp={tap} style={{ position: 'absolute', inset: 0, cursor: 'pointer', userSelect: 'none', color: 'var(--paper)' }}>
      <DawnScene ref={scene} scene={cue} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,22,18,.6) 0%, rgba(6,22,18,.2) 45%, rgba(6,22,18,0) 60%)', pointerEvents: 'none' }} />
      <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 2.2, ease: 'easeOut' }} style={{ position: 'absolute', inset: 0, background: '#06140f', pointerEvents: 'none' }} />

      <div style={{ position: 'absolute', left: 26, right: 26, top: 110, bottom: '40%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', textShadow: shadow }}>
        <AnimatePresence mode="wait">
          {(step.k === 'open' || step.k === 'say') && !shot && (
            <motion.div key={`lines${i}`} exit={{ opacity: 0, transition: { duration: .5 } }} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320 }}>
              {(step.k === 'open' ? P.opening! : step.b.lines).map((t, n) => (step.k === 'say' && step.b.solo ? n === line : n <= line) && (
                <motion.span key={n} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
                  className="pretty" style={{ font: `${step.k === 'open' && n === 1 ? 400 : 500} ${step.k === 'open' && n === 1 ? 19 : 23}px/1.4 var(--serif)`, color: step.k === 'open' && n === 1 ? '#E8E1CE' : 'var(--paper)' }}>
                  <Words text={t} active={n === line ? w : -1} />
                </motion.span>
              ))}
            </motion.div>
          )}

          {ask && (
            <motion.div key={`ask${i - (step.k === 'q' ? 0 : step.k === 'p' ? 1 : 2)}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: .5 } }} transition={{ duration: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '100%' }}>
              <motion.div animate={{ scale: step.k === 'a' ? .78 : 1, opacity: step.k === 'a' ? .7 : 1 }} transition={{ duration: .8 }} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {ask.qAr && <Words className="ar" text={ask.qAr} active={step.k === 'q' ? wa : -1} style={{ font: `700 ${arSize(ask.qAr, 40)}px/1.5 var(--arabic)` }} />}
                <Words className="pretty" text={ask.qEn} active={step.k === 'q' ? w : -1} style={{ font: '400 22px/1.3 var(--serif)', color: '#E8E1CE' }} />
              </motion.div>
              <div style={{ minHeight: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
                <AnimatePresence mode="wait">
                  {step.k === 'p' && (
                    <motion.span key="pred" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
                      style={{ font: 'italic 400 19px/1.4 var(--serif)', color: 'var(--gold-light)' }}>{P.predict}</motion.span>
                  )}
                  {step.k === 'a' && (
                    <motion.div key="ans" initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 1.1 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {ask.aAr && <Words className="ar" text={ask.aAr} active={wa} style={{ font: `700 ${arSize(ask.aAr, 50)}px/1.45 var(--arabic)`, color: '#F6E7BD' }} />}
                      <Words className="pretty" text={ask.aEn} active={w} style={{ font: '500 26px/1.25 var(--serif)' }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {step.k === 'list' && (
            <motion.div key={`list${i}`} exit={{ opacity: 0, transition: { duration: .5 } }} style={{ display: 'flex', flexWrap: 'wrap', flexDirection: stacked(step.b.items) ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: stacked(step.b.items) ? 8 : '10px 18px', maxWidth: 330 }}>
              {step.b.items.map((t, n) => n <= line && (
                <motion.span key={n} initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 1.1 }}
                  className={isAr(t) ? 'ar pretty' : 'pretty'} style={{ font: isAr(t) ? '700 25px/1.55 var(--arabic)' : `${step.b.speak ? '500 20px' : 'italic 400 21px'}/1.3 var(--serif)`, color: n === line ? '#F6E7BD' : '#E8E1CE' }}>
                  {step.b.speak ? <Words text={t} active={n === line ? w : -1} /> : t}</motion.span>
              ))}
            </motion.div>
          )}

          {step.k === 'state' && (
            <motion.div key={`state${i}`} initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, transition: { duration: .5 } }} transition={{ duration: 1.1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              {step.b.ar && <Words className="ar" text={step.b.ar} active={wa} style={{ font: `700 ${arSize(step.b.ar, 52)}px/1.5 var(--arabic)`, color: '#F6E7BD' }} />}
              <Words className="pretty" text={step.b.en} active={w} style={{ font: '500 26px/1.3 var(--serif)', maxWidth: 320 }} />
              {step.b.sub && <Words className="pretty" text={step.b.sub} active={ws} style={{ font: '400 19px/1.4 var(--serif)', color: '#E8E1CE', maxWidth: 320, marginTop: 8 }} />}
            </motion.div>
          )}

          {step.k === 'recite' && (() => {
            const ev = step.b.evidence, chunks = ev.chunks ?? [{ from: 0, to: ev.words.length - 1, en: unquote(ev.en) }];
            // the translation is read as one line; each part's English lights up in turn (its words start at off)
            const offs = chunks.reduce<number[]>((a, _c, n) => [...a, n ? a[n - 1] + tokens(chunks[n - 1].en).length : 0], []);
            return (
              <motion.div key={`recite${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%' }}>
                {chunks.map((c, n) => reached >= c.from && (
                  <motion.div key={n} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9 }} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div dir="rtl" className="ar" style={{ font: '700 23px/1.75 var(--arabic)', color: '#F6E7BD' }}>
                      {ev.words.slice(c.from, c.to + 1).map((wd, k) => { const idx = c.from + k; return <span key={idx} style={{ padding: '0 2px', borderRadius: 6, transition: 'all .2s', background: rw === idx ? 'rgba(246,231,189,.25)' : 'transparent', opacity: rw >= 0 && rw !== idx ? .6 : 1 }}>{wd.ar} </span>; })}
                    </div>
                    <Words className="pretty" text={c.en} active={w >= offs[n] && w < offs[n] + tokens(c.en).length ? w - offs[n] : -1} style={{ font: 'italic 400 15px/1.45 var(--serif)', color: '#E8E1CE' }} />
                  </motion.div>
                ))}
                {reached >= ev.words.length && <span style={{ font: '600 12px var(--ui)', color: 'var(--gold-light)', marginTop: 4 }}>{ev.ref}</span>}
              </motion.div>
            );
          })()}

          {step.k === 'close' && (
            <motion.div key="close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
              {P.listAnswersAtClose && lesson.pillars.map((p, n) => n <= line && (
                <motion.div key={n} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9 }} style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="ar" style={{ font: '700 24px/1.5 var(--arabic)', color: '#F6E7BD' }}>{p.aAr}</span>
                  <span style={{ font: '500 21px/1.25 var(--serif)' }}>{p.aEn}</span>
                </motion.div>
              ))}
              {line >= lesson.pillars.length && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="pretty"
                  style={{ marginTop: P.listAnswersAtClose ? 14 : 0, font: `${P.listAnswersAtClose ? 'italic 400 18px' : '500 23px'}/1.45 var(--serif)`, color: P.listAnswersAtClose ? '#E8E1CE' : 'var(--paper)', maxWidth: 310 }}>
                  <Words text={P.closing!} active={w} />
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* the book's lines fade in quietly at the bottom during a camera journey */}
      <AnimatePresence mode="wait">
        {shot?.caption && (
          <motion.div key={shot.caption} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
            className="ar" style={{ position: 'absolute', left: 20, right: 20, bottom: 86, textAlign: 'center', font: '700 24px/1.6 var(--arabic)', color: '#FFF4D6', textShadow: shadow }}>
            {shot.caption}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ready && !leaving && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: .3, duration: .8 }}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center', font: '600 13px var(--ui)', letterSpacing: '.08em', color: 'rgba(251,249,243,.85)', textShadow: shadow }}>
            <span style={{ animation: 'pulseDot 2.4s ease-in-out infinite' }}>{i + 1 < steps.length ? 'Tap to continue' : 'Tap to begin learning'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={false} animate={{ opacity: leaving ? 1 : 0 }} transition={{ duration: 1 }} style={{ position: 'absolute', inset: 0, background: 'var(--paper)', pointerEvents: 'none' }} />
    </div>
  );
}
