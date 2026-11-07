import { db, deviceOf, int, text, userId } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const b = req.body ?? {};
  const device = deviceOf(b), stars = int(b.stars, 1, 5);
  if (!device || !stars) return res.status(400).json({ error: 'Please choose a rating' });
  await db().query(
    'insert into seediman_ratings (device_id, user_id, display_name, stars, comment, role) values ($1,$2,$3,$4,$5,$6)',
    [device, await userId(req), text(b.name, 80), stars, text(b.comment, 2000), b.role === 'parent' || b.role === 'teacher' ? b.role : null],
  );
  res.status(204).end();
}
