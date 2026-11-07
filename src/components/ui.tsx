import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { narrate, narratePair, playClip, stopAll, tokens, isSoundOn, setSoundOn, onSoundChange } from '../lib/audio';
import type { Evidence, IconKind } from '../data/lessonTypes';

/** Text split into tokens with the active one highlighted (read-along). */
export function Words({ text, active, className = '', style, onLight }: { text: string; active: number; className?: string; style?: CSSProperties; onLight?: boolean }) {
  const toks = tokens(text);
  const speaking = active >= 0;
  return (
    <span className={`${className} ${speaking ? 'speaking' : ''} ${onLight ? 'onlight' : ''}`} style={style}>
      {toks.map((w, i) => (
        <span key={i}>
          {/* keep ﷺ attached to the name before it */}
          <span className={`w ${i === active ? 'on' : ''}`}>{w}</span>{i < toks.length - 1 ? (toks[i + 1].startsWith('ﷺ') ? ' ' : ' ') : ''}
        </span>
      ))}
    </span>
  );
}

/** Narration state for a screen: which Arabic/English token is lit, and whether audio is running. */
export function useNarration() {
  const [ar, setAr] = useState(-1);
  const [en, setEn] = useState(-1);
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; stopAll(); }; }, []);
  const reset = () => { if (alive.current) { setAr(-1); setEn(-1); setBusy(false); } };

  const say = useCallback(async (text: string, lang: 'en' | 'ar') => {
    setBusy(true);
    const ok = await narrate(text, { lang, onWord: i => alive.current && (lang === 'ar' ? setAr(i) : setEn(i)) });
    reset(); return ok;
  }, []);
  const sayPair = useCallback(async (a: string, e: string) => {
    setBusy(true);
    const ok = await narratePair(a, e, i => alive.current && setAr(i), i => alive.current && setEn(i));
    reset(); return ok;
  }, []);
  const recite = useCallback(async (ev: Evidence) => {
    if (!ev.audio) return true; // recitation not supplied yet: the ayah is shown and its translation read
    setBusy(true);
    const ok = await playClip(ev.audio, ev.words.map(w => w.t ?? 0), Infinity, i => alive.current && setAr(i), undefined, ev.words.flatMap((w, i) => (w.t2 ? [{ t: w.t2, i }] : []))); // the whole ayah, to its natural end
    reset(); return ok;
  }, []);
  const stop = useCallback(() => { stopAll(); reset(); }, []);
  return { ar, en, busy, say, sayPair, recite, stop };
}

export function SpeakerIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16.5 8.5a5 5 0 010 7" /><path d="M19 6a8.5 8.5 0 010 12" />
    </svg>
  );
}

export function ListenBtn({ onClick, busy, label = 'Tap to hear it', dark }: { onClick: () => void; busy?: boolean; label?: string; dark?: boolean }) {
  return (
    <button onClick={e => { e.stopPropagation(); onClick(); }} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 999, cursor: 'pointer',
      border: dark ? '1px solid rgba(251,249,243,.28)' : '1.5px solid var(--line-3)',
      background: busy ? (dark ? 'rgba(217,196,143,.2)' : 'var(--sand)') : dark ? 'rgba(251,249,243,.08)' : '#fff',
      color: dark ? 'var(--paper)' : busy ? 'var(--sand-ink)' : 'var(--ink)', font: '700 14px var(--ui)', transition: 'background .2s',
    }}>
      <SpeakerIcon size={17} />{busy ? 'Playing…' : label}
    </button>
  );
}

