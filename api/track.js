import { db, deviceOf, int, text, userId } from './_lib.js';

const EVENTS = new Set(['open', 'setup_done', 'phase', 'level_done', 'lesson_open', 'lesson_done']);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const b = req.body ?? {};
  const device = deviceOf(b);
  if (!device || !EVENTS.has(b.event)) return res.status(400).json({ error: 'Invalid event' });
  await db().query(
    'insert into seediman_events (device_id, user_id, event, topic, level, phase, role, age, stars) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [device, await userId(req), b.event, text(b.topic, 40), int(b.level, 0, 99), text(b.phase, 30), text(b.role, 20), int(b.age, 3, 18), int(b.stars, 0, 3)],
  );
  res.status(204).end();
}
