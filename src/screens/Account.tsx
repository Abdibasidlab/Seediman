import { useState } from 'react';
import { authClient, sendRating, type Member } from '../lib/api';

const field: React.CSSProperties = { height: 52, borderRadius: 14, border: '2px solid var(--line-3)', background: '#fff', padding: '0 16px', font: '600 16px var(--ui)', color: 'var(--ink)', outline: 'none', width: '100%', boxSizing: 'border-box' };
const label: React.CSSProperties = { font: '600 13px var(--ui)', color: 'var(--muted)' };

function Sheet({ children, onClose, closeLabel }: { children: React.ReactNode; onClose: () => void; closeLabel: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(10,31,24,.5)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="noscroll" style={{ width: '100%', maxHeight: '92%', overflow: 'auto', background: 'var(--paper)', borderRadius: '26px 26px 0 0', padding: '24px 22px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
        <button className="link-btn" onClick={onClose}>{closeLabel}</button>
      </div>
    </div>
  );
}

/** the SDK either returns or throws its error, depending on the status */
function explain(e: unknown) {
  const x = e as { message?: string; code?: string; status?: number; error?: { message?: string; code?: string } } | null;
  const m = `${x?.code ?? ''} ${x?.message ?? ''} ${x?.error?.code ?? ''} ${x?.error?.message ?? ''} ${x?.status ?? ''}`;
  if (/exist|already/i.test(m)) return 'That email already has an account. Try logging in.';
  if (/invalid|credential|password|401/i.test(m)) return 'That email or password is not right.';
  if (/fetch|network|failed to/i.test(m)) return 'We could not reach the server. Please try again.';
  return 'That did not work. Please try again.';
}

export function AuthSheet({ mode: start, onDone, onClose }: { mode: 'signup' | 'login'; onDone: (m: Member) => void; onClose: () => void }) {
  const [mode, setMode] = useState(start);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const signup = mode === 'signup';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signup && !name.trim()) return setErr('Please add your name.');
    if (password.length < 8) return setErr('Your password needs at least 8 characters.');
    setBusy(true); setErr(null);
    try {
      const r = signup
        ? await authClient!.signUp.email({ email: email.trim(), password, name: name.trim() })
        : await authClient!.signIn.email({ email: email.trim(), password });
      if (r.error) setErr(explain(r.error));
      else onDone({ name: r.data?.user?.name ?? name, email: r.data?.user?.email ?? email });
    } catch (e) { setErr(explain(e)); }
    setBusy(false);
  };

  return (
    <Sheet onClose={onClose} closeLabel="Not now">
      <span className="serif" style={{ font: '500 26px/1.2 var(--serif)' }}>{signup ? 'Create your account' : 'Welcome back'}</span>
      <span style={{ font: '14px/1.45 var(--ui)', color: 'var(--muted)' }}>{signup ? 'For the parent or teacher. It saves progress so you can continue on any device.' : 'Log in to continue where you left off.'}</span>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {signup && <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}><span style={label}>Your name</span><input style={field} value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></label>}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}><span style={label}>Email</span><input style={field} type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}><span style={label}>Password</span><input style={field} type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete={signup ? 'new-password' : 'current-password'} /></label>
        {err && <span role="alert" style={{ font: '600 13px/1.4 var(--ui)', color: 'var(--err)' }}>{err}</span>}
        <button className="btn" type="submit" disabled={busy} style={{ marginTop: 6 }}>{busy ? 'Please wait…' : signup ? 'Create account' : 'Log in'}</button>
      </form>
      <button className="link-btn" onClick={() => { setMode(signup ? 'login' : 'signup'); setErr(null); }}>{signup ? 'I already have an account' : 'Create a new account'}</button>
    </Sheet>
  );
}

export function RateSheet({ member, role: startRole, onDone, onClose }: { member: Member | null; role: 'parent' | 'teacher' | null; onDone: () => void; onClose: () => void }) {
  const [stars, setStars] = useState(0);
  const [role, setRole] = useState(startRole);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState(false);

  const submit = async () => {
    setBusy(true); setErr(false);
    try { await sendRating(stars, comment, member?.name ?? name, role); setSent(true); onDone(); } catch { setErr(true); }
    setBusy(false);
  };

  if (sent) return (
    <Sheet onClose={onClose} closeLabel="Close">
      <span className="serif" style={{ font: '500 26px/1.2 var(--serif)', textAlign: 'center' }}>Jazakum Allahu khayran</span>
      <span style={{ font: '15px/1.45 var(--ui)', color: 'var(--muted)', textAlign: 'center' }}>Thank you. Your feedback helps us make SeedIman better for every family.</span>
    </Sheet>
  );
  return (
    <Sheet onClose={onClose} closeLabel="Not now">
      <span className="serif" style={{ font: '500 26px/1.2 var(--serif)' }}>Rate SeedIman and share your feedback</span>
      <span style={{ font: '14px/1.45 var(--ui)', color: 'var(--muted)' }}>This is an early version, and your honest view shapes what we build next.</span>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '6px 0' }} role="radiogroup" aria-label="Your rating">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} role="radio" aria-checked={stars === n} aria-label={`${n} of 5`} onClick={() => setStars(n)} style={{ border: 0, background: 'none', cursor: 'pointer', font: '40px/1 var(--ui)', color: n <= stars ? 'var(--gold)' : 'var(--line-3)', padding: 2 }}>★</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }} role="radiogroup" aria-label="I am a">
        {(['parent', 'teacher'] as const).map(r => (
          <button key={r} role="radio" aria-checked={role === r} className={`optcard ${role === r ? 'on' : ''}`} onClick={() => setRole(r)} style={{ flex: 1, height: 46, justifyContent: 'center', alignItems: 'center', font: '700 15px var(--ui)' }}>{r === 'parent' ? 'I’m a parent' : 'I’m a teacher'}</button>
        ))}
      </div>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}><span style={label}>What did you like, and what should we improve? (optional)</span>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} maxLength={2000} style={{ ...field, height: 'auto', padding: 12, resize: 'none', font: '500 15px/1.4 var(--ui)' }} /></label>
      {!member && <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}><span style={label}>Your name (optional)</span><input style={field} value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></label>}
      {err && <span role="alert" style={{ font: '600 13px/1.4 var(--ui)', color: 'var(--err)' }}>That did not send. Please try again.</span>}
      <button className="btn" disabled={!stars || busy} onClick={submit}>{busy ? 'Sending…' : 'Send'}</button>
    </Sheet>
  );
}
