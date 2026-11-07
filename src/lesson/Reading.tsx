import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { unquote, type ImmersiveLesson } from '../data/lessonTypes';
import { SpeakerIcon, Words, useNarration } from '../components/ui';
import { narrate, stopAll } from '../lib/audio';

type Tap = { tap: string; note?: string };
const isTap = (p: object): p is Tap => 'tap' in p;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/** The passage reads itself aloud on arrival, lighting each word; bold phrases can be tapped afterwards. */
export function Reading({ lesson, onDone }: { lesson: ImmersiveLesson; onDone: () => void }) {
  const READING = lesson.reading;
  const remember = READING.remember ?? lesson.pillars.filter(p => p.aEn).map(p => ({ ar: p.aAr, en: p.aEn! }));
  const [open, setOpen] = useState<string | null>(null); // "para-part" whose note is shown
  const [along, setAlong] = useState<string | null>(null); // part being read
  const [w, setW] = useState(-1); // word lit within that part
  const [finished, setFinished] = useState(false);
  const run = useRef(0);
  const paraEls = useRef<(HTMLDivElement | null)[]>([]);
  const n = useNarration();

  // read `ids` in order, lighting word by word; any newer run (a tap, leaving) cancels this one
  const read = async (ids: string[]) => {
    const my = ++run.current;
    for (const id of ids) {
      const [pi, k] = id.split('-').map(Number);
      const part = READING.paras[pi].parts[k];
      if (run.current !== my) return false;
      setAlong(id); setW(-1);
      paraEls.current[pi]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      await narrate(unquote(isTap(part) ? part.tap : part.text).trim(), { lang: 'en', onWord: i => run.current === my && setW(i) });
    }
    if (run.current === my) { setAlong(null); setW(-1); }
    return run.current === my;
  };

  useEffect(() => {
    const all = READING.paras.flatMap((p, pi) => p.parts.map((_, k) => `${pi}-${k}`));
    let live = true;
    sleep(700).then(async () => { if (live && (await read(all))) setFinished(true); });
    return () => { live = false; run.current++; stopAll(); };
  }, []);

  const tapPhrase = (id: string) => {
    setOpen(open === id ? null : id);
    setFinished(true);
    read([id]);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="noscroll" style={{ flex: 1, overflow: 'auto', padding: '14px 24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <article style={{ padding: '22px 20px', borderRadius: 22, background: '#fff', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 className="serif" style={{ margin: 0, font: '500 28px/1.2 var(--serif)' }}>{READING.title}</h2>
          {READING.paras.map((para, pi) => {
            const note = para.parts.map((p, k) => ({ p, id: `${pi}-${k}` })).find(x => x.id === open && isTap(x.p));
            return (
              <div key={pi} ref={el => { paraEls.current[pi] = el; }}>
                <p className="pretty" style={{ margin: 0, font: '17px/1.65 var(--ui)', color: 'var(--body)' }}>
                  {para.parts.map((part, k) => {
                    const id = `${pi}-${k}`, lit = along === id;
                    const text = isTap(part) ? part.tap : part.text;
                    const lead = /^\s/.test(text) ? ' ' : '', trail = /\s$/.test(text) ? ' ' : '';
                    const words = <Words text={text.trim()} active={lit ? w : -1} onLight />;
                    if (!isTap(part)) return <span key={k}>{lead}{words}{trail}</span>;
                    return (
                      <span key={k}>{lead}
                        <b role="button" tabIndex={0} onClick={() => tapPhrase(id)} onKeyDown={e => e.key === 'Enter' && tapPhrase(id)}
                          style={{ color: 'var(--ink)', cursor: 'pointer', borderBottom: '2px dotted var(--gold)', background: open === id ? 'rgba(217,196,143,.35)' : 'transparent', borderRadius: 3, transition: 'background .2s' }}>{words}</b>
                        {trail}</span>
                    );
                  })}
                </p>
                <AnimatePresence>
                  {note && isTap(note.p) && note.p.note && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 12, background: 'var(--sand)', font: '14px/1.45 var(--ui)', color: 'var(--sand-ink)' }}>{note.p.note}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          <AnimatePresence>
            {finished && !along && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ font: '600 13px var(--ui)', color: 'var(--muted-2)' }}>Tap a bold phrase to hear it again.</motion.span>
            )}
          </AnimatePresence>
        </article>

        <div style={{ padding: 20, borderRadius: 22, background: 'var(--ink)', color: 'var(--paper)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="eyebrow" style={{ color: 'var(--gold-light)', marginBottom: 6 }}>Remember</span>
          {remember.map((r, i) => {
            const long = (r.ar?.length ?? 0) > 22;
            return (
              <button key={i} onClick={() => { run.current++; setAlong(null); if (r.ar) n.sayPair(r.ar, r.en); else n.say(r.en, 'en'); }}
                style={{ display: 'flex', flexDirection: long ? 'column-reverse' : 'row', alignItems: long ? 'stretch' : 'center', justifyContent: 'space-between', gap: long ? 2 : 10, padding: '10px 0', border: 0, borderTop: i ? '1px solid rgba(251,249,243,.12)' : 0, background: 'none', cursor: 'pointer', color: 'inherit', textAlign: 'left' }}>
                <span className="pretty" style={{ font: '500 17px/1.35 var(--serif)' }}>{r.en}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                  {r.ar && <span className="ar" style={{ font: `700 ${long ? 19 : 22}px/1.6 var(--arabic)`, color: '#F6E7BD' }}>{r.ar}</span>}
                  <SpeakerIcon size={16} color="#9FB8AB" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ flex: 'none', padding: '12px 24px 28px' }}>
        <button className="btn" onClick={onDone}>On to Practice</button>
      </div>
    </div>
  );
}
