# Phonaria Lab

Next.js and TanStack Start coexist in this workspace during the Cloudflare
migration. They share framework-neutral modules and select adapters at each
route root. Do not add a sibling `apps/lab-start` app.

## Next.js (public Vercel Lab)

```bash
bun --cwd apps/lab dev        # also bun --cwd apps/lab dev:next
bun --cwd apps/lab build      # also bun --cwd apps/lab build:next
bun --cwd apps/lab start
```

`bun dev` at the repo root still starts this Next.js target.

## TanStack Start (Cloudflare Workers)

```bash
bun --cwd apps/lab dev:start          # http://localhost:3001
bun --cwd apps/lab build:start
bun --cwd apps/lab preview:start
bun --cwd apps/lab deploy:start:staging
bun --cwd apps/lab cf-typegen
bun --cwd apps/lab worker-metrics
```

Start owns `src/routes`, `src/router.tsx`, `src/routeTree.gen.ts`, and the
Vite config. The approved `vite.config.ts` role is `vite.config.mts` because
Vite 8 loads `@tanstack/react-start/plugin/vite` as ESM and this package is
not `"type": "module"`. Cloudflare delivery is configured only in
`wrangler.jsonc`. `deploy:start:staging` sets `CLOUDFLARE_ENV=staging` at
build time so Vite flattens the Worker name to `phonaria-lab-staging`. Do
not deploy the Cloudflare production Worker from this app.

The first Start slice is the Credits page plus the reusable Lab shell. Other
Lab routes remain on Next.js until later migration tickets.
