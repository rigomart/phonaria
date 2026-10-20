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
# Optional: enables pronunciation scoring
AZURE_SPEECH_KEY="your-key"
AZURE_SPEECH_REGION="eastus"
```

The first two keys are needed when a word misses the bundled lists and must be looked up in Turso. Without them, common words can still transcribe in the browser while server lookups fail. `.env.local` is useful for build-time settings and scripts, but its secret values are not automatically copied into `.dev.vars`. Restart the dev server after editing `.dev.vars`. Both files are ignored by Git; use `.env.example` as a reference.

`scripts/write-dev-vars.ts` writes public settings and preserves existing Worker secret lines during builds. It never imports secret values from the process environment. The app uses `SITE_URL` for canonical links; production builds require it. Practice, Language Spread and speech scoring default on locally and are controlled per deployed environment by `FLAG_PRACTICE`, `FLAG_LANGUAGE_SPREAD` and `FLAG_SPEECH`. When a flag is off, its route returns 404 and its header link is hidden.

## Commands

```bash
bun run --cwd apps/phonaria dev
bun run --cwd apps/phonaria check-types
bun run --cwd apps/phonaria test
bun run --cwd apps/phonaria build
```

Run `bun run --cwd apps/phonaria deploy:staging` only when deploying staging. Production deploys through the GitHub `Production` workflow. The build and dev server start a local Cloudflare Worker and need permission to bind local ports.

Each deploy is recorded as a GitHub Deployment by `scripts/github-deployment.ts`: PR previews in the transient `preview` environment (marked inactive when the PR closes), `staging` from `main`, and `production`. These bookkeeping steps never block a deploy.

Deploy workflows pass Worker secrets from GitHub Actions secrets through `scripts/write-worker-secrets.ts`, which writes the ones that are set to `wrangler deploy --secrets-file`. Staging and preview get `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `OPENROUTER_API_KEY`, `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION`; production gets all but the Azure pair. A secret that isn't set is left unchanged on the Worker.

Staging CI uses the GitHub variables `STAGING_URL` and `WORKERS_DEV_SUBDOMAIN`. `STAGING_URL` must point to `https://phonaria-staging.<subdomain>.workers.dev`; the staging origin check rejects a URL for another Worker before deployment.

## Language Spread

`/language-spread` tells the story of English as a scrolling story over a globe, from its Indo-European ancestor to the English used around the world today. Story data, sources, camera framing and card placement are in `src/lib/language-spread/story.ts`, with the research notes behind every stop in [`docs/research/language-spread`](../../docs/research/language-spread/). The UI is in `src/components/language-spread`: the globe is drawn on a canvas with `d3-geo`'s orthographic projection, and pins are buttons placed over it.

The land in `src/lib/language-spread/world-land.ts` is generated from Natural Earth 1:50m land (public domain) by `scripts/generate-world-map.ts`, as a coarse outline for whole-globe views and a fine one for close-ups. Regenerate it with:

```bash
bun apps/phonaria/scripts/generate-world-map.ts [path/to/ne_50m_land.geojson]
```

## Request-time services

- **Transcription:** Words outside the two bundled lists go through a server function to Turso. Requests are limited to 200 words and 64 characters per word. `TRANSCRIPTION_RATE_LIMIT` caps server lookups at 60 per minute per IP and Cloudflare location.
- **Definitions:** The Worker requests definitions from Wiktionary; the browser does not call Wiktionary directly. `DEFINITION_RATE_LIMIT` applies the same limit.
- **Spelling suggestions:** With `OPENROUTER_API_KEY`, the Worker can choose among nearby spellings using sentence context. When that service is unavailable, the browser uses its frequency rule. `SPELLING_CONTEXT_RATE_LIMIT` caps calls at 60 per minute per IP.
- **Pronunciation scoring:** `POST /api/speech/score?word=ship&targetAccent=en-us` with a WAV body sent as `audio/wav` returns the `RecordingEvidence` from `@phonaria/pronunciation` as JSON, scored by Azure Pronunciation Assessment. The browser runs the judge. It returns 404 when `FLAG_SPEECH` is off.
  - It accepts only en-us words from the minimal-pair catalog. Their pronunciations are in `src/lib/speech/catalog-pronunciations.ts` so the Worker never bundles the 10k list; regenerate it with `bun apps/phonaria/scripts/generate-speech-words.ts`.
  - The WAV must be 16 kHz mono 16-bit PCM, at most 5 seconds and 161,024 bytes.
  - It needs the `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` Worker secrets and answers 503 without them. `SPEECH_RATE_LIMIT` caps it at 20 per minute per IP.
  - Errors are `{ "error": { "code", "message" } }` with status 400 (word, accent or malformed WAV), 413 (too long), 415 (not `audio/wav`, or not 16 kHz mono 16-bit PCM), 429, 502 (Azure failed) or 503.
  - Audio goes to Azure and is never stored or logged. Logs hold only the word, status and latency.

The four rate-limit bindings are configured separately for local, staging, preview, and production in `wrangler.jsonc`. See [ADR 0002](../../docs/adr/0002-single-application-on-cloudflare-workers.md) for why the project uses one app.