export function SoundToggle({ light }: { light?: boolean }) {
  const [on, setOn] = useState(isSoundOn());
  useEffect(() => onSoundChange(setOn), []);
  return (
    <button className={`icon-btn ${light ? 'light' : ''}`} aria-label={on ? 'Mute narration' : 'Turn narration on'} onClick={e => { e.stopPropagation(); setSoundOn(!on); }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9h4l5-4v14l-5-4H4z" />
        {on ? <><path d="M16.5 8.5a5 5 0 010 7" /><path d="M19 6a8.5 8.5 0 010 12" /></> : <path d="M17 9l5 6M22 9l-5 6" />}
      </svg>
    </button>
  );
}

/** Abstract, softly lit icons. Light = Lord, crescent = religion, lantern = Prophet ﷺ. Never figurative. */
export function Icon3D({ kind, size = 96, float = true }: { kind: IconKind; size?: number; float?: boolean }) {
  const id = `i-${kind}`;
  return (
    <div style={{ width: size, height: size, position: 'relative', animation: float ? 'floaty 4.5s ease-in-out infinite' : undefined }}>
      <div style={{ position: 'absolute', left: '18%', right: '18%', bottom: -6, height: 10, borderRadius: '50%', background: 'rgba(14,59,46,.18)', filter: 'blur(4px)' }} />
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: 'relative', overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#FFF4D2" stopOpacity=".9" /><stop offset=".5" stopColor="#E9CF8F" stopOpacity=".35" /><stop offset="1" stopColor="#D9C48F" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-orb`} cx="38%" cy="32%" r="70%">
            <stop offset="0" stopColor="#FFFDF4" /><stop offset=".35" stopColor="#F6E3B0" /><stop offset=".8" stopColor="#C9A460" /><stop offset="1" stopColor="#A8894C" />
          </radialGradient>
          <linearGradient id={`${id}-green`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2F8A63" /><stop offset=".6" stopColor="#1F6B4C" /><stop offset="1" stopColor="#0E3B2E" />
          </linearGradient>
          <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F2DFA8" /><stop offset=".5" stopColor="#C9A460" /><stop offset="1" stopColor="#8E7038" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill={`url(#${id}-halo)`} />
        {kind === 'orb' && <>
          <circle cx="50" cy="50" r="24" fill={`url(#${id}-orb)`} />
          <ellipse cx="42" cy="40" rx="8" ry="5" fill="#fff" opacity=".7" transform="rotate(-30 42 40)" />
        </>}
        {kind === 'crescent' && <>
          <path d="M60 22a30 30 0 1 0 0 56 24 24 0 1 1 0-56z" fill={`url(#${id}-green)`} />
          <path d="M44 30a22 22 0 0 0 0 40" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M72 38l2.4 5 5.4.6-4 3.7 1.1 5.3-4.9-2.7-4.8 2.7 1-5.3-4-3.7 5.4-.6z" fill={`url(#${id}-gold)`} />
        </>}
        {kind === 'lantern' && <>
          <path d="M50 12v8" stroke="#8E7038" strokeWidth="3" strokeLinecap="round" />
          <path d="M40 24h20l-3-5H43z" fill={`url(#${id}-gold)`} />
          <path d="M38 26h24c2 10 4 18 4 28s-6 18-16 20c-10-2-16-10-16-20s2-18 4-28z" fill={`url(#${id}-green)`} />
          <path d="M44 32h12c1 7 2 13 2 21s-3 12-8 14c-5-2-8-6-8-14s1-14 2-21z" fill={`url(#${id}-orb)`} />
          <path d="M40 76h20l-2 6H42z" fill={`url(#${id}-gold)`} />
        </>}
        {kind === 'sky' && <>
          {/* open sky with a soft cloud; the small light sits above it */}
          <circle cx="50" cy="50" r="30" fill="#DCEBEF" />
          <circle cx="50" cy="50" r="30" fill="none" stroke={`url(#${id}-green)`} strokeWidth="3" />
          <circle cx="58" cy="34" r="7" fill={`url(#${id}-orb)`} />
          <path d="M31 62c0-5 4-9 9-9 2-6 8-9 14-7 4 1 7 4 8 8 5 0 8 4 8 8 0 5-4 8-9 8H39c-5 0-8-3-8-8z" fill="#fff" stroke="#C7D8D3" strokeWidth="1.5" />
        </>}
        {kind === 'sprout' && <>
          {/* the SeedIman seed with its first sprout */}
          <ellipse cx="50" cy="68" rx="17" ry="11" fill={`url(#${id}-gold)`} />
          <path d="M50 60V38" stroke={`url(#${id}-green)`} strokeWidth="4" strokeLinecap="round" />
          <path d="M50 46c-3-10-12-14-20-12 1 9 9 15 20 12z" fill={`url(#${id}-green)`} />
          <path d="M50 40c3-11 13-15 21-12-1 10-10 15-21 12z" fill={`url(#${id}-green)`} />
          <ellipse cx="44" cy="65" rx="5" ry="2.5" fill="#fff" opacity=".45" />
        </>}
        {kind === 'world' && <>
          {/* sun, mountain and crescent together: everything around us */}
          <circle cx="64" cy="32" r="11" fill={`url(#${id}-orb)`} />
          <path d="M34 26a9 9 0 1 0 8 13 7 7 0 1 1-8-13z" fill={`url(#${id}-green)`} />
          <path d="M18 76l20-28 12 15 8-9 24 22z" fill={`url(#${id}-green)`} />
          <path d="M38 48l6 7-6-2-4 4z" fill="#fff" opacity=".7" />
        </>}
        {kind === 'senses' && <>
          {/* an eye and an ear as simple lines */}
          <path d="M16 44c8-11 18-16 26-16s18 5 26 16c-8 11-18 16-26 16s-18-5-26-16z" fill="#fff" stroke={`url(#${id}-green)`} strokeWidth="3.5" strokeLinejoin="round" transform="translate(-4 -2)" />
          <circle cx="38" cy="42" r="7" fill={`url(#${id}-orb)`} />
          <path d="M66 56c0-9 6-15 13-15s12 6 12 13c0 6-3 8-6 11-3 3-3 7-7 9-4 2-8-1-8-5" fill="none" stroke={`url(#${id}-green)`} strokeWidth="3.5" strokeLinecap="round" transform="translate(-10 4)" />
          <path d="M73 57c0-4 2-7 6-7s6 3 6 6c0 3-3 4-4 6" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="3" strokeLinecap="round" transform="translate(-10 4)" />
        </>}
      </svg>
    </div>
  );
}

/** Small uppercase label + title used across lesson phases. */
export function PhaseHead({ eyebrow, title, color = 'var(--ink)', eyebrowColor = 'var(--muted-2)' }: { eyebrow: ReactNode; title?: ReactNode; color?: string; eyebrowColor?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span className="eyebrow" style={{ color: eyebrowColor }}>{eyebrow}</span>
      {title && <span className="serif pretty" style={{ font: '500 28px/1.2 var(--serif)', color }}>{title}</span>}
    </div>
  );
}
