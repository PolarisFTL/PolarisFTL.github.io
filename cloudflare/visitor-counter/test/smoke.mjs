import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';

const base = process.env.COUNTER_TEST_URL || 'http://127.0.0.1:8787';
const testURL = new URL(base);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(testURL.hostname)) {
  throw new Error('Smoke tests only run against a local Worker; production visits must not be fabricated.');
}
const origin = 'https://polarisftl.github.io';
const session = () => randomBytes(16).toString('hex');
const headers = { Origin: origin, 'Content-Type': 'application/json', 'User-Agent': 'Clover local test' };
async function visit(token, overrides = {}) {
  return fetch(base + '/visit', { method: 'POST', headers, body: JSON.stringify({ path: '/', session: token }), ...overrides });
}
const initialResponse = await fetch(base + '/count');
assert.equal(initialResponse.status, 200);
assert.equal(initialResponse.headers.get('cache-control'), 'no-store');
const initial = await initialResponse.json();
assert(Number.isSafeInteger(initial.count));
assert.equal(initial.counted, false);
const token = session();
assert.deepEqual(await (await visit(token)).json(), { count: initial.count + 1, counted: true });
assert.deepEqual(await (await visit(token)).json(), { count: initial.count + 1, counted: false });
console.log('PASS: committed count returned immediately; duplicate session is idempotent');

const repeated = session();
const results = await Promise.all(Array.from({ length: 12 }, async () => (await visit(repeated)).json()));
assert.equal(results.filter(result => result.counted).length, 1);
assert(results.every(result => result.count === initial.count + 2));
const parallel = await Promise.all(Array.from({ length: 12 }, async () => (await visit(session())).json()));
assert.equal(new Set(parallel.map(result => result.count)).size, 12);
assert.equal((await (await fetch(base + '/count')).json()).count, initial.count + 14);
console.log('PASS: concurrent repeats counted once; concurrent distinct sessions lose no increments');

assert.equal((await visit(session(), { headers: { ...headers, Origin: 'https://other.example' } })).status, 403);
assert.equal((await visit(session(), { headers: { 'Content-Type': 'application/json' } })).status, 403);
assert.equal((await visit(session(), { body: JSON.stringify({ path: '/publications/', session: session() }) })).status, 400);
assert.equal((await visit('invalid')).status, 400);
assert.equal((await visit(session(), { body: '{invalid' })).status, 400);
assert.equal((await visit(session(), { body: ' '.repeat(600) })).status, 400);
assert.equal((await visit(session(), { headers: { ...headers, 'Content-Type': 'text/plain' } })).status, 415);
assert.equal((await fetch(base + '/visit')).status, 405);
assert.equal((await fetch(base + '/missing')).status, 404);
const bot = await (await visit(session(), { headers: { ...headers, 'User-Agent': 'Googlebot' } })).json();
assert.deepEqual(bot, { count: initial.count + 14, counted: false });
const preflight = await fetch(base + '/visit', { method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'POST' } });
assert.equal(preflight.status, 204);
assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
assert.equal((await (await fetch(base + '/count')).json()).count, initial.count + 14);
console.log('PASS: CORS, homepage-only paths, payload validation, methods and basic crawler filtering');

console.log('All local Worker smoke tests passed. No production requests were sent.');
