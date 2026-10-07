import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const supplied = process.argv[2];
if (!supplied) throw new Error('Usage: node configure-homepage.mjs https://WORKER.ACCOUNT.workers.dev');
const url = new URL(supplied);
if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
  throw new Error('Use the public HTTPS Worker origin, without a path, credentials, query or fragment.');
}
// Validate only by reading the count. Configuration never sends a visit.
const response = await fetch(url.origin + '/count', { signal: AbortSignal.timeout(15000) });
if (!response.ok) throw new Error('Worker /count is unavailable: HTTP ' + response.status);
if (response.headers.get('access-control-allow-origin') !== 'https://polarisftl.github.io') {
  throw new Error('Worker CORS must allow https://polarisftl.github.io');
}
const data = await response.json();
if (!data || !Number.isSafeInteger(data.count) || data.count < 0 || data.counted !== false) {
  throw new Error('Worker response is not a valid count.');
}
const directory = path.dirname(fileURLToPath(import.meta.url));
const config = path.resolve(directory, '../../_config.yml');
const source = fs.readFileSync(config, 'utf8');
const pattern = /(visitor_counter:\r?\n  provider: "cloudflare"\r?\n  endpoint: )"[^"\r\n]*"/;
if (!pattern.test(source)) throw new Error('Expected Cloudflare configuration was not found; no file was changed.');
fs.writeFileSync(config, source.replace(pattern, (_, prefix) => prefix + JSON.stringify(url.origin)));
console.log('Configured public Worker URL: ' + url.origin);
console.log('Current homepage sessions: ' + data.count);
console.log('Review git diff -- _config.yml, then commit and push the feature branch.');
