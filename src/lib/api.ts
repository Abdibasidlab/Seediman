// Accounts through Neon Auth, and the small calls to our own API. Nothing here ever sends the child's name.
import { createAuthClient } from '@neon/auth';
import type { AppState } from './store';

const AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL as string | undefined;
export const authClient = AUTH_URL ? createAuthClient(AUTH_URL) : null;

export interface Member { name: string; email: string }

const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const put = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };
export const once = (k: string) => { if (get(k)) return false; put(k, '1'); return true; };
export const seen = (k: string) => !!get(k);
export const mark = (k: string) => put(k, '1');

/** a random id for this device, not tied to any person until they create an account */
export function deviceId() {
  let id = get('seediman:device');
  if (!id) { id = crypto.randomUUID(); put('seediman:device', id); }
  return id;
}

async function bearer(): Promise<Record<string, string>> {
  try {
    // the Neon wrapper keeps the signed JWT on the session (as its own getJWTToken does); token() only answers once
    const token = (await authClient!.getSession()).data?.session?.token;
    return token && token.split('.').length === 3 ? { Authorization: `Bearer ${token}` } : {};
  } catch { return {}; }
}

const send = async (path: string, body: object, method = 'POST') => fetch(path, {
  method, keepalive: true,
  headers: { 'content-type': 'application/json', ...(member ? await bearer() : {}) },
  body: JSON.stringify(body),
});

let member: Member | null = null;
export const setMember = (m: Member | null) => { member = m; };

export interface TrackEvent { event: string; topic?: string; level?: number; phase?: string; role?: string | null; age?: number | null; stars?: number }
/** a quiet note of what was opened, for the owner's dashboard; never gets in the way of the lesson */
export function track(e: TrackEvent) {
  if (!import.meta.env.PROD) return;
  send('/api/track', { ...e, deviceId: deviceId() }).catch(() => {});
}

export async function sendRating(stars: number, comment: string, name: string, role: string | null) {
  const r = await send('/api/rate', { deviceId: deviceId(), stars, comment, name, role });
  if (!r.ok) throw new Error('rating failed');
}

const KEEP = ['role', 'age', 'exp', 'focus', 'goal', 'pScore', 'level', 'done', 'at', 'fin', 'streak', 'today', 'hist', 'acc', 'onboarded'] as const;
type Saved = Partial<Pick<AppState, typeof KEEP[number]>>;

export async function saveProgress(s: AppState) {
  const state = Object.fromEntries(KEEP.map(k => [k, s[k]]));
  await send('/api/progress', { state }, 'PUT').catch(() => {});
}

export async function loadProgress(): Promise<Saved | null> {
  try {
    const r = await fetch('/api/progress', { headers: await bearer() });
    return r.ok ? (await r.json()).state : null;
  } catch { return null; }
}
