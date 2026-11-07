// Shared by the API routes. On Vercel, node-postgres with a pooled connection and attachDatabasePool, as Neon recommends.
import { attachDatabasePool } from '@vercel/functions';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import pg from 'pg';

let pool;
export function db() {
  if (!pool) {
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
    attachDatabasePool(pool);
  }
  return pool;
}

let jwks;
/** the signed in parent's id from a Neon Auth token, or null for a visitor without an account */
export async function userId(req) {
  const m = /^Bearer (.+)$/.exec(req.headers.authorization ?? '');
  if (!m) return null;
  jwks ??= createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL));
  try { return (await jwtVerify(m[1], jwks)).payload.sub ?? null; } catch { return null; }
}

export const text = (v, max) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
export const int = (v, lo, hi) => (Number.isInteger(v) && v >= lo && v <= hi ? v : null);
export const deviceOf = b => text(b?.deviceId, 64);
