# Lab browser contract

Shared Playwright suite for Phonaria. The same specs run against a deployed
base URL through target-specific configuration, not duplicated tests.

This package is the acceptance seam for deployed Phonaria environments. It is
the only browser suite in the repository.

## Run

```bash
bun --cwd packages/lab-contract e2e:install
bun e2e:lab
```

Default target is `cloudflare-production` (`https://phonaria.rigos.dev`).
The suite does not start an application server unless you opt into the local
adapter.

| Command | What it does |
| --- | --- |
| `bun e2e:lab` | Contract against `LAB_CONTRACT_TARGET`, defaulting to Cloudflare production |
| `bun e2e:lab:cloudflare` | Contract against Cloudflare staging (`LAB_CONTRACT_BASE_URL` + Access token) |
| `bun e2e:lab:baseline` | Tagged page-load and transcription timing collection |
| `LAB_CONTRACT_WRITE_BASELINE=1 bun e2e:lab:baseline` | Also write `baselines/<target>.json` |

## Target profiles

Profiles live in `targets/*.json` and are selected with `LAB_CONTRACT_TARGET`.

| Profile | Use |
| --- | --- |
| `cloudflare-staging` | Private staging. Requires `LAB_CONTRACT_BASE_URL` and Cloudflare Access service-token env vars. Practice enabled. |
| `cloudflare-production` | Public Cloudflare production site. Practice disabled. |
| `local` | `http://localhost:3001`. Set `LAB_CONTRACT_START_LOCAL=1` to have Playwright start `apps/lab`. |

Required fields:

- `baseUrl` or `requiresBaseUrlOverride`
- `expectedCanonicalOrigin`
- `practiceEnabled`, `indexingEnabled`, `bucketAssetsAvailable`
- `authentication` (`none` or `cloudflare-access`)
- `capabilities` booleans for `controlledServiceFailure`, `controlledWordlistFailure`, and `practiceSession`

A disabled capability **must** include `skipReasons.<capability>` with a
justification. Missing reasons fail at config load so a gap cannot pass silently.

### Environment overrides

- `LAB_CONTRACT_TARGET` — profile name
- `LAB_CONTRACT_BASE_URL` — deployed origin, no trailing slash
- `LAB_CONTRACT_CANONICAL_ORIGIN` — expected canonical origin when it differs from the request origin
- `LAB_CONTRACT_START_LOCAL=1` — start the local Lab server
- `CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET` — required for `cloudflare-access` targets

## Skip policy

Target-specific gaps use Playwright `test.skip(condition, reason)`. Practice
disabled vs enabled is two explicit describes, not an empty `if`. Controlled
failure tests skip on production because that environment has no test-only
failure hook.

Axe scans exclude known current-Lab findings so the contract measures
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

## Adding a target

1. Copy an existing `targets/*.json` file.
2. Set `name` to the filename stem.
3. Declare every capability. If a capability is `false`, add `skipReasons`.
4. If the origin is not stable yet, set `requiresBaseUrlOverride: true`.
5. Run `bun --cwd packages/lab-contract test` and the contract against that target.
