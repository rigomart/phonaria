# Lab contract performance baselines

These files are the comparison point for page-load and transcription latency
across Lab deployment targets. They are **not** pass/fail gates for the
functional contract.

Transcription is stored as two lanes, never one blended median:

- `transcription.client` — curated client-list hit
- `transcription.server` — Turso/CMUdict hit for a word missing from both curated lists

## Collection conditions

Recorded by `bun e2e:lab:baseline` with:

- Browser: Chromium Desktop Chrome
- Viewport: 1280x720
- Runs: 5 warm samples per metric
- Page load: 1 cold navigation of `/`, then 5 warm navigations, measured as wall-clock time around `page.goto({ waitUntil: "load" })`
- Transcription client: one uncounted warmup of `hello` to pull the lazy curated-10k chunk into the HTTP cache, then 5 submissions of `hello` on a reloaded landing page, from submit click until the word label is visible
- Transcription server: one uncounted warmup of `aardvark` to prime Turso, then 5 submissions of `aardvark` on a reloaded landing page, from submit click until the word label is visible
- Network: the machine running Playwright, over the public internet unless otherwise noted

A repeatable slowdown greater than roughly 20% versus the committed median is
an investigation trigger for qualification and cutover tickets. Ordinary
run-to-run variance does not fail this suite. Compare each lane on its own;
do not average client and server samples.

## Fixture verification

`src/baseline-fixtures.test.ts` checks the probe words against Phonaria's
checked-in dictionaries:

| Probe | Role | curated-1k | curated-10k | `cmudict.json` |
| --- | --- | --- | --- | --- |
| `hello` | `transcription.client` | absent | present (`H AX0 L OU1`, `H E0 L OU1`) | present |
| `aardvark` | `transcription.server` | absent | absent | present (`A1 R D V A2 R K`) |
| `zxqvwoplmj` | functional not-found only | absent | absent | absent |

`hello` is a client-tier hit even though it is not in the bundled top-1k list:
`batchLookup` resolves it from the lazy top-10k chunk and never calls
`transcribeWordsAction`. `aardvark` is the opposite: both curated maps miss, so
the injectable server action must look the word up in Turso. Live collection
also asserts IPA details are visible and the "Not found" badge is not — that is
how Turso presence is confirmed, and why the nonsense `MISSING_WORD` fixture
must not be reused here.

## Updating a committed baseline

```bash
LAB_CONTRACT_TARGET=cloudflare-production LAB_CONTRACT_WRITE_BASELINE=1 bun e2e:lab:baseline
```

Commit the updated `baselines/<target>.json` only when collection conditions
are documented and the change is intentional.
