# Clover homepage counter

This backend keeps the homepage on GitHub Pages and supplies the existing Asta sign with a fresh server count. SQLite transactions increment the homepage total and record an anonymous session together, so concurrent visits do not lose increments and duplicate requests do not increment twice.

## Cost

Checked against Cloudflare documentation on **2026-10-07**. Use the **Workers Free** plan with the configured **SQLite** Durable Object (`new_sqlite_classes`). Confirm your Workers plan in **Workers & Pages** before deploying.

| Resource | Free allowance |
| --- | --- |
| Worker requests | 100,000/day |
| Durable Object requests | 100,000/day |
| Durable Object duration | 13,000 GB-s/day |
| SQLite rows read | 5,000,000/day |
| SQLite rows written | 100,000/day |
| SQLite storage | 5 GB total |

The allowance is shared with other applications in the account. A browser visit may generate a CORS preflight plus a POST, and a new session uses multiple database writes; request limits are not visitor limits. Typical academic-homepage traffic should fit, but actual usage determines this. Free-plan operations stop at their limits and reset daily; the free tier does not automatically charge for overages. Workers Paid starts at $5/month if you choose that account plan. This project does not change your subscription.

Sources: [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/).

## Mac setup and deployment

Install **Node.js 22 or newer** (Node.js LTS is suitable), which supplies `npm` and `npx`. From the repository root:

```bash
cd cloudflare/visitor-counter
npm install
npm run dev
```

Keep that local server running. In a second terminal, enter the same service folder and run:

```bash
npm test
```

The smoke test only accepts a localhost URL. It checks immediate counts, repeated sessions, concurrent visits, CORS, invalid input and basic crawler exclusion, without contacting production. Stop the first terminal with **Ctrl+C** after the test passes. Then:

```bash
npx wrangler login
npx wrangler whoami
npm run deploy
```

Login opens Cloudflare in your browser; choose your account. Wrangler creates the binding and SQLite Durable Object from `wrangler.toml`. No manual database creation or API token in the website is needed. The official [counter example](https://developers.cloudflare.com/durable-objects/examples/build-a-counter/) documents the underlying setup.

Deployment prints your actual public URL, such as `https://clover-homepage-counter.YOUR-SUBDOMAIN.workers.dev`. Open that URL with `/count` appended. An unused service returns `{"count":0,"counted":false}`. Checking `/count` does not increment anything.

Replace the example URL in the following command with the one Wrangler printed:

```bash
node configure-homepage.mjs 'https://clover-homepage-counter.YOUR-SUBDOMAIN.workers.dev'
cd ../..
git diff -- _config.yml
git add _config.yml
git commit -m "chore: configure Cloudflare visitor counter"
git push -u origin codex/clover-realtime-counter
```

After the feature branch's GitHub build succeeds, merge it into main using your usual workflow. Reload the published homepage. Clover shows the server count; Academic remains clean while also counting homepage sessions. `/count` can be used to verify the actual server total. Website configuration contains only a public URL.

If your Mac already has the repository's Ruby/Bundler environment, also run `bundle install` and `JEKYLL_ENV=production bundle exec jekyll build` before pushing. The feature branch's GitHub workflow runs the existing lockfile build and must succeed before main is merged.

## API and operation

- `GET /count`: read the latest total, never increments.
- `POST /visit`: accepts JSON `{ "path": "/", "session": "32 lowercase hexadecimal characters" }` from the configured homepage Origin. Returns `{ "count": 1, "counted": true }` after committing a new session. Duplicates return the current total with `counted: false`.
- `OPTIONS`: CORS preflight. The allowed origin is `https://polarisftl.github.io` by default. Change `ALLOWED_ORIGIN` in `wrangler.toml` when using a custom homepage domain, then redeploy.
- Responses use `Cache-Control: no-store`. There is no continuous polling or long-lived connection. Expired session hashes are deleted on the next visit.
- The counter begins at zero. Existing GoatCounter history is not automatically imported. SQLite state persists across ordinary deployments. Keep the Worker name, Durable Object class, binding, migration and `homepage-v1` object name stable to retain the total.
- This is a count of short-lived anonymous browser sessions, not independently verified unique people. Crawler matching and Origin validation are basic safeguards. It has no public reset endpoint or administrative token in the frontend.

## Validation of the delivered package

The official Wrangler `deploy --dry-run` bundles this Worker successfully, and the actual Jekyll 3.9 build succeeds. Backend HTTP/SQLite logic is exercised with a Node SQLite adapter, including concurrency, expiry, reconstruction, validation and CORS. Browser integration is exercised at 1440, 1200, 1024, 768, 430 and 375 px, without real tracking requests.

The native Windows `workerd` runtime fails to start on the preparation machine (access violation); a real Durable Objects runtime and account deployment have not been verified here. Run the local smoke test on Mac before deploying. Cloudflare login, deployment, the public endpoint and GitHub publication are still required on your machine.
