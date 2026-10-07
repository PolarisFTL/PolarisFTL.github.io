import { DurableObject } from 'cloudflare:workers';

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const BOT = /bot|crawler|spider|headlesschrome|googleother|facebookexternalhit|bingpreview/i;

export class HomepageCounter extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec('CREATE TABLE IF NOT EXISTS totals (id INTEGER PRIMARY KEY CHECK (id = 1), count INTEGER NOT NULL)');
    this.sql.exec('INSERT OR IGNORE INTO totals (id, count) VALUES (1, 0)');
    this.sql.exec('CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, expires INTEGER NOT NULL)');
    this.sql.exec('CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions (expires)');
  }

  getCount() {
    return { count: this.sql.exec('SELECT count FROM totals WHERE id = 1').one().count, counted: false };
  }

  visit(token) {
    if (!/^[a-f0-9]{64}$/.test(token)) throw new Error('Invalid session');
    return this.ctx.storage.transactionSync(() => {
      const now = Date.now();
      this.sql.exec('DELETE FROM sessions WHERE expires <= ?', now);
      if (this.sql.exec('SELECT token FROM sessions WHERE token = ?', token).toArray().length) return this.getCount();
      const current = this.getCount().count;
      if (!Number.isSafeInteger(current) || current >= Number.MAX_SAFE_INTEGER) throw new Error('Counter limit');
      this.sql.exec('INSERT INTO sessions (token, expires) VALUES (?, ?)', token, now + SESSION_TTL_MS);
      this.sql.exec('UPDATE totals SET count = count + 1 WHERE id = 1');
      return { count: current + 1, counted: true };
    });
  }
}

function reply(data, status, allowedOrigin) {
  return Response.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Cache-Control': 'no-store',
      'Vary': 'Origin',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

async function limitedJSON(request) {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 512) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { return null; }
}

export default {
  async fetch(request, env) {
    const allowedOrigin = env.ALLOWED_ORIGIN;
    const origin = request.headers.get('Origin');
    const url = new URL(request.url);
    if (!allowedOrigin) return reply({ error: 'Not configured' }, 503, 'null');
    if (origin && origin !== allowedOrigin) return reply({ error: 'Origin not allowed' }, 403, allowedOrigin);
    if (url.pathname !== '/count' && url.pathname !== '/visit') return reply({ error: 'Not found' }, 404, allowedOrigin);

    if (request.method === 'OPTIONS') {
      if (origin !== allowedOrigin) return reply({ error: 'Origin not allowed' }, 403, allowedOrigin);
      return new Response(null, { status: 204, headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
      } });
    }
    if (url.pathname === '/count' && request.method !== 'GET') return reply({ error: 'Method not allowed' }, 405, allowedOrigin);
    if (url.pathname === '/visit' && request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405, allowedOrigin);
    try {
      const counter = env.VISITORS.getByName('homepage-v1');
      if (url.pathname === '/count') return reply(await counter.getCount(), 200, allowedOrigin);
      if (origin !== allowedOrigin) return reply({ error: 'Origin required' }, 403, allowedOrigin);
      if (!(request.headers.get('Content-Type') || '').toLowerCase().startsWith('application/json')) {
        return reply({ error: 'JSON required' }, 415, allowedOrigin);
      }
      const data = await limitedJSON(request);
      if (!data || data.path !== '/' || typeof data.session !== 'string' || !/^[a-f0-9]{32}$/.test(data.session)) {
        return reply({ error: 'Invalid request' }, 400, allowedOrigin);
      }
      if (BOT.test(request.headers.get('User-Agent') || '')) return reply(await counter.getCount(), 200, allowedOrigin);
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data.session));
      const token = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
      return reply(await counter.visit(token), 200, allowedOrigin);
    } catch {
      return reply({ error: 'Counter unavailable' }, 503, allowedOrigin);
    }
  }
};
