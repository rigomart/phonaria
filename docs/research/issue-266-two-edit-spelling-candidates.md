# Two-edit spelling candidates (issue #266)

Measured on 2026-09-27. The browser now searches the curated top 10k for words exactly two
optimal-string-alignment edits from a missed token of at least five letters. It sends at most
ten of them per token to Jev, after the dictionary's one-edit options. The frequency-only rule
still sees only the one-edit options.

## Browser scan and Worker validation

Reproduce with `bun packages/browser-contract/scripts/bench-two-edit-spelling.ts`. The probe
uses a 200-character sentence containing eight misses of five or more letters, with the
curated top 10k loaded before timing. Each reported sample scans all eight misses. Chromium
uses CDP `Emulation.setCPUThrottlingRate` at 4×, with 100 timed samples after ten warmups.
The Worker probe validates eight misses with 100 candidates each, with 200 timed samples.

| Probe | Median | p95 | Maximum |
| --- | ---: | ---: | ---: |
| Bun, original full-list scan | 5.74 ms | 6.49 ms | 6.74 ms |
| Chromium 4×, original full-list scan | 62.6 ms | 64.6 ms | 68.5 ms |
| Bun, length-indexed scan | 2.80 ms | 2.86 ms | 2.89 ms |
| Chromium 4×, length-indexed scan | 10.7 ms | 11.4 ms | 12.1 ms |
| Worker candidate validation, eight × 100 | 0.10 ms | 0.12 ms | 0.14 ms |

The length-indexed scan is below the 16 ms sentence budget at 4× throttling. The Chromium
probe recorded no scan task over 50 ms. Index construction and loading the curated chunk are
outside these scan timings; the store starts that work only after committing the transcription.

## Jev evaluation

Reproduce with `bun --cwd apps/phonaria ./scripts/eval-spelling-context.ts`. The script reads
`OPENROUTER_API_KEY` from the process, `.env.local`, or the gitignored `.dev.vars` file. The
live run used OpenRouter `jev-latest`, the Worker's 1.5 s timeout, and eight calls in flight.

| | Issue #262 baseline | Issue #266 run |
| --- | ---: | ---: |
| Labeled sentences right | 38/38 | 44/44 |
| Jev calls | 34 | 40 |
| Newly called sentences | — | 4 |
| Fallbacks | 0 | 0 |
| p50 Jev latency | 372 ms | 297 ms |
| p90 Jev latency | 615 ms | 617 ms |

The updated labels include `reciv`, `definatly`, `neccesary`, `acomodate`, `tommorow`,
`exersize`, and `adres`; one new sentence mixes a one-edit and a two-edit miss. Jev chose the
intended correction in all of them. `langwidge` remained silent.

## New-call estimate from two-slip corruptions

Reproduce with `bun --cwd apps/phonaria ./scripts/review-spelling-cases.ts --sweep`. The
seeded sweep made two slips in curated words and kept 2,606 resulting non-dictionary misses
of at least five letters whose distance from the source word was exactly two. Of those,
2,131 (81.8%) had no one-edit candidates and did have two-edit candidates, so they would
newly call Jev. The intended source word appeared among the ten options in 2,120 cases
(81.4% of reachable misses). This is a synthetic corruption estimate, not a measured share
of real learner submissions.
