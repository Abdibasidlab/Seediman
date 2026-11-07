// A signed in parent's progress, so it follows them to another device. The child's name is removed before it reaches here.
import { db, userId } from './_lib.js';

export default async function handler(req, res) {
  const user = await userId(req);
  if (!user) return res.status(401).json({ error: 'Please log in' });
  if (req.method === 'GET') {
    const r = await db().query('select state from seediman_progress where user_id = $1', [user]);
    return res.status(200).json({ state: r.rows[0]?.state ?? null });
  }
  if (req.method === 'PUT') {
    const state = req.body?.state;
    if (!state || typeof state !== 'object' || 'name' in state || JSON.stringify(state).length > 20000) return res.status(400).json({ error: 'Invalid progress' });
    await db().query(
      `insert into seediman_progress (user_id, state) values ($1, $2)
       on conflict (user_id) do update set state = excluded.state, updated_at = now()`,
      [user, state],
    );
    return res.status(204).end();
  }
  res.status(405).end();
}
