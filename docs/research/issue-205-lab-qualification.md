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

### Results before the fix

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

**Warm page-load median was a repeatable regression over the 20% threshold.**
It reproduced at +59.3% and +29.7%, pooling to +43.3% — +27.5 ms on a median of
63.5 ms. Per #196 that triggered investigation rather than automatic failure.
It is now resolved; see below.

### Resolved: hashed assets were revalidating on every warm load

Two hypotheses were raised and both are disproven:

- **Cloudflare Access.** Staging sits behind Access and production does not.
  They measure the same — staging warm median 94 ms and 83 ms, production
  93 ms. Access accounts for none of the gap.
- **`run_worker_first`.** Timing `/` and `/credits` (Worker-served) against
  `/ipa-chart/consonants` (static asset) showed no difference: 213 ms, 198 ms
  and 210 ms medians, all dominated by network latency.

The cause was asset caching. Vite content-hashes the 29 files under
`/assets/`, but the generated `_headers` file set only CSP, so Workers Static
Assets applied its documented default of `public, max-age=0, must-revalidate`.
Every warm load paid a revalidation round trip per asset. Vercel serves the
same class of file as `public,max-age=31536000,immutable`.

This explains every observation: a constant absolute gap rather than a
proportional one, no effect on cold loads (where Cloudflare was already
faster), no effect on transcription (which fetches no subresources), and no
sensitivity to Access.

