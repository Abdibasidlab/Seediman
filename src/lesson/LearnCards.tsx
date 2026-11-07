import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cardLines, keyWords, spokenLead, lettersOf, unquote, type CardIcon, type CardLine, type ImmersiveLesson, type Pillar } from '../data/lessonTypes';
import type { KeyWord as KW } from '../data/lessonTypes';
import { Icon3D, ListenBtn, PhaseHead, SpeakerIcon, Words, useNarration } from '../components/ui';
import { burstOn, narrate, sfx } from '../lib/audio';

type View = { k: 'card'; i: number } | { k: 'recall'; i: number };
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const arSize = (s: string, big: number) => (s.length > 34 ? big * 0.6 : s.length > 28 ? big * 0.68 : s.length > 18 ? big * 0.8 : big);

/** a drawn icon, or a generated illustration painted on white (blended into light cards; set in a paper disc on dark ones) */
export function CardIconView({ icon, size, float = true, onDark }: { icon: CardIcon; size: number; float?: boolean; onDark?: boolean }) {
  if (typeof icon === 'string') return <Icon3D kind={icon} size={size} float={float} />;
  const img = <img src={icon.img} alt="" style={{ width: onDark ? size * 0.82 : size, height: onDark ? size * 0.82 : size, objectFit: 'contain', mixBlendMode: 'multiply' }} />;
  return (
    <div style={{ width: size, height: size, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: onDark ? 'var(--paper)' : 'transparent', animation: float ? 'floaty 4.5s ease-in-out infinite' : undefined }}>
      {img}
    </div>
  );
}

