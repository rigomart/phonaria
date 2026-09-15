# Lab production cutover record

> Historical cutover evidence. The `phonaria-lab` Vercel fallback was retired
> under #207; rollback is now a forward fix or a rebuilt deployment.

Issue #206 moved `phonaria-lab.rigos.dev` from the retained Vercel deployment
to the qualified Cloudflare Worker. The final cutover completed on 2026-09-14
at 13:23 UTC.

## Production identity

| Item | Value |
| --- | --- |
| Qualified and deployed commit | `5860ca14b891fa4a894286e67522db5261c6bd65` |
| Production Worker | `phonaria-lab` |
| Worker origin | `https://phonaria-lab.mirdor-dev.workers.dev` |
| Public hostname | `https://phonaria-lab.rigos.dev` |
| Final Worker version | `d487486b-a303-4e53-b43e-5b4ce2e9593c` |
| Final cutover workflow | [Lab Production 34848892944](https://github.com/rigomart/phonaria/actions/runs/34848892944) |
| Final cutover time | 2026-09-14 13:23 UTC |

The exact commit was deployed and qualified on the Worker origin before the
public hostname changed. [Lab Production
34845403116](https://github.com/rigomart/phonaria/actions/runs/34845403116)
completed with 33 passed, 6 skipped, and 0 failed contract checks.

## Cutover sequence

1. Recorded the existing DNS-only Vercel CNAME and verified both the public
   hostname and Vercel alias were healthy.
2. Deployed commit `5860ca14b891fa4a894286e67522db5261c6bd65` to the
   `workers.dev` origin and ran the complete contract there.
3. Removed the external CNAME only after the qualified Worker origin was ready.
4. Attached the Worker custom domain. [The first public-domain
   run](https://github.com/rigomart/phonaria/actions/runs/34847795391)
   passed the full contract with 33 passed, 6 skipped, and 0 failed.
5. Rehearsed rollback end to end, then reattached the Worker and repeated the
   production contract in the final cutover workflow.

TLS remained valid throughout. No intentional gap existed between a healthy
rollback target and a qualified Worker origin.

## Configuration and secrets

Production uses one shared read-only Turso credential pair:
`LAB_TURSO_DATABASE_URL` and `LAB_TURSO_AUTH_TOKEN` in GitHub Actions, uploaded
to the Worker as `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. Separate Turso
credentials per deployment environment are intentionally not used; the
database access is read-only and the same data is served in each environment.

The final workflow confirmed both secrets were present and uploaded them
without printing their values. Manual transcription checks covered both tiers:

- `hello` returned a client-list transcription.
- `aardvark` returned a successful Turso-backed transcription with IPA details.

## Final verification

The final public-domain workflow passed 33 checks, skipped the 6 checks that do
not apply to the production profile, and failed none. It covers critical
routes, redirects, transcription, assets, metadata, robots, sitemap, security
headers, Practice-disabled behaviour, and not-found responses.

Independent checks after the workflow confirmed:

| Check | Result |
| --- | --- |
| `/` | 200 |
| `/credits` | 200 |
| `/ipa-chart` | 307 to `/ipa-chart/consonants` |
| `/ipa-chart/consonants` | 200 |
| `/ipa-chart/vowels` | 200 |
| `/robots.txt` | 200 |
| `/sitemap.xml` | 200 |
| `/practice` | 404 while Practice is disabled |
| Unknown route | 404 |
| Response owner | `server: cloudflare` with a `cf-ray` header |
| Security policy | Expected content-security-policy header present |

The final upload was 2,283.31 KiB uncompressed and 501.76 KiB gzip, with an
18 ms Worker startup time. These remain within the repository's deployment
guardrails.

The workflow's first post-deploy analytics window contained 54 successful
requests, 0 errors, and no `exceededResources`, `scriptThrewException`, or
`internalError` outcomes. Its CPU sample was p50 13.29 ms and p99 121.72 ms;
the burst includes deployment cold starts and the full browser contract, so it
is not used as steady-state latency evidence.

[Lab Qualify
34849219199](https://github.com/rigomart/phonaria/actions/runs/34849219199)
then collected the live public-domain baseline. Compared with the Vercel
production measurements used for the #205 go/no-go decision, the cutover shows
no latency regression:

| Metric | Vercel | Live CF domain | Delta |
| --- | --- | --- | --- |
| Cold page load | 277 ms | 201 ms | −27.4% |
| Warm page load, median | 66 ms | 57 ms | −13.6% |
| Warm page load, p95 | 94 ms | 78 ms | −17.0% |
| Client transcription, median | 1,026 ms | 1,022 ms | −0.4% |
| Server/Turso transcription, median | 1,031 ms | 1,028 ms | −0.3% |

The live baseline test passed, as did the complete contract in the same run.
A later five-minute window, excluding deployment cold starts, is recorded in
[Lab Qualify
34849552564](https://github.com/rigomart/phonaria/actions/runs/34849552564):
58 successful requests, 0 errors, CPU p50 7.47 ms and p99 108.58 ms, with no
resource-limit, exception, or internal-error outcomes. The p99 is one request
in this small burst; the p50 is below both the 15 ms project guardrail and the
10 ms Workers Free allowance.

## Rollback rehearsal

The rollback procedure prepared for #205 was exercised end to end immediately
after the first cutover:

1. Kept the Worker available at its `workers.dev` origin.
2. Removed `phonaria-lab.rigos.dev` from the Worker's custom domains.
3. Restored the DNS-only CNAME to
   `a75aec73d77054af.vercel-dns-017.com` with automatic TTL.
4. Verified the public response carried Vercel and Next.js headers.
5. Ran [Lab Qualify
   34848503978](https://github.com/rigomart/phonaria/actions/runs/34848503978)
   against `vercel-production`: 33 passed, 6 skipped, 0 failed.
6. Removed the rehearsal CNAME and ran the final public-domain deployment.

Important operational finding: deploying a generated Wrangler configuration
without `routes` keeps the Worker origin available but does not remove an
already-attached custom domain. Rollback must explicitly remove the domain in
Cloudflare before restoring the Vercel CNAME.

## Retirement handoff

Issue #207 retired the Vercel fallback with maintainer approval before the
original seven-day observation window completed. The maintainer explicitly
waived both the elapsed-window criterion and telemetry coverage for that full
window. Continue watching for Worker resource-limit outcomes,
migration-specific errors, transcription/database failures, and sustained
latency outside the recorded Cloudflare baseline.