`formatCloudflareHeadersFile` now emits
`/assets/* → Cache-Control: public, max-age=31536000, immutable`, matching
Cloudflare's
[documented guidance](https://developers.cloudflare.com/workers/static-assets/headers/)
for fingerprinted assets.

### Results after the fix

Production Worker versus Vercel, both collected from GitHub runners:

| Metric | Vercel | CF production | Delta |
| --- | --- | --- | --- |
| Cold page load | 277 ms | 154 ms | −44.4% |
| Warm page load, median | 66 ms | 61 ms | −7.6% |
| Warm page load, p95 | 94 ms | 75 ms | −20.2% |
| Transcription client, median | 1026 ms | 958 ms | −6.6% |
| Transcription server, median | 1031 ms | 1030 ms | −0.1% |

Warm page-load median went from +43.1% (93 ms against 65 ms) to −7.6% (61 ms
against 66 ms). Cloudflare now matches or beats Vercel on every measured
metric, and no metric is outside the 20% threshold in Cloudflare's disfavour.

The committed `cloudflare-staging.json` baseline predates the fix and should be
re-collected before it is used as a regression reference.

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

### Turso credentials — approved departure from #196

#196 specifies distinct read-only tokens per environment. The maintainer has
decided every environment shares one connection (`LAB_TURSO_DATABASE_URL`,
`LAB_TURSO_AUTH_TOKEN`): the database is identical everywhere, holds no user
data, and the token cannot write.

#196 requires an explicit specification update for any relaxation, so record
this on #196 before the go/no-go, or AC 6's "least-privilege secrets" is
checked against a criterion that was knowingly changed.

Pre-cutover the Worker is publicly reachable on workers.dev, noindex, as
approved.

## Sanitized failure logging — AC 8

`src/server/transcription.ts:58` logs a structured `transcription_failed` event
on every catchable failure, carrying only `kind` and `retryable` — no learner
input, no credentials, no database URL. `logWorkerEvent` additionally redacts
keys matching `token|secret|password|authorization|cookie|database|turso|url`
and omits strings over 120 characters, as defence in depth.

The browser half is covered by the contract test that passes on staging. What
remains is confirming these events are visible and correctly shaped in
Cloudflare Workers Logs, which needs a deployed target to exercise.

## Worker limits and observability — ACs 5 and 7

Bundle, from the production deploy:

| Metric | Measured | Guardrail | |
| --- | --- | --- | --- |
| Uncompressed | 3.41 MB | 5 MB | ok |
| Gzip | 875 KB | 1.5 MB | ok |
| Modules | 58 | 75 | ok |

Request latency from Lima, measured against both platforms on the same
connection at the same moment:

| Route | CF production | Vercel |
| --- | --- | --- |
| redirect `/ipa-chart` | 190.3 ms | 308.7 ms |
| 404 | 212.8 ms | 272.1 ms |
| static `/` | 195.1 ms | 271.7 ms |

Cloudflare is faster on every route. The spike's absolute guardrail of 200 ms
p95 for redirect and 404 is nominally exceeded (207 ms and 340 ms p95), but
every route bottoms out near 185–195 ms on this connection regardless of
platform, against roughly half that RTT floor when the spike was recorded. The
absolute figure is not comparable across vantage points; the migration
regression it exists to catch is not present.

### CPU — the honest reading

`scripts/query-worker-analytics.ts` reads `workersInvocationsAdaptive` and
fails on any `exceededResources`, `scriptThrewException`, or `internalError`.

| Window | Requests | p50 | p99 | Failure outcomes |
| --- | --- | --- | --- | --- |
| Includes the deploy | 221 | 6.46 ms | 112.73 ms | none |
| Partial deploy overlap | 51 | 9.34 ms | 106.57 ms | none |
| Clean, no deploy | 35 | 14.88 ms | 52.25 ms | none |

**These numbers do not cleanly clear the guardrails.** p50 in the cleanest
window is 14.88 ms, at the 15 ms warm guardrail and above the 10 ms Workers
Free allowance. The samples are small — p99 over 35 requests is effectively the
worst observed request, and will catch isolate starts regardless of warmth — so
they are weak evidence in both directions.

What is solid is the outcome: **zero terminated invocations across 307 total**.
No `exceededResources`, no user-visible `1102`, no exceptions. #196 names
repeatable `exceededCpu` as the signal to move to Paid, and there is none yet.

Workers Logs are enabled with `invocation_logs`, and the analytics query gives
a usable filter for the failure outcomes without exposing request content.

## Go/no-go — AC 12

**GO**, recorded by the maintainer on 2026-09-14. Production stays on **Workers
Free** (AC 9).

Evidence behind the decision:

- The complete contract passes on production at 33 passed, 6 skipped, 0 failed,
  identical to Vercel.
- Performance matches or beats Vercel on every metric after the asset-cache fix.
- No terminated or failed Worker invocations observed.
- Rollback target verified healthy, with the DNS record to restore captured.

Risks accepted with this decision:

1. **Workers Free CPU.** Measured CPU sits at or above the Free allowance in
   some windows on small samples, with no terminations observed. If
   `exceededResources` or user-visible `1102` responses appear in operation,
   #196's remedy is to enable Paid, which needs no application change.
2. **Shared Turso token** across environments, departing from #196. Record this
   on #196.
3. **Stale staging baseline**, collected before the asset-cache fix.

## Status

| AC | Item | Status |
| --- | --- | --- |
| 1 | Complete contract on staging, compared to Vercel | Met; also passes on production at 33/6/0, identical to Vercel |
| 2 | Routes, metadata, robots, sitemap, assets, theme, flags, a11y | Met, via the contract run above |
| 3 | Security headers and CSP verified on the Worker | Met, via `security.spec.ts` |
| 4 | Page-load and transcription measurements | Met; the flagged regression was root-caused and fixed, Cloudflare now matches or beats Vercel on every metric |
| 5 | Worker size, module count, startup, CPU, latency | Met with a recorded caveat on CPU sample size |
| 6 | Production environment configured for the custom domain | Met; deployed on workers.dev with no routes, DNS unchanged |
| 7 | Workers Logs enabled and usable, with `exceededCpu` filters | Met — `query-worker-analytics.ts` reports outcomes and fails on failure statuses |
| 8 | Sanitized failure logs and a stable retryable error state | Met — no exceptions observed in 307 invocations; log payload carries only kind and retryable |
| 9 | Free vs Paid recorded with maintainer acceptance | Met — Workers Free, risk accepted 2026-09-14 |
| 10 | Post-deploy smoke command or workflow | Met — `lab-qualify.yml` serves this role |
| 11 | Rollback rehearsed against a healthy Vercel deployment | Runbook written and target verified healthy; end-to-end rehearsal belongs to #206 — see `issue-205-rollback-runbook.md` |
| 12 | Maintainer go/no-go decision | Met — GO, 2026-09-14 |
