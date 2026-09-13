# Lab browser contract

Shared Playwright suite for Phonaria Lab. The same specs run against a deployed
base URL through target-specific configuration, not duplicated tests.

This package is the primary acceptance seam for the Lab migration. It is not
the Legacy web E2E suite in `apps/web/e2e`.

## Run

```bash
bun --cwd packages/lab-contract e2e:install
bun e2e:lab:vercel
```

Default target is `vercel-production` (`https://phonaria-lab.rigos.dev`). The
suite does not start an application server unless you opt into the local
adapter.

| Command | What it does |
| --- | --- |
| `bun e2e:lab` | Contract against `LAB_CONTRACT_TARGET`, defaulting to Vercel production |
| `bun e2e:lab:vercel` | Contract against the public Vercel Lab |
| `bun e2e:lab:baseline` | Tagged page-load and transcription timing collection |
| `LAB_CONTRACT_WRITE_BASELINE=1 bun e2e:lab:baseline` | Also write `baselines/<target>.json` |

## Target profiles

Profiles live in `targets/*.json` and are selected with `LAB_CONTRACT_TARGET`.

| Profile | Use |
| --- | --- |
| `vercel-production` | Current public Lab. Practice disabled. |
| `cloudflare-staging` | Private staging. Requires `LAB_CONTRACT_BASE_URL` and Cloudflare Access service-token env vars. Practice enabled. |
| `cloudflare-production` | Public Cloudflare Lab after cutover. Practice disabled. |
| `local` | `http://localhost:3000`. Set `LAB_CONTRACT_START_LOCAL=1` to have Playwright start `apps/lab`. |

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
failure tests skip on Vercel production because that environment has no
test-only failure hook.

## Performance baselines

See `baselines/README.md`. Timing tests are tagged `@baseline` and are excluded
from the functional contract. They record samples and compare them to the
committed baseline without failing on ordinary network variance.

## Adding a target

1. Copy an existing `targets/*.json` file.
2. Set `name` to the filename stem.
3. Declare every capability. If a capability is `false`, add `skipReasons`.
4. If the origin is not stable yet, set `requiresBaseUrlOverride: true`.
5. Run `bun --cwd packages/lab-contract test` and the contract against that target.
