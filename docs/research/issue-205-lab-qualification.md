# Issue #205 — Cloudflare Lab qualification record

Running record of qualification evidence for
[#205](https://github.com/rigomart/phonaria/issues/205), "Qualify the complete
Cloudflare Lab for production". Parent spec: #196.

Evidence is collected by the `Lab Qualify` workflow
(`.github/workflows/lab-qualify.yml`), which runs the complete `e2e:lab`
contract against an already-deployed target and deploys nothing.

```bash
gh workflow run lab-qualify.yml --ref main -f target=cloudflare-staging -f baseline=true
```

## Functional contract — AC 1

Both targets ran the complete contract (`--grep-invert @baseline`, 39 test
invocations). Neither run had a failure.

| Target | Passed | Skipped | Failed | Run |
| --- | --- | --- | --- | --- |
| `cloudflare-staging` | 34 | 5 | 0 | [34807377133](https://github.com/rigomart/phonaria/actions/runs/34807377133) |
| `vercel-production` | 33 | 6 | 0 | local, 2026-09-14 |

The pass-count difference is target configuration, not behaviour. Staging
enables Practice, so it runs the "Practice enabled" block and skips "Practice
disabled"; production Vercel does the reverse. Staging additionally enables
`controlledServiceFailure`, so it runs one test Vercel skips.

Skips on staging, all with recorded reasons:

- 4 × `practice.spec.ts` "Practice disabled" — staging enables Practice by design.
- 1 × `transcription.spec.ts` "exercises word-list failure copy" — no
  framework-neutral seam exists to fail a hashed bundler chunk.

Three behaviours had never been exercised on Cloudflare before this run,
because the post-deploy gate in `lab-start.yml` runs the `e2e:start-slice`
subset. All three pass:

- `navigation-theme.spec.ts` — both tests. The subset never ran this file, so
  theme persistence across reload and navigation (user story 6) was previously
  unverified on Cloudflare.
- `transcription.spec.ts` "shows the service error copy, retry, and stale
  result when POSTs fail" — the retryable error state required by AC 8.
- `practice.spec.ts` "completes one Schwa session with blank answers".

## Performance — AC 4

### Method

The committed `vercel-production.json` baseline was collected from a maintainer
workstation. Baselines from the `Lab Qualify` workflow are collected from a
GitHub Actions runner. Those vantage points are not comparable, so every figure
below was re-collected from GitHub runners, two pairs, minutes apart.

One confound remains and is **not** yet controlled: Cloudflare staging sits
behind Cloudflare Access, which validates a service token on every request.
Production Lab will not have Access in front of it.

### Results

| Metric | Vercel | CF staging | Delta |
| --- | --- | --- | --- |
| Warm page load, median (run 1) | 59 ms | 94 ms | +59.3% |
| Warm page load, median (run 2) | 64 ms | 83 ms | +29.7% |
| Warm page load, median (pooled n=10) | 63.5 ms | 91 ms | **+43.3%** |
| Warm page load, p95 (run 1) | 155 ms | 160 ms | +3.2% |
| Warm page load, p95 (run 2) | 78 ms | 96 ms | +23.1% |
| Cold page load (run 1) | 153 ms | 164 ms | +7.2% |
| Cold page load (run 2) | 453 ms | 190 ms | −58.1% |
| Transcription client, median (run 1) | 1031 ms | 1033 ms | +0.2% |
| Transcription server, median (run 1) | 1049 ms | 1039 ms | −1.0% |
| Transcription server, median (run 2) | 1280 ms | 1031 ms | −19.5% |

Raw warm page-load samples:

- Vercel: `[79, 59, 155, 57, 47]`, `[78, 75, 59, 63, 64]`
- CF staging: `[160, 94, 85, 93, 98]`, `[96, 83, 89, 73, 69]`

### Reading

**Transcription is at parity or better on Cloudflare.** Both lanes land within
1% on run 1, and on run 2 the Cloudflare server lane is 19.5% *faster*.
Cloudflare is also markedly more consistent: its server samples span
1024–1052 ms across both runs, while Vercel produced 1282 ms and 1293 ms
outliers. This is the metric learners actually wait on.

**Cold page load is noise at this sample size.** It moved +7.2% then −58.1%,
driven by a single 453 ms Vercel outlier.

**Warm page-load median is a repeatable regression over the 20% threshold.** It
reproduced at +59.3% and +29.7%, pooling to +43.3%. Per #196 this triggers
investigation, not automatic failure. In absolute terms it is +27.5 ms on a
median of 63.5 ms.

Leading hypothesis is the Cloudflare Access hop on every staging request.
Supporting evidence: the gap is roughly constant in absolute terms rather than
proportional, and warm p95 — where a fixed per-request cost is diluted by
larger values — shows only +3.2% and +23.1%. This is a hypothesis, not a
finding; it is untested.

The decisive measurement is the production Worker, which has no Access in
front. That cannot be taken until the production environment is configured
(AC 6), so **this item stays open and must be resolved before the go/no-go
record is written**.

## Production environment — AC 6

`.github/workflows/lab-production.yml` deploys the production Worker without
touching DNS. It is dispatch-only: production must never deploy as a side
effect of a merge while Vercel is still serving learners.

Attaching a custom domain is what writes the DNS record, so the pre-cutover
production Worker declares no routes and answers only on its workers.dev
origin. `phonaria-lab.rigos.dev` keeps pointing at Vercel until #206.
`scripts/assert-no-custom-domain.ts` fails the deploy if any route appears in
the flattened config, so the cutover cannot happen by accident.

A local `CLOUDFLARE_ENV=production` build confirms the environment flattens
correctly:

| Setting | Value |
| --- | --- |
| Worker name | `phonaria-lab` |
| `routes` | none |
| `SITE_URL` | `https://phonaria-lab.rigos.dev` |
| `SITE_INDEXING_ENABLED` | `0` |
| `FLAG_PRACTICE` | `0` |
| `observability.logs.invocation_logs` | `true` |

Prerendering emitted exactly 4 pages — `/`, `/credits`,
`/ipa-chart/consonants`, `/ipa-chart/vowels` — with no Practice route, matching
the production indexing rules.

Production takes its own database-scoped read-only Turso token
(`LAB_TURSO_DATABASE_URL_PRODUCTION`, `LAB_TURSO_AUTH_TOKEN_PRODUCTION`),
separate from the pair staging and previews share, per #196.

**Not yet run.** Deploying makes the Worker publicly reachable on workers.dev
before cutover, which is a maintainer decision, and the production Turso token
does not exist yet.

## Sanitized failure logging — AC 8

`src/server/transcription.ts:58` logs a structured `transcription_failed` event
on every catchable failure, carrying only `kind` and `retryable` — no learner
input, no credentials, no database URL. `logWorkerEvent` additionally redacts
keys matching `token|secret|password|authorization|cookie|database|turso|url`
and omits strings over 120 characters, as defence in depth.

The browser half is covered by the contract test that passes on staging. What
remains is confirming these events are visible and correctly shaped in
Cloudflare Workers Logs, which needs a deployed target to exercise.

## Status

| AC | Item | Status |
| --- | --- | --- |
| 1 | Complete contract on staging, compared to Vercel | Met |
| 2 | Routes, metadata, robots, sitemap, assets, theme, flags, a11y | Met, via the contract run above |
| 3 | Security headers and CSP verified on the Worker | Met, via `security.spec.ts` |
| 4 | Page-load and transcription measurements | Collected; warm page-load median flagged for investigation |
| 5 | Worker size, module count, startup, CPU, latency | Partial — `record-worker-metrics.ts` runs in CI; CPU and request latency not yet gathered from Workers Logs |
| 6 | Production environment configured for the custom domain | Deploy path built and config verified by local build; not yet deployed |
| 7 | Workers Logs enabled and usable, with `exceededCpu` filters | Partial — `observability.logs` is on in `wrangler.jsonc`; not yet exercised |
| 8 | Sanitized failure logs and a stable retryable error state | Code verified both halves; not yet confirmed in Workers Logs |
| 9 | Free vs Paid recorded with maintainer acceptance | Maintainer decision |
| 10 | Post-deploy smoke command or workflow | Met — `lab-qualify.yml` serves this role |
| 11 | Rollback rehearsed against a healthy Vercel deployment | Not started |
| 12 | Maintainer go/no-go decision | Maintainer decision |
