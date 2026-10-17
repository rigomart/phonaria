# Phonaria app

The repo's only application is a TanStack Start app on Cloudflare Workers. Routes are in `src/routes`, shared UI in `src/components`, domain logic in `src/lib`, Practice in `src/practice`, and request-time Worker adapters in `src/server/cloudflare`. Worker settings live in `wrangler.jsonc`.

## Local setup

From the repo root:

```bash
bun install
bun run dev # http://localhost:3000
```

Create `apps/phonaria/.dev.vars` for the local Worker:

```ini
TURSO_DATABASE_URL="libsql://your-database.turso.io"
TURSO_AUTH_TOKEN="your-auth-token"
# Optional: enables context-aware spelling suggestions
OPENROUTER_API_KEY="your-key"
```

The first two keys are needed when a word misses the bundled lists and must be looked up in Turso. Without them, common words can still transcribe in the browser while server lookups fail. `.env.local` is useful for build-time settings and scripts, but its secret values are not automatically copied into `.dev.vars`. Restart the dev server after editing `.dev.vars`. Both files are ignored by Git; use `.env.example` as a reference.

`scripts/write-dev-vars.ts` writes public settings and preserves existing Worker secret lines during builds. It never imports secret values from the process environment. The app uses `SITE_URL` for canonical links; production builds require it. Practice and Language Spread default on locally and are controlled per deployed environment by `FLAG_PRACTICE` and `FLAG_LANGUAGE_SPREAD`. When a flag is off, its route returns 404 and its header link is hidden.

## Commands

```bash
bun run --cwd apps/phonaria dev
bun run --cwd apps/phonaria check-types
bun run --cwd apps/phonaria test
bun run --cwd apps/phonaria build
```

Run `bun run --cwd apps/phonaria deploy:staging` only when deploying staging. Production deploys through the GitHub `Production` workflow. The build and dev server start a local Cloudflare Worker and need permission to bind local ports.

Each deploy is recorded as a GitHub Deployment by `scripts/github-deployment.ts`: PR previews in the transient `preview` environment (marked inactive when the PR closes), `staging` from `main`, and `production`. These bookkeeping steps never block a deploy.

Staging CI uses the GitHub variables `STAGING_URL` and `WORKERS_DEV_SUBDOMAIN`. `STAGING_URL` must point to `https://phonaria-staging.<subdomain>.workers.dev`; the staging origin check rejects a URL for another Worker before deployment.

## Language Spread

`/language-spread` tells how languages spread across the world as a scrolling story over a pinned SVG map. Story data, sources and camera framing are in `src/lib/language-spread/story.ts`, with the research notes behind every stop in [`docs/research/language-spread`](../../docs/research/language-spread/). The UI is in `src/components/language-spread`.

The world outline in `src/lib/language-spread/world-land.ts` is generated from Natural Earth 1:110m land (public domain) by `scripts/generate-world-map.ts`, using the Gall stereographic projection in `projection.ts`. The projection is cylindrical, so the map repeats east and west and the camera can pan across the Pacific. Regenerate it with:

```bash
bun apps/phonaria/scripts/generate-world-map.ts [path/to/ne_110m_land.geojson]
```

## Request-time services

- **Transcription:** Words outside the two bundled lists go through a server function to Turso. Requests are limited to 200 words and 64 characters per word. `TRANSCRIPTION_RATE_LIMIT` caps server lookups at 60 per minute per IP and Cloudflare location.
- **Definitions:** The Worker requests definitions from Wiktionary; the browser does not call Wiktionary directly. `DEFINITION_RATE_LIMIT` applies the same limit.
- **Spelling suggestions:** With `OPENROUTER_API_KEY`, the Worker can choose among nearby spellings using sentence context. When that service is unavailable, the browser uses its frequency rule. `SPELLING_CONTEXT_RATE_LIMIT` caps calls at 60 per minute per IP.

The three rate-limit bindings are configured separately for local, staging, preview, and production in `wrangler.jsonc`. See [ADR 0002](../../docs/adr/0002-single-application-on-cloudflare-workers.md) for why the project uses one app.
