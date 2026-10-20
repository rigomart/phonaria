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
# Optional: enables opt-in evidence logging
EVIDENCE_LOG_DATABASE_URL="libsql://your-evidence-log.turso.io"
EVIDENCE_LOG_AUTH_TOKEN="your-write-token"
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

Deploy workflows pass Worker secrets from GitHub Actions secrets through `scripts/write-worker-secrets.ts`, which writes the ones that are set to `wrangler deploy --secrets-file`. Staging and preview get `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `OPENROUTER_API_KEY`, `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION`; production gets all but the Azure pair. Only staging gets `EVIDENCE_LOG_DATABASE_URL` and `EVIDENCE_LOG_AUTH_TOKEN`, so pull request previews never write to the evidence log. A secret that isn't set is left unchanged on the Worker.

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
- **Pronunciation scoring:** `POST /api/speech/score?word=ship&targetAccent=en-us` with a WAV body sent as `audio/wav` returns the `RecordingEvidence` from `@phonaria/pronunciation` as JSON, scored by Azure Pronunciation Assessment with a plain-recognition transcript of the same audio. The two Azure calls count as one attempt against `SPEECH_RATE_LIMIT`; if only the transcript fails, the evidence comes back without it. The browser runs the word gate and the judge. It returns 404 when `FLAG_SPEECH` is off.
  - Minimal-pair practice at `/practice/minimal-pairs` (in `src/practice`) is its only caller. `FLAG_SPEECH` alone gates the page, so it works with `FLAG_PRACTICE` off; the Practice index links to it when the flag is on. It judges every sound of the word and leads with the contrast sound.
  - It accepts only en-us words from the minimal-pair catalog. Their pronunciations are in `src/lib/speech/catalog-pronunciations.ts` so the Worker never bundles the 10k list; regenerate it with `bun apps/phonaria/scripts/generate-speech-words.ts`.
  - The WAV must be 16 kHz mono 16-bit PCM, at most 5 seconds and 161,024 bytes.
  - It needs the `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` Worker secrets and answers 503 without them. `SPEECH_RATE_LIMIT` caps it at 20 per minute per IP.
  - Errors are `{ "error": { "code", "message" } }` with status 400 (word, accent or malformed WAV), 413 (too long), 415 (not `audio/wav`, or not 16 kHz mono 16-bit PCM), 429, 502 (Azure failed) or 503.
  - Audio goes to Azure and is never stored or logged. Logs hold only the word, status and latency.
- **Evidence logging:** `POST /api/speech/evidence-log` with an `EvidenceLogPayload` (`src/lib/speech/evidence-log.ts`) as `application/json` writes one row to the evidence log, a Turso database of its own, and answers 204. Learners opt in with the "Share results to improve the checks" switch under the recording notice in minimal-pair practice. It is off by default and kept in this browser's `localStorage` (`evidence-log-consent`, in `src/lib/speech/evidence-log-consent.ts`). While it is on, the page sends each scored attempt once the learner's next action is known: `retried` when they record again, `moved-on` for Next word, All pairs or leaving the page (`src/practice/_lib/evidence-log-attempt.ts`). Nothing is sent while it is off, or for an attempt whose scoring failed. Each opt-in stores a fresh grant (`on:<id>`; the first release's bare `on` also counts), and an attempt is sent only if the grant in `localStorage` when it would be sent is the one in force when it was scored. So sharing must stay on throughout, and turning it off in any tab, even briefly, drops the waiting attempt. The switch follows other tabs through `storage` events. An attempt still "Checking…" when the learner moves on is never sent, since nothing is sent after they have left. See [#336](https://github.com/rigomart/phonaria/issues/336).
  - A row holds the schema version, when the attempt was scored, the word, the target accent, the scorer's `RecordingEvidence`, the verdicts (the judged sounds, the word gate's outcome and the judgement) and whether the learner retried or moved on. Never audio, an account, an IP or a user agent. The table is in `migrations/evidence-log/`.
  - **Real words are kept only where re-judging needs them**, so a name or a number a learner says is never stored. A one-word transcript, a one-word `heard` from the word gate, and a swap's `heardWord` keep their word only if it is a minimal-pair catalog word; any other word is the placeholder `<other>` (`EVIDENCE_LOG_OTHER_WORD`). Every word of a longer transcript or `heard` is a placeholder too, since catalog words can still spell a name ("Sue Park"), and so is every inserted word. `sendEvidenceLog` applies this with `withCatalogWordsOnly` before sending, and the endpoint refuses anything else. Word counts and the transcript's confidence stay.
  - The payload is checked strictly: unknown fields anywhere, real words outside those rules, scores outside 0..1, attempts more than a day old, and bodies over 16 KB are refused. Logs hold only the status and latency, never the payload.
  - It returns 404 when `FLAG_SPEECH` is off and 503 without `EVIDENCE_LOG_DATABASE_URL` and `EVIDENCE_LOG_AUTH_TOKEN`. `EVIDENCE_LOG_RATE_LIMIT` caps it at 20 per minute per IP, the same as scoring. Errors are `{ "error": { "code", "message" } }` with status 400, 413, 415, 429, 502 (the write failed) or 503.
  - **Retention: 90 days.** `src/server.ts`, the Worker entry, adds a `scheduled` handler, and a daily Cron Trigger (03:17 UTC) on the staging and production Workers deletes rows whose attempt is more than 90 days old. A Cron Trigger keeps that promise even when nothing is being written, such as while `FLAG_SPEECH` is off, which deleting on each write wouldn't. Preview and pull request Workers have no trigger and no evidence log secrets. Locally, `curl "http://localhost:3000/cdn-cgi/handler/scheduled"` runs it.
  - `bun run --cwd packages/pronunciation harness import-evidence-log` exports the rows for the harness. See the [pronunciation README](../../packages/pronunciation/README.md#evidence-log).

The five rate-limit bindings are configured separately for local, staging, preview, and production in `wrangler.jsonc`. See [ADR 0002](../../docs/adr/0002-single-application-on-cloudflare-workers.md) for why the project uses one app.

## Provisioning the evidence log

The owner does this once; nothing in CI creates the database or sets its secrets. With the [Turso CLI](https://docs.turso.tech/cli) logged in, from the repo root:

```bash
turso db create phonaria-evidence-log
turso db shell phonaria-evidence-log < apps/phonaria/migrations/evidence-log/0001_create_evidence_log.sql
turso db show phonaria-evidence-log --url                          # EVIDENCE_LOG_DATABASE_URL
turso db tokens create phonaria-evidence-log -p evidence_log:data_add,data_delete  # EVIDENCE_LOG_AUTH_TOKEN
turso db tokens create phonaria-evidence-log --read-only           # EVIDENCE_LOG_READ_TOKEN, for the export
```

The Worker's token can insert rows and delete old ones, and can't read them. Before setting it, check that it can do both, since a `DELETE` with a `WHERE` may also need `data_read`:

```bash
URL="$(turso db show phonaria-evidence-log --url | sed 's/^libsql:/https:/')/v2/pipeline"
for sql in "INSERT INTO evidence_log (schema_version, attempted_at, word, target_accent, evidence, verdicts, next_action) VALUES (1, 0, 'ship', 'en-us', '{}', '{}', 'retried')" \
  "DELETE FROM evidence_log WHERE attempted_at < 1"; do
  curl -s "$URL" -H "Authorization: Bearer $EVIDENCE_LOG_AUTH_TOKEN" -H "Content-Type: application/json" \
    -d "{\"requests\":[{\"type\":\"execute\",\"stmt\":{\"sql\":\"$sql\"}},{\"type\":\"close\"}]}"; echo
