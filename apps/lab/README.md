# Phonaria Lab

TanStack Start application deployed to Cloudflare Workers. The separate Legacy
application remains in `apps/web` on Next.js and Vercel.

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
Do not deploy the Cloudflare production Worker from this app.

The application serves transcription, Credits, IPA charts, and Practice when
`FLAG_PRACTICE` is enabled (staging and preview). Production keeps Practice
off. Transcription uses a TanStack server function with `@libsql/client/web`
and request-time Worker bindings for
`TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. Put those secrets on each
Cloudflare environment (`wrangler secret put`) and, for local Start, in
`.dev.vars` by hand. `write-dev-vars` never copies Turso values from
the process environment; it only preserves existing `.dev.vars` secret
lines.
