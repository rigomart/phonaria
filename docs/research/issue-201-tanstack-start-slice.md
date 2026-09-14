# Issue #201 — TanStack Start slice on Cloudflare

Implementation record for serving Credits through the reusable Lab shell from
TanStack Start on Cloudflare Workers. This is not a new specification; it
follows #196, #200, and #201.

## Dual targets in `apps/lab`

| Target | Commands | Owns |
| --- | --- | --- |
| Next.js (public Vercel Lab) | `bun dev` / `bun --cwd apps/lab dev:next`, `bun --cwd apps/lab build` | `src/app`, `next.config.ts` |
| TanStack Start (Cloudflare) | `bun --cwd apps/lab dev:start` (port 3001), `build:start`, `preview:start`, `deploy:start` | `src/routes`, `src/router.tsx`, `src/routeTree.gen.ts`, `vite.config.mts` (approved `vite.config.ts` role), `wrangler.jsonc` |

Do not create `apps/lab-start`. Shared product modules stay in `src/components`,
`src/hooks`, and `src/lib`. Framework adapters are explicit:

- `@/platform` — Image and runtime config only
- `@/platform/next` — Next.js route-root adapters
- `@/platform/tanstack` — Start route-root adapters

Worker bindings and sanitized logs live under `src/server/cloudflare`.

## Pinned versions

`@tanstack/react-start` 1.168.53, `@tanstack/react-router` 1.170.36,
`@cloudflare/vite-plugin` 1.54.8, Vite 8.3.0, Wrangler 4.131.1.

Wrangler is authoritative for `nodejs_compat`, Workers Static Assets
`html_handling: "drop-trailing-slash"`, and Workers Logs. Vite plugin order is
Cloudflare, `tanstackStart()`, React.

## Guardrails

Investigate if a deploy exceeds 5 MiB uncompressed, 1.5 MiB gzip, 75 modules,
or 100 ms startup. CI records this via `bun --cwd apps/lab worker-metrics`.

## Miguel / account actions

Repository-side validation (Next build, Start build, types, tests, dry-run
metrics) does not need Cloudflare credentials. Protected staging and PR
previews do.

Add these GitHub Actions secrets (never commit them):

- `CLOUDFLARE_API_TOKEN` — Workers edit on the Phonaria account
- `CLOUDFLARE_ACCOUNT_ID`
- `CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET` — Access service token for `packages/lab-contract` against staging

Add these GitHub Actions variables once the first Worker URL is known:

- `LAB_START_STAGING_URL` — stable staging origin, no trailing slash
- `LAB_WORKERS_DEV_SUBDOMAIN` — account slug (`mirdor-dev`) or `mirdor-dev.workers.dev`. Both become `https://phonaria-lab-pr-<n>.mirdor-dev.workers.dev`

Cloudflare account configuration:

1. Deploy `phonaria-lab-staging` from `main` after secrets exist.
2. Put Cloudflare Access in front of `phonaria-lab-staging` and `phonaria-lab-pr-*` so previews and staging are not public.
3. Keep production `phonaria-lab.rigos.dev` on Vercel until later cutover tickets.
4. Enable Workers Logs (Wrangler already requests `observability.logs`).
5. Create an Access service token for the Lab contract and store it in the secrets above.

The public Next.js/Vercel Lab must stay unchanged.

## Credits-relevant Lab contract

Until later tickets migrate `/` and Practice, staging runs the
existing `packages/lab-contract` suite filtered to Credits, IPA charts,
robots, 404, and CSP. Do not add a second browser suite. The full
contract stays the Vercel acceptance bar until those remaining routes land.

## Remaining human actions

Repository-side work in this PR does not deploy Workers. After the secrets
and Access apps above exist, merge to `main` so `Lab Start` deploys
`phonaria-lab-staging`, then record Worker startup time from that deploy
(dry-run cannot measure it).