done
```

Both answers should have `"type":"ok"` as their first result. If only the `DELETE` is refused, the token needs `data_read` on `evidence_log` as well, which would let the Worker read the log; settle that before going further.

Then set the Worker secrets. Staging takes them from GitHub Actions secrets through `scripts/write-worker-secrets.ts`, like the others:

```bash
gh secret set EVIDENCE_LOG_DATABASE_URL --repo rigomart/phonaria
gh secret set EVIDENCE_LOG_AUTH_TOKEN --repo rigomart/phonaria
```

The next staging deploy writes them to `phonaria-staging`. To set them without a deploy, run `bunx wrangler secret put EVIDENCE_LOG_DATABASE_URL --name phonaria-staging` and the same for `EVIDENCE_LOG_AUTH_TOKEN`, from `apps/phonaria`. Production (`phonaria`) gets neither until `FLAG_SPEECH` is turned on there: then add the two `EVIDENCE_LOG_*` lines to the `production.yml` deploy `env` (and to the configuration test in `src/server/cloudflare/evidence-log-config.test.ts`), and decide whether production should log to the same database as staging. Its Cron Trigger already runs, and does nothing without the secrets.

For the export, put `EVIDENCE_LOG_DATABASE_URL` and `EVIDENCE_LOG_READ_TOKEN` in `packages/pronunciation/.env`.
