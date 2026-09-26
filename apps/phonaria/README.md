# Phonaria

The Phonaria application: TanStack Start deployed to Cloudflare Workers.
Production serves `phonaria.rigos.dev`; `phonaria-lab.rigos.dev` redirects to
the main hostname. This is the only Phonaria application — the earlier Next.js
app on Vercel was retired, as recorded in
`docs/adr/0002-single-application-on-cloudflare-workers.md`. Cloudflare Worker
scripts are `phonaria`, `phonaria-staging`, `phonaria-preview`, and
`phonaria-pr-N`.

```bash
bun --cwd apps/phonaria dev                # http://localhost:3001
bun --cwd apps/phonaria build
bun --cwd apps/phonaria start
bun --cwd apps/phonaria deploy:staging
bun --cwd apps/phonaria cf-typegen
bun --cwd apps/phonaria worker-metrics
```

TanStack Start owns `src/routes`, `src/router.tsx`, `src/routeTree.gen.ts`, and
the Vite config. The approved `vite.config.ts` role is `vite.config.mts` because
Vite 8 loads `@tanstack/react-start/plugin/vite` as ESM and this package is
not `"type": "module"`. Cloudflare delivery is configured only in
`wrangler.jsonc`. `deploy:staging` resolves the account-scoped origin
from `STAGING_URL` / `LAB_START_STAGING_URL` or `WORKERS_DEV_SUBDOMAIN` /
`LAB_WORKERS_DEV_SUBDOMAIN`, sets
`CLOUDFLARE_ENV=staging` at build time, and verifies that Vite flattened the
Worker name to `phonaria-staging` before deploying the generated config.
Deploy the Cloudflare production Worker through the `Production` workflow.

The application serves transcription, Credits, IPA charts, and Practice when
`FLAG_PRACTICE` is enabled (staging and preview). Production keeps Practice
off. Transcription uses a TanStack server function with `@libsql/client/web`
and request-time Worker bindings for
`TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`, and spelling suggestions read
`OPENROUTER_API_KEY`. `WORKER_SECRET_KEYS` in `scripts/write-worker-secrets.ts`
lists every Worker secret. The deploy workflows run that script to write the
secrets set in GitHub to a file, and `wrangler deploy --secrets-file` ships them
with the Worker version. A secret that isn't set is left unchanged on the
Worker. To add a secret, add its name to that list and to the deploy jobs'
`env`. For local Start, put the secrets in `.dev.vars` by hand.
`write-dev-vars` never copies them from the process environment; it only
preserves existing `.dev.vars` lines for the same keys.

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

## Context-aware spelling suggestions

Behind `FLAG_SPELLING_CONTEXT` (on in staging and preview, off in production).
After a transcription lands, when some missed word has one-slip dictionary
neighbours, the browser calls `chooseSpellingInContextFn`. The Worker checks
the candidates against the text, then asks Jev (TypeSafe's decision model,
through OpenRouter) which one the sentence meant, sending at most 300
characters of whole words. `SPELLING_CONTEXT_RATE_LIMIT` allows 60 calls per
minute per IP, and the call times out after 1.5 s without retrying. When the
flag is off, the key is missing, the caller is rate-limited, or Jev fails, the
Worker answers `unavailable` and the browser falls back to the frequency rule.
Learner text is never logged. A line above the footer on the empty page says
the text goes to a third party. Before enabling it in production, run
`bun ./scripts/eval-spelling-context.ts` (see
`docs/research/issue-262-spelling-context-eval.md`).