export function LearnCards({ lesson, onDone, onProgress }: { lesson: ImmersiveLesson; onDone: () => void; onProgress: (f: number) => void }) {
  const pillars = lesson.pillars;
  // a recall prompt checks the card just learned, before the next card unlocks
  const flow: View[] = useMemo(() => pillars.flatMap((p, i): View[] =>
    [{ k: 'card', i }, ...(p.recall && (i < pillars.length - 1 || p.recall.say) ? [{ k: 'recall' as const, i }] : [])]), [lesson]);
  const [pos, setPos] = useState(0);
  const [letters, setLetters] = useState(false);
  const [canGo, setCanGo] = useState(false);
  const [listening, setListening] = useState(false);
  const v = flow[pos];
  useEffect(() => { setCanGo(false); setListening(false); onProgress(pos / flow.length); }, [pos]);
  const next = () => { if (pos + 1 < flow.length) setPos(pos + 1); else onDone(); };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="noscroll" style={{ flex: 1, overflow: 'auto', padding: '14px 24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <PhaseHead eyebrow={v.k === 'card' ? `Learn · Card ${v.i + 1} of ${pillars.length}` : 'Learn · Quick recall'} eyebrowColor="var(--ink)" />
          <button onClick={() => setLetters(!letters)} aria-pressed={letters} style={{ display: 'flex', alignItems: 'center', gap: 8, border: 0, background: 'none', cursor: 'pointer', font: '600 12px var(--ui)', color: 'var(--muted)' }}>
            See the letters
            <span style={{ width: 34, height: 20, borderRadius: 20, background: letters ? 'var(--leaf)' : 'var(--line-3)', position: 'relative', transition: 'background .2s' }}>
              <span style={{ position: 'absolute', top: 2, left: letters ? 16 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 2px rgba(0,0,0,.2)' }} />
            </span>
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={pos} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: .35 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {v.k === 'card'
              ? <Card p={pillars[v.i]} letters={letters} onStarted={() => setListening(true)} onFlipped={() => setCanGo(true)} />
              : <Recall p={pillars[v.i]} pillars={pillars} onAnswered={() => setCanGo(true)} />}
          </motion.div>
        </AnimatePresence>
      </div>
      <div style={{ flex: 'none', padding: '12px 24px 28px' }}>
        <button className="btn" disabled={!canGo} onClick={next}>
          {!canGo ? (v.k === 'card' ? (listening ? 'Listen…' : 'Tap the card to reveal') : 'Answer to continue') : pos + 1 < flow.length ? (flow[pos + 1].k === 'card' && v.k === 'recall' ? 'Next card' : 'Continue') : 'On to Reading'}
        </button>
      </div>
    </div>
  );
}

const LINE_STYLE: Record<NonNullable<CardLine['kind']>, React.CSSProperties> = {
  line: { background: '#fff', border: '1.5px solid var(--line)' },
  name: { background: 'radial-gradient(circle at 50% 0%, #FFF8E4, #F3E6C2)', border: '1.5px solid var(--gold-light)', textAlign: 'center' },
  turn: { background: 'var(--ok-bg)', border: '1.5px solid #CFE0D6' },
  promise: { background: 'var(--sand)', border: '1.5px solid #E6D6A8' },
};

function Card({ p, letters, onStarted, onFlipped }: { p: Pillar; letters: boolean; onStarted: () => void; onFlipped: () => void }) {
  // front → answer (Arabic, then English) → lines one after another → ayah (recited, then translation read) → done
  const [stage, setStage] = useState<'front' | 'answer' | 'lines' | 'ayah' | 'done'>('front');
  const [shown, setShown] = useState(-1);
  const [on, setOn] = useState(-1); // which line is being read
  const [leadW, setLeadW] = useState(-1);
  const flipped = stage !== 'front';
  const lines = cardLines(p);
  const n = useNarration(), sq = useNarration(), ev = useNarration(), wd = useNarration(), ch = useNarration();
  const [chip, setChip] = useState<string | null>(null); // the tapped chip being read
  // a line with small cards waits until the child has tapped and heard every one before the card goes on
  const kws = keyWords(p);
  const [kw, setKw] = useState(-1); // the key word being read
  const [heard, setHeard] = useState<string[]>([]);
  const [waiting, setWaiting] = useState(-1);
  const heardRef = useRef(new Set<string>());
  const release = useRef<(() => void) | null>(null);
  const sayChip = async (key: string, c: { ar: string; en: string }) => {
    setChip(key); await ch.sayPair(c.ar, c.en); if (!alive.current) return;
    setChip(k => (k === key ? null : k));
    heardRef.current.add(key); setHeard([...heardRef.current]);
    const j = +key.split('-')[0];
    if (release.current && lines[j].chips!.every((_, k) => heardRef.current.has(`${j}-${k}`))) { release.current(); release.current = null; }
  };
  const evBox = useRef<HTMLDivElement>(null), end = useRef<HTMLDivElement>(null);
  // long ayat get a compact grid, and the lit word is kept in view as the reciter moves on
  const wordEls = useRef<(HTMLDivElement | null)[]>([]);
  const long = (p.evidence?.words.length ?? 0) > 12;
  useEffect(() => { if (ev.ar >= 0) wordEls.current[ev.ar]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [ev.ar]);
  const lineEls = useRef<(HTMLDivElement | null)[]>([]);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const ORDER = ['front', 'answer', 'lines', 'ayah', 'done'];
  const past = (s: typeof stage) => ORDER.indexOf(stage) >= ORDER.indexOf(s);

  const playEvidence = async () => {
    if (!p.evidence) return;
    // an ayah is recited; a hadith is read by the narrator
    if (!(await (p.evidence.text ? ev.say(p.evidence.text, 'ar') : ev.recite(p.evidence))) || !alive.current) return;
    await sleep(450);
    if (alive.current) await ev.say(unquote(p.evidence.en), 'en');
  };
  const readLine = async (j: number) => {
    const L = lines[j];
    setOn(j);
    if (spokenLead(L)) { await narrate(L.lead!, { lang: 'en', onWord: x => alive.current && setLeadW(x) }); if (alive.current) setLeadW(-1); await sleep(250); }
    if (!alive.current) return;
    if (L.ar) await sq.sayPair(L.ar, L.en); else await sq.say(L.en, 'en');
    if (alive.current) setOn(-1);
  };

  const flip = async () => {
    if (flipped) return;
    setStage('answer'); onStarted();
    await sleep(500); if (!alive.current) return;
    for (let k = 0; k < kws.length; k++) { const q = kws[k]; setKw(k); await (q.ar ? wd.sayPair(q.ar, q.en) : wd.say(q.en, 'en')); if (!alive.current) return; await sleep(300); }
    setKw(-1);
    if (p.aEn) { if (p.aAr) await n.sayPair(p.aAr, p.aEn); else await n.say(p.aEn, 'en'); }
    else if (p.qEn) await n.say(p.qEn, 'en');
    if (!alive.current) return;
    if (lines.length) {
      setStage('lines');
      for (let j = 0; j < lines.length; j++) {
        setShown(j);
        await sleep(350);
        lineEls.current[j]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await sleep(450); if (!alive.current) return;
        if (lines[j].kind === 'name') sfx.pulse();
        await readLine(j); if (!alive.current) return;
        if (lines[j].chips) { setWaiting(j); await new Promise<void>(res => { release.current = res; }); if (!alive.current) return; setWaiting(-1); await sleep(400); }
        await sleep(350);
      }
    }
    if (p.evidence) {
      setStage('ayah');
      await sleep(250);
      evBox.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await sleep(900); if (!alive.current) return;
      await playEvidence(); if (!alive.current) return;
    }
    setStage('done'); onFlipped();
    await sleep(450);
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  return (
    <div style={{ perspective: 1200 }}>
      <AnimatePresence mode="wait" initial={false}>
        {!flipped ? (
          <motion.button key="front" onClick={flip} exit={{ rotateY: 90, transition: { duration: .28, ease: 'easeIn' } }}
            style={{ width: '100%', minHeight: 420, border: '1px solid var(--line)', borderRadius: 28, background: 'linear-gradient(180deg,#fff 0%,#F7F3E8 100%)', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, boxShadow: '0 18px 40px rgba(14,59,46,.08)', padding: 24 }}>
            {p.image
              ? <img src={p.image} alt="" style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 18, border: '1px solid var(--line)' }} />
              : <CardIconView icon={p.icon} size={typeof p.icon === 'string' ? 120 : 150} />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {p.qAr && <span className="ar" style={{ font: `700 ${arSize(p.qAr, 38)}px/1.5 var(--arabic)`, color: 'var(--ink)' }}>{p.qAr}</span>}
              <span className="pretty" style={{ font: `500 ${p.qAr ? 22 : 26}px/1.3 var(--serif)`, color: 'var(--ink)' }}>{p.qEn}</span>
            </div>
            {kws.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>{kws.map(w => <KeyWord key={w.tr} w={w} compact={kws.length > 1} />)}</div>}
            <span style={{ font: '600 13px var(--ui)', color: 'var(--muted-2)', animation: 'pulseDot 2.4s ease-in-out infinite' }}>Tap to reveal</span>
          </motion.button>
        ) : (
          <motion.div key="back" initial={{ rotateY: -90 }} animate={{ rotateY: 0 }} transition={{ duration: .34, ease: 'easeOut' }}
            style={{ borderRadius: 28, background: '#fff', border: '1px solid var(--line)', boxShadow: '0 18px 40px rgba(14,59,46,.08)', overflow: 'hidden' }}>
            <div style={{ padding: '24px 22px 22px', background: 'var(--ink)', color: 'var(--paper)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
              {kws.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>{kws.map((w, k) => <KeyWord key={w.tr} w={w} dark ar={kw === k ? wd.ar : -1} en={kw === k ? wd.en : -1} />)}</div>}
              {p.aEn ? <>
                <span className="pretty" style={{ font: '500 15px/1.4 var(--serif)', color: '#B9CCC2' }}>{p.qAr && <><span className="ar" style={{ font: '700 18px var(--arabic)' }}>{p.qAr}</span> · </>}{p.qEn}</span>
                {p.aAr && <Words className="ar" text={p.aAr} active={n.ar} style={{ font: `700 ${arSize(p.aAr, 46)}px/1.5 var(--arabic)`, color: '#F6E7BD' }} />}
                <Words className="pretty" text={p.aEn} active={n.en} style={{ font: '500 24px/1.25 var(--serif)' }} />
              </> : <Words className="pretty" text={p.qEn} active={n.en} style={{ font: '500 26px/1.3 var(--serif)' }} />}
              <AnimatePresence>
                {stage === 'done' && p.aEn && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 8 }}>
                    <ListenBtn dark label="Hear it again" busy={n.busy} onClick={() => n.busy ? n.stop() : p.aAr ? n.sayPair(p.aAr, p.aEn!) : n.say(p.aEn!, 'en')} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {letters && p.aAr && (
              <div style={{ padding: '16px 20px 4px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {lettersOf(p.aAr).map(wd => (
                  <div key={wd.word} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span className="ar" style={{ font: '700 22px var(--arabic)', color: 'var(--ink)', textAlign: 'right' }}>{wd.word}</span>
                    <div style={{ display: 'flex', flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 }}>
                      {wd.letters.map(([l, name], i) => (
                        <div key={i} style={{ minWidth: 48, padding: '6px 8px', borderRadius: 12, background: 'var(--sand)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span className="ar" style={{ font: '700 26px/1.3 var(--arabic)', color: 'var(--ink)' }}>{l}</span>
                          <span style={{ font: '600 10.5px var(--ui)', color: 'var(--sand-ink)' }}>{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* lines revealed one after another; tap any to hear it again */}
            {lines.length > 0 && past('lines') && (
              <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {lines.map((L, j) => j <= shown && (
                  <motion.div key={j} ref={el => { lineEls.current[j] = el; }} initial={{ opacity: 0, y: 10, scale: L.kind === 'name' ? .96 : 1 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: L.kind === 'name' ? .9 : .5 }}
                    role="button" tabIndex={0} onClick={() => stage === 'done' && readLine(j)}
                    style={{ ...LINE_STYLE[L.kind ?? 'line'], padding: '10px 14px', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 2, cursor: stage === 'done' ? 'pointer' : 'default', transition: 'box-shadow .25s',
                      boxShadow: on === j ? '0 0 0 3px rgba(217,180,94,.45)' : L.kind === 'name' ? '0 0 26px rgba(233,207,143,.55)' : 'none' }}>
                    {L.lead && <Words text={L.lead} active={on === j ? leadW : -1} onLight style={{ font: '700 13px/1.4 var(--ui)', color: L.kind === 'turn' ? 'var(--leaf)' : 'var(--sand-ink)' }} />}
                    {L.qAr && <span className="ar" style={{ font: '700 15px/1.6 var(--arabic)', color: 'var(--muted)', textAlign: 'right' }}>{L.qAr}</span>}
                    {L.ar && <Words className="ar" text={L.ar} active={on === j ? sq.ar : -1} onLight style={{ font: `700 ${L.kind === 'name' ? arSize(L.ar, 34) : arSize(L.ar, 23)}px/1.6 var(--arabic)`, color: 'var(--ink)', textAlign: L.kind === 'name' ? 'center' : 'right' }} />}
                    <div style={{ display: 'flex', justifyContent: L.kind === 'name' ? 'center' : 'space-between', alignItems: 'center', gap: 8 }}>
                      <Words className="pretty" text={L.en} active={on === j ? sq.en : -1} onLight style={{ font: `${L.kind === 'promise' ? 'italic 400 16px' : '600 14px'}/1.4 ${L.kind === 'promise' ? 'var(--serif)' : 'var(--ui)'}`, color: 'var(--body)' }} />
                      {stage === 'done' && L.kind !== 'name' && <SpeakerIcon size={15} color="var(--muted-2)" />}
                    </div>
                    {L.chips && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }} onClick={e => e.stopPropagation()}>
                        {L.chips.map((c, k) => { const key = `${j}-${k}`, lit = chip === key, done = heard.includes(key); return (
                          <button key={key} onClick={() => sayChip(key, c)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, padding: '6px 10px', borderRadius: 12, cursor: 'pointer', flex: '1 1 30%',
                            border: `1.5px solid ${lit ? 'var(--gold-light)' : done ? '#CFE0D6' : waiting === j ? 'var(--gold-light)' : 'var(--line-2)'}`, background: lit ? 'var(--sand)' : done ? 'var(--ok-bg)' : '#fff', transition: 'all .2s',
                            animation: waiting === j && !done && !lit ? 'pulseDot 2.4s ease-in-out infinite' : undefined }}>
                            <Words className="ar" text={c.ar} active={lit ? ch.ar : -1} onLight style={{ font: '700 18px/1.6 var(--arabic)', color: 'var(--ink)' }} />
                            <Words text={c.en} active={lit ? ch.en : -1} onLight style={{ font: '600 12px/1.3 var(--ui)', color: 'var(--sand-ink)', textAlign: 'center' }} />
                          </button>
                        ); })}
                        {waiting === j && <span style={{ flex: '1 1 100%', textAlign: 'center', font: '700 12px var(--ui)', color: 'var(--leaf)', marginTop: 2 }}>{L.chips.filter((_, k) => heard.includes(`${j}-${k}`)).length} of {L.chips.length} heard</span>}
                      </div>
                    )}
                    {L.note && <span className="pretty" style={{ font: '12.5px/1.45 var(--ui)', color: 'var(--sand-ink)', marginTop: 4 }}>{L.note}</span>}
                    {L.kind === 'turn' && stage !== 'lines' && <span style={{ font: '700 12px var(--ui)', color: 'var(--leaf)', marginTop: 2 }}>Now say it aloud.</span>}
                  </motion.div>
                ))}
                {stage === 'done' && <span style={{ font: '600 12px var(--ui)', color: 'var(--muted-2)', textAlign: 'center' }}>Tap any line to hear it.</span>}
              </div>
            )}

            {/* the evidence: always shown, recited word by word with each meaning lit beneath, then its translation read */}
            <AnimatePresence>
              {p.evidence && past('ayah') && (
                <motion.div ref={evBox} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} style={{ padding: '16px 16px 18px' }}>
                  <div style={{ padding: '16px 12px', borderRadius: 18, background: 'var(--sand)', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'stretch' }}>
                    <span className="eyebrow" style={{ color: 'var(--sand-ink)', textAlign: 'center' }}>Where do we know this from?</span>
                    {p.evidence.text && <Words className="ar" text={p.evidence.text} active={ev.ar} onLight style={{ font: '700 22px/1.9 var(--arabic)', color: 'var(--ink)', textAlign: 'center' }} />}
                    <div dir="rtl" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 2px' }}>
                      {p.evidence.words.map((wd, i) => {
                        const lit = ev.ar === i, dim = ev.ar >= 0 && !lit;
                        return (
                          <div key={i} ref={el => { wordEls.current[i] = el; }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: long ? '1px 5px 4px' : '2px 8px 6px', scrollMarginBlock: 90, borderRadius: 12, transition: 'background .25s, opacity .25s', background: lit ? 'rgba(168,137,76,.2)' : 'transparent', opacity: dim ? .4 : 1 }}>
                            <span className="ar" style={{ font: `700 ${long ? 23 : 30}px/${long ? 1.5 : 1.7} var(--arabic)`, color: lit ? 'var(--leaf)' : 'var(--ink)', transition: 'color .25s' }}>{wd.ar}</span>
                            <span dir="ltr" style={{ font: `${lit ? 700 : 600} ${long ? 10.5 : 12}px/1.2 var(--ui)`, color: lit ? 'var(--leaf)' : 'var(--sand-ink)', maxWidth: long ? 80 : 96, textAlign: 'center', transition: 'color .25s' }}>{wd.en}</span>
                          </div>
                        );
                      })}
                    </div>
                    <span className="pretty" style={{ font: 'italic 400 18px/1.45 var(--serif)', color: 'var(--body)', textAlign: 'center' }}>
                      “<Words text={unquote(p.evidence.en)} active={ev.en} onLight />”
                    </span>
                    <span style={{ font: '600 12px var(--ui)', color: 'var(--sand-ink)', textAlign: 'center' }}>{p.evidence.ref}</span>
                    <AnimatePresence>
                      {stage === 'done' && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'center' }}>
                          <ListenBtn label={p.evidence.audio ? 'Listen to the ayah' : 'Hear it again'} busy={ev.busy} onClick={() => ev.busy ? ev.stop() : playEvidence()} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* evidence still to be supplied: visible while building, never in production */}
            {import.meta.env.DEV && p.evidencePending && stage === 'done' && (
              <div style={{ margin: '12px 16px 0', padding: '12px 14px', borderRadius: 14, border: '2px dashed var(--gold)', background: 'var(--sand)', font: '700 13px/1.45 var(--ui)', color: 'var(--sand-ink)', textAlign: 'center' }}>{p.evidencePending}</div>
            )}

            {p.parentsNote && stage === 'done' && (
              <details style={{ margin: '0 16px 12px', padding: '10px 14px', borderRadius: 14, background: 'var(--track)', font: '13px/1.5 var(--ui)', color: 'var(--body-2)' }}>
                <summary style={{ cursor: 'pointer', font: '700 13px var(--ui)', color: 'var(--ink)' }}>For parents</summary>
                <p className="pretty" style={{ margin: '8px 0 2px' }}>{p.parentsNote}</p>
              </details>
            )}

            <div ref={end}>
              <AnimatePresence>
                {stage === 'done' && p.aAr && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 }} style={{ padding: '4px 20px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ font: '800 15px var(--ui)', color: 'var(--leaf)' }}>Your turn.</span>
                    <span style={{ font: '15px/1.45 var(--ui)', color: 'var(--body)' }}>Say the answer aloud: <span className="ar" style={{ font: '700 20px var(--arabic)', color: 'var(--ink)' }}>{p.aAr}</span></span>
                  </motion.div>
                )}
              </AnimatePresence>
              {!p.aAr && <div style={{ height: 16 }} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Recall({ p, pillars, onAnswered }: { p: Pillar; pillars: Pillar[]; onAnswered: () => void }) {
  const n = useNarration();
  const [done, setDone] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const R = p.recall!;
  // listed options in their authored order (so "All of the above" stays last), or this card's answer and two others, shuffled
  const opts = useMemo(() => {
    if (R.say) return [];
    if (R.options) return R.options.map((en, i) => ({ en, ar: '', right: i === R.answer }));
    const others = pillars.filter(o => o !== p && o.aEn).sort(() => Math.random() - 0.5).slice(0, 2);
    return [p, ...others].sort(() => Math.random() - 0.5).map(o => ({ en: o.aEn!, ar: o.aAr ?? '', right: o === p }));
  }, [p]);
  useEffect(() => { n.say(R.prompt, 'en'); }, []);

  const pick = (right: boolean, i: number) => {
    if (done) return;
    if (right) {
      setDone(true); setPicked(i); sfx.correct(); burstOn(refs.current[i]); onAnswered();
      if (R.feedback) setTimeout(() => n.say(R.feedback!, 'en'), 500);
    } else { sfx.retry(); setWrong(i); setTimeout(() => setWrong(null), 450); }
  };
  const said = (ev?: React.MouseEvent) => { if (!done) { setDone(true); onAnswered(); if (R.say) { sfx.correct(); burstOn(ev?.currentTarget ?? null); } else if (p.aAr && p.aEn) n.sayPair(p.aAr, p.aEn); } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 18px', borderRadius: 22, background: 'var(--ink)', color: 'var(--paper)' }}>
        <CardIconView icon={p.icon} size={56} float={false} onDark />
        <Words text={R.prompt} active={done && R.feedback ? -1 : n.en} className="pretty" style={{ font: '500 21px/1.3 var(--serif)' }} />
      </div>
      <span style={{ font: '13px var(--ui)', color: 'var(--muted)' }}>{R.instruction ?? (R.say ? 'Say them out loud, then tap below. Nothing is scored.' : 'Tap the answer, or say it and tap “I said it”. This is practice, nothing is scored.')}</span>
      {opts.map((o, i) => {
        const lit = done && (R.options ? picked === i : o.right);
        return (
          <button key={o.en} ref={el => { refs.current[i] = el; }} onClick={() => pick(o.right, i)} className={wrong === i ? 'shake' : ''}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '14px 16px', minHeight: 64, borderRadius: 16, cursor: done ? 'default' : 'pointer', textAlign: 'left',
              border: `2px solid ${lit ? 'var(--leaf)' : 'var(--line-2)'}`, background: lit ? 'var(--ok-bg)' : '#fff', opacity: done && !lit ? .5 : 1, transition: 'all .2s' }}>
            <span style={{ font: '700 16px/1.3 var(--ui)', color: 'var(--ink)' }}>{o.en}</span>
            {o.ar && <span className="ar" style={{ font: '700 19px var(--arabic)', color: 'var(--leaf)', flex: 'none', maxWidth: '55%' }}>{o.ar}</span>}
          </button>
        );
      })}
      {done && R.feedback && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '12px 16px', borderRadius: 14, background: 'var(--ok-bg)', font: '600 16px/1.4 var(--ui)', color: 'var(--leaf)', textAlign: 'center' }}>
          <Words text={R.feedback} active={n.en} onLight />
        </motion.div>
      )}
      {R.say
        ? <button className={done ? 'btn leaf' : 'btn'} style={{ height: 52 }} onClick={e => said(e)} disabled={done}>{done ? 'Done' : 'I said them'}</button>
        : !done && !R.options && <button className="link-btn" onClick={() => said()}>I said it aloud</button>}
    </div>
  );
}

/** a key word as a small chip: the Arabic, a simple transliteration and one line of meaning */
function KeyWord({ w, dark, ar = -1, en = -1, compact }: { w: KW; dark?: boolean; ar?: number; en?: number; compact?: boolean }) {
  if (compact) return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, padding: '4px 10px', borderRadius: 12, background: 'var(--sand)', border: '1px solid #E6D6A8' }}>
      {w.ar && <span className="ar" style={{ font: '700 18px/1.5 var(--arabic)', color: 'var(--ink)' }}>{w.ar}</span>}
      <span style={{ font: '700 11px var(--ui)', color: 'var(--sand-ink)' }}>{w.tr}</span>
    </span>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', borderRadius: 16, maxWidth: 340, textAlign: 'left',
      background: dark ? 'rgba(251,249,243,.08)' : 'var(--sand)', border: `1px solid ${dark ? 'rgba(251,249,243,.2)' : '#E6D6A8'}` }}>
      {w.ar && <Words className="ar" text={w.ar} active={ar} onLight={!dark} style={{ font: '700 24px/1.5 var(--arabic)', color: dark ? '#F6E7BD' : 'var(--ink)', flex: 'none' }} />}
      <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ font: '800 11px var(--ui)', letterSpacing: '.08em', textTransform: 'uppercase', color: dark ? 'var(--gold-light)' : 'var(--sand-ink)' }}>Key word · {w.tr}</span>
        <Words text={w.en} active={en} onLight={!dark} style={{ font: '600 13px/1.35 var(--ui)', color: dark ? '#E8E1CE' : 'var(--body)' }} />
      </span>
    </div>
  );
}
