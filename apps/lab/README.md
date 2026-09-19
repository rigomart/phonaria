# Phonaria

The Phonaria application: TanStack Start deployed to Cloudflare Workers.
Production serves `phonaria.rigos.dev`; `phonaria-lab.rigos.dev` redirects to
the main hostname. This is the only Phonaria application — the earlier Next.js
app on Vercel was retired, as recorded in
`docs/adr/0002-single-application-on-cloudflare-workers.md`. The `lab` directory
name and the `phonaria-lab` Worker name are kept so deployment history and
Cloudflare bindings stay continuous.

```bash
bun --cwd apps/lab dev                # http://localhost:3001
bun --cwd apps/lab build
bun --cwd apps/lab start
bun --cwd apps/lab deploy:staging
bun --cwd apps/lab cf-typegen
bun --cwd apps/lab worker-metrics
```

TanStack Start owns `src/routes`, `src/router.tsx`, `src/routeTree.gen.ts`, and
the Vite config. The approved `vite.config.ts` role is `vite.config.mts` because
Vite 8 loads `@tanstack/react-start/plugin/vite` as ESM and this package is
not `"type": "module"`. Cloudflare delivery is configured only in
`wrangler.jsonc`. `deploy:staging` resolves the account-scoped origin
from `LAB_START_STAGING_URL` or `LAB_WORKERS_DEV_SUBDOMAIN`, sets
`CLOUDFLARE_ENV=staging` at build time, and verifies that Vite flattened the
Worker name to `phonaria-lab-staging` before deploying the generated config.
Deploy the Cloudflare production Worker through the `Lab Production` workflow.

The application serves transcription, Credits, IPA charts, and Practice when
`FLAG_PRACTICE` is enabled (staging and preview). Production keeps Practice
off. Transcription uses a TanStack server function with `@libsql/client/web`
and request-time Worker bindings for
`TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. Put those secrets on each
Cloudflare environment (`wrangler secret put`) and, for local Start, in
`.dev.vars` by hand. `write-dev-vars` never copies Turso values from
the process environment; it only preserves existing `.dev.vars` secret
lines.

## Transcription guardrails

The public transcription server function accepts at most 200 words and 64
characters per word. Its process-level CMUDict cache keeps at most 5,000
entries using least-recently-used eviction; failed lookups count toward that
bound.

Cloudflare's `TRANSCRIPTION_RATE_LIMIT` binding applies a best-effort limit of
60 server lookups per minute for each connecting IP and Cloudflare location.
`DEFINITION_RATE_LIMIT` applies the same 60/minute IP cap to dictionary
lookups. Local, staging, preview, and production use separate namespace IDs in
`wrangler.jsonc`, because rate-limit bindings and counters are not inherited by
named Worker environments. A rejected transcription request returns a retryable
error with HTTP status 429 before Turso is queried. A missing binding also fails
closed before Turso is queried. Dictionary lookups proxy Wiktionary REST
definitions from the Worker and never call Wiktionary from the browser.
