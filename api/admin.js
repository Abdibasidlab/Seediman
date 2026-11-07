// The owner's dashboard data. Guarded by ADMIN_PASSWORD, which lives only in the server environment.
import { createHash, timingSafeEqual } from 'node:crypto';
import { db } from './_lib.js';

const digest = s => createHash('sha256').update(String(s)).digest();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const want = process.env.ADMIN_PASSWORD;
  if (!want || !timingSafeEqual(digest(req.body?.password ?? ''), digest(want))) {
    await new Promise(r => setTimeout(r, 800));
    return res.status(401).json({ error: 'Wrong password' });
  }
  const q = db();
  const [totals, people, funnel, ratings] = await Promise.all([
    q.query(`select
      (select count(distinct device_id) from seediman_events) as visitors,
      (select count(*) from neon_auth."user") as accounts,
      (select count(distinct device_id) from seediman_events where event = 'level_done') as finishers,
      (select count(*) from seediman_ratings) as ratings,
      (select round(avg(stars), 1) from seediman_ratings) as average`),
    q.query(`with e as (
        -- one row per device; once the parent logs in on it, the row carries their account
        select device_id as who, max(user_id) as user_id, max(role) as role, max(age) as age,
          min(created_at) as first_seen, max(created_at) as last_seen,
          array_agg(distinct level order by level) filter (where event = 'phase' and level is not null) as tried,
          array_agg(distinct level order by level) filter (where event = 'level_done' and level is not null) as finished,
          array_agg(distinct topic) filter (where event = 'lesson_open' and topic is not null) as topics
        from seediman_events group by 1
      )
      select e.*, u.name, u.email from e left join neon_auth."user" u on u.id::text = e.user_id
      order by e.last_seen desc limit 500`),
    q.query(`select level, phase, count(distinct device_id) as people from seediman_events
      where event = 'phase' and level is not null group by 1, 2 order by 1`),
    q.query(`select r.stars, r.comment, r.display_name, r.role, r.created_at, u.name, u.email
      from seediman_ratings r left join neon_auth."user" u on u.id::text = r.user_id
      order by r.created_at desc limit 500`),
  ]);
  res.status(200).json({ totals: totals.rows[0], people: people.rows, funnel: funnel.rows, ratings: ratings.rows });
}
