# Browser contract

Shared Playwright suite for Phonaria. The same specs run against a deployed
base URL through target-specific configuration, not duplicated tests. A small
`@smoke` set checks each deployment; the full suite remains available for
deliberate qualification runs.

This package is the acceptance seam for deployed Phonaria environments. It is
the only browser suite in the repository.

## Run

```bash
bun run --cwd packages/browser-contract e2e:install
bun run e2e
```

Default target is `cloudflare-production` (`https://phonaria.rigos.dev`).
The suite does not start an application server unless you opt into the local
adapter.

| Command | What it does |
| --- | --- |
| `bun run e2e` | Contract against `CONTRACT_TARGET`, defaulting to Cloudflare production |
| `bun run e2e:smoke` | Focused deployed checks for transcription (client and server), charts/media, Practice flag, a minimal-pair page without speaking practice, a sound page, the head after an in-app move, landing page, headers, and accessibility |
| `bun run e2e:cloudflare` | Contract against Cloudflare staging (`CONTRACT_BASE_URL` + Access token) |
| `bun run e2e:baseline` | Tagged page-load and transcription timing collection |
| `CONTRACT_WRITE_BASELINE=1 bun run e2e:baseline` | Also write `baselines/<target>.json` |

Preview, staging, and production deployment workflows run `e2e:smoke` after
deployment. The preview workflow also checks Wiktionary definitions. The
manual Qualify workflow runs the full `e2e` suite.
Tag only checks that prove a deployed service boundary or a core entry point
with `@smoke`; keep detailed interactions in the full suite.

## Target profiles

Profiles live in `targets/*.json` and are selected with `CONTRACT_TARGET`.

| Profile | Use |
| --- | --- |
| `cloudflare-staging` | Private staging. Requires `CONTRACT_BASE_URL` and Cloudflare Access service-token env vars. Practice and speaking practice enabled. |
| `cloudflare-production` | Public Cloudflare production site. Practice and speaking practice disabled. |
| `local` | `http://localhost:3000`. Set `CONTRACT_START_LOCAL=1` to have Playwright start `apps/phonaria`. Expects the About page off, as on a server started without `FLAG_ABOUT`. |

Required fields:

- `baseUrl` or `requiresBaseUrlOverride`
- `expectedCanonicalOrigin`
- `practiceEnabled`, `languageHistoryEnabled`, `aboutEnabled`, `speechEnabled`, `indexingEnabled`, `bucketAssetsAvailable`
- `authentication` (`none` or `cloudflare-access`)
- `capabilities` booleans for `controlledServiceFailure`, `controlledWordlistFailure`, and `practiceSession`

A disabled capability **must** include `skipReasons.<capability>` with a
justification. Missing reasons fail at config load so a gap cannot pass silently.

### Environment overrides

- `CONTRACT_TARGET` — profile name
- `CONTRACT_BASE_URL` — deployed origin, no trailing slash
- `CONTRACT_CANONICAL_ORIGIN` — expected canonical origin when it differs from the request origin
- `CONTRACT_START_LOCAL=1` — start the local application server
- `CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET` — required for `cloudflare-access` targets

## Skip policy

Target-specific gaps use Playwright `test.skip(condition, reason)`. Practice
disabled vs enabled is two explicit describes, not an empty `if`. Controlled
failure tests skip on production because that environment has no test-only
failure hook.

Axe scans exclude known current findings so the contract measures
migration parity rather than blocking on the existing design system:
`color-contrast` on muted nav/counter tokens, `aria-allowed-attr` on the
header NavigationMenu list, and `aria-toggle-field-name` on the diphthong
switch. Keyboard labels, focus, and other WCAG A/AA rules still fail the suite.

## Performance baselines

See `baselines/README.md`. Timing tests are tagged `@baseline` and are excluded
from the functional contract. They record samples and compare them to the
committed baseline without failing on ordinary network variance.

Transcription is two lanes in `baselines/<target>.json`:

- `transcription.client` — `hello`, a curated-10k client hit
- `transcription.server` — `aardvark`, a CMUdict/Turso hit absent from both curated lists

Do not combine those samples into one median.

## Page speed

`bun run page-speed` runs Lighthouse with its default mobile settings, three
times each, against `/`, `/sounds/th-thin`, `/minimal-pairs/p-b` and
`/ipa-chart/vowels` on `CONTRACT_TARGET`. It writes a table of each page's
median Performance, SEO and Accessibility scores, largest contentful paint,
layout shift and total blocking time to `summary.md` (and to
`GITHUB_STEP_SUMMARY` when set), plus every run's JSON and HTML report, in
`PAGE_SPEED_OUT_DIR` (default `page-speed-reports/`). Chrome must be
installed. SEO leaves out Lighthouse's crawlability check: previews are
`noindex` on purpose, and that one check would hold every SEO score at
about 66.

The preview workflow runs it after the smoke checks and uploads the reports
as the `page-speed-reports` artifact. It is report only: it exits 0 whatever
the numbers are, and the step is `continue-on-error`.

On a `cloudflare-access` target, Lighthouse sends the Access service token
as request headers. Lighthouse copies those headers into the report's
settings, so the script removes them before saving and skips any report
that still holds a token value. A run that ends anywhere but the target's
origin, such as the Access login page, doesn't count toward the medians and
is noted under the table.

## Adding a target

1. Copy an existing `targets/*.json` file.
2. Set `name` to the filename stem.
3. Declare every capability. If a capability is `false`, add `skipReasons`.
4. If the origin is not stable yet, set `requiresBaseUrlOverride: true`.
5. Run `bun run --cwd packages/browser-contract test` and the contract against that target.
