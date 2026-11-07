import { useEffect, useState } from 'react';

const PHASE_ORDER = ['Presentation', 'Learn', 'Reading', 'Practice', 'Quick Check'];

interface Person { who: string; name: string | null; email: string | null; role: string | null; age: number | null; first_seen: string; last_seen: string; tried: number[] | null; finished: number[] | null; topics: string[] | null }
interface Rating { stars: number; comment: string | null; display_name: string | null; role: string | null; created_at: string; name: string | null; email: string | null }
interface Data {
  totals: { visitors: string; accounts: string; finishers: string; ratings: string; average: string | null };
  people: Person[]; funnel: { level: number; phase: string; people: string }[]; ratings: Rating[];
}

const when = (d: string) => new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: 16 };
const th: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', font: '700 12px var(--ui)', color: 'var(--muted)', whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '10px', font: '14px/1.35 var(--ui)', color: 'var(--ink)', borderTop: '1px solid var(--line)', verticalAlign: 'top' };

export default function Admin() {
  const [password, setPassword] = useState('');
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'SeedIman admin';
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex'; document.head.append(m);
    document.documentElement.style.overflow = 'auto'; document.body.style.overflow = 'auto';
    document.getElementById('root')!.style.height = 'auto';
  }, []);

  const load = async (e?: React.FormEvent) => {
    e?.preventDefault(); setBusy(true); setErr(null);
    try {
      const r = await fetch('/api/admin', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password }) });
      if (r.ok) setData(await r.json()); else setErr(r.status === 401 ? 'Wrong password.' : 'Could not load the data.');
    } catch { setErr('Could not reach the server.'); }
    setBusy(false);
  };

  if (!data) return (
    <form onSubmit={load} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--paper)' }}>
      <span className="serif" style={{ font: '500 28px var(--serif)' }}>SeedIman admin</span>
      <input type="password" aria-label="Admin password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"
        style={{ height: 50, width: 'min(320px, 100%)', borderRadius: 14, border: '2px solid var(--line-3)', padding: '0 14px', font: '600 16px var(--ui)', boxSizing: 'border-box' }} />
      {err && <span role="alert" style={{ font: '600 13px var(--ui)', color: 'var(--err)' }}>{err}</span>}
      <button className="btn" style={{ width: 'min(320px, 100%)' }} disabled={busy || !password}>{busy ? 'Opening…' : 'Open'}</button>
    </form>
  );

  const t = data.totals;
  const levels = [...new Set(data.funnel.map(f => f.level))].sort((a, b) => a - b);
  const count = (l: number, p: string) => data.funnel.find(f => f.level === l && f.phase === p)?.people ?? '0';
  const stats: [string, string][] = [['Visitors', t.visitors], ['Accounts', t.accounts], ['Finished a level', t.finishers], ['Ratings', t.ratings], ['Average rating', t.average ? `${t.average} of 5` : 'None yet']];

  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 16px 60px', display: 'flex', flexDirection: 'column', gap: 26, background: 'var(--paper)', minHeight: '100vh', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span className="serif" style={{ font: '500 30px var(--serif)' }}>SeedIman admin</span>
        <button className="link-btn" onClick={() => load()}>Refresh</button>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        {stats.map(([l, v]) => <div key={l} style={card}><div style={{ font: '700 26px var(--ui)', color: 'var(--ink)' }}>{v}</div><div style={{ font: '13px var(--ui)', color: 'var(--muted)' }}>{l}</div></div>)}
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 className="serif" style={{ margin: 0, font: '500 22px var(--serif)' }}>Ratings and feedback</h2>
        {data.ratings.length === 0 && <span style={{ font: '14px var(--ui)', color: 'var(--muted)' }}>No ratings yet.</span>}
        {data.ratings.map((r, i) => (
          <div key={i} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--gold)', fontSize: 18 }} aria-label={`${r.stars} of 5`}>{'★'.repeat(r.stars)}<span style={{ color: 'var(--line-3)' }}>{'★'.repeat(5 - r.stars)}</span></span>
              <span style={{ font: '12px var(--ui)', color: 'var(--muted)' }}>{r.name ?? r.display_name ?? 'Anonymous'}{r.role ? ` · ${r.role}` : ''}{r.email ? ` · ${r.email}` : ''} · {when(r.created_at)}</span>
            </div>
            {r.comment && <p style={{ margin: '8px 0 0', font: '15px/1.45 var(--ui)', color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>{r.comment}</p>}
          </div>
        ))}
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 className="serif" style={{ margin: 0, font: '500 22px var(--serif)' }}>How far people get</h2>
        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead><tr><th style={th}>Level</th>{PHASE_ORDER.map(p => <th key={p} style={th}>{p}</th>)}</tr></thead>
            <tbody>
              {levels.map(l => <tr key={l}><td style={td}>Level {l}</td>{PHASE_ORDER.map(p => <td key={p} style={td}>{count(l, p)}</td>)}</tr>)}
              {levels.length === 0 && <tr><td style={td} colSpan={6}>No lessons opened yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 className="serif" style={{ margin: 0, font: '500 22px var(--serif)' }}>Who tried what</h2>
        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead><tr>{['Person', 'Role', 'Child age', 'Levels tried', 'Levels finished', 'Other topics', 'First seen', 'Last seen'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {data.people.map(p => (
                <tr key={p.who}>
                  <td style={td}>{p.name ?? `Visitor ${p.who.slice(0, 6)}`}{p.email && <div style={{ font: '12px var(--ui)', color: 'var(--muted)' }}>{p.email}</div>}</td>
                  <td style={td}>{p.role ?? ''}</td><td style={td}>{p.age ?? ''}</td>
                  <td style={td}>{p.tried?.join(', ') ?? ''}</td><td style={td}>{p.finished?.join(', ') ?? ''}</td><td style={td}>{p.topics?.join(', ') ?? ''}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{when(p.first_seen)}</td><td style={{ ...td, whiteSpace: 'nowrap' }}>{when(p.last_seen)}</td>
                </tr>
              ))}
              {data.people.length === 0 && <tr><td style={td} colSpan={8}>Nobody yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
