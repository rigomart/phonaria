# Cloudflare preview-worker lifecycle validation

Date: 2026-09-14

## Scope and repository facts

`apps/lab/wrangler.jsonc` defines a base Worker named `phonaria-lab` and
named `staging`, `preview`, and `production` environments.  The existing
[`Lab Start` workflow](../../.github/workflows/lab-start.yml) does **not**
deploy a named environment per pull request.  Instead, its preview job
explicitly deploys the separate script
`phonaria-lab-pr-${{ github.event.pull_request.number }}` with `--name`.
That makes the preview URL and secrets script-specific; it is a sensible
stable name across pushes to one PR.

## Recommendation 1: service tags / Workers Builds / Wrangler environments

### Findings

- The claim that a Wrangler environment is merely another version of one
  Worker is inaccurate. Cloudflare says a named environment effectively
  creates a *new Worker* named `<top-level-name>-<environment-name>`; its
  bindings and variables are treated separately. [Cloudflare: Wrangler
  environments](https://developers.cloudflare.com/workers/wrangler/environments/)
  and [Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
  state this directly.
- Cloudflare's Vite integration selects the environment at build/dev time
  with `CLOUDFLARE_ENV`, rather than relying on a later `wrangler deploy
  --env` selection. This matches the comment and build flow in this
  repository. [Cloudflare: Wrangler environments](https://developers.cloudflare.com/workers/wrangler/environments/)
- Workers Builds and a GitHub Actions/Wrangler deployment are alternative
  CI/CD choices, not a grouping mechanism for manually deployed Workers.
  Workers Builds runs configured build/deploy commands for a Worker connected
  to a GitHub or GitLab repository; Cloudflare explicitly documents external
  CI/CD with Wrangler as the other option. [Cloudflare: CI/CD](https://developers.cloudflare.com/workers/ci-cd/)
  and [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).
- Connecting a repository to environment Workers in Workers Builds requires
  first creating those Workers, connecting the repository to *each*, and
  configuring each deploy command with `--env`. It does not turn arbitrary
  `--name phonaria-lab-pr-N` scripts into environments or one version family.
  [Cloudflare: Workers Builds advanced setups](https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/).
- Workers Builds' default non-production command is `wrangler versions
  upload`, which creates a preview version rather than deploying a distinct
  PR Worker. It may provide a preview URL, subject to product constraints.
  [Cloudflare: Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
  and [GitHub integration](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/).
- Two different kinds of tags are easy to confuse here. The Workers Builds
  API calls the Worker's immutable UUID a Worker `tag` (`external_script_id`);
  it identifies one Worker to the Builds API. Separately, current Wrangler
  applies resource tags named `cf:service=<top-level-name>` and
  `cf:environment=<environment>` when a config defines named environments.
  Those resource tags group sibling environment Workers in the dashboard;
  they are not created exclusively by Workers Builds. [Cloudflare: Workers
  Builds API reference](https://developers.cloudflare.com/workers/ci-cd/builds/api-reference/)
  and [Wrangler source: environment tags](https://github.com/cloudflare/workers-sdk/blob/main/packages/deploy-helpers/src/deploy/helpers/environments.ts).

### Corrected recommendation

Keep GitHub Actions as the deployment authority for this project. Do **not**
also attach Workers Builds to `phonaria-lab`, `phonaria-lab-staging`, or the
PR scripts unless the team deliberately migrates the entire delivery path;
otherwise two systems can deploy the same script with different commands and
credentials. Treat `phonaria-lab`, `phonaria-lab-staging`,
`phonaria-lab-preview`, and `phonaria-lab-pr-N` as separate Workers, even when
Wrangler groups them under the `phonaria-lab` service in the dashboard. The
generated Vite config retains the top-level name and selected `preview`
environment, so this repository's locked Wrangler version can apply those
grouping tags even though the deploy command overrides the final script name
to `phonaria-lab-pr-N`. The current PR naming is appropriate when a persistent,
PR-specific Worker, runtime secrets, and normal Worker logs are required.

If the goal is truly to keep every PR as a version of one Worker, use
`wrangler versions upload --preview-alias pr-N` against a single Worker instead
of Wrangler environments. That is a different preview architecture: preview
URLs are public unless protected with Cloudflare Access, have product
limitations (including no Worker logs), and are retained independently of the
PR lifecycle. [Cloudflare: Preview URLs](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/).
Evaluate that migration separately rather than mixing it with the existing
`--name` flow.

## Recommendation 2: cleanup on `pull_request` close

### Findings

- `pull_request` supports the `closed` activity type. A close event covers
  both merged and unmerged pull requests; only add a `merged` condition when
  cleanup should happen *only* after merging. [GitHub: events that trigger
  workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request).
- `wrangler delete` deletes a Worker **and all associated Cloudflare developer
  platform resources**. It accepts `--name`, `--env`, and `--dry-run`.
  [Cloudflare: `wrangler delete`](https://developers.cloudflare.com/workers/wrangler/commands/workers/#delete).
- Wrangler's official source shows that `--force` bypasses its deletion
  confirmations and dependency check. It is necessary for a non-interactive
  CI cleanup, but is safe here only with the narrow, computed PR name.
  [Cloudflare Wrangler source: `delete.ts`](https://raw.githubusercontent.com/cloudflare/workers-sdk/main/packages/wrangler/src/delete.ts).
- GitHub does not pass repository secrets to pull-request runs from forks,
  and their `GITHUB_TOKEN` is read-only. That blocks the existing preview
  deployment for such PRs, but a same-repository `closed` cleanup can use the
  repository Cloudflare credentials if its workflow is designed to receive
  them. [GitHub: pull-request events and forks](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull-request-events-for-forked-repositories)
  and [workflow permissions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#using-the-permissions-key-for-forked-repositories).
- A close can race with an already-running preview deployment. GitHub
  concurrency groups work across workflows, so the deploy and cleanup
  workflows should deliberately share a stable PR-scoped group and use
  `cancel-in-progress: true`. [GitHub: workflow concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency).

### Corrected recommendation

Add a dedicated cleanup job or workflow triggered by:

```yaml
on:
  pull_request:
    branches: [main]
    types: [closed]
```

Have it authenticate with the existing Cloudflare credentials and delete only
the deterministic PR script. The implemented workflow calls Cloudflare's
delete-script API directly so it can treat an HTTP 404 as an idempotent success:

```sh
DELETE /accounts/$CLOUDFLARE_ACCOUNT_ID/workers/scripts/phonaria-lab-pr-${{ github.event.pull_request.number }}?force=true
```

The operation is idempotent: a PR may never have deployed because credentials
were unavailable or because it came from a fork, so a “Worker not found”
result is reported as already-cleaned rather than failing the workflow. Do
**not** use `--env preview` for this repository's PR cleanup: that targets the
fixed `phonaria-lab-preview` environment Worker, not the
`phonaria-lab-pr-N` Worker created by the preview job.

Also remove `${{ github.workflow }}` from the existing `Lab Start` concurrency
group and use `lab-start-${{ github.event.pull_request.number }}` for PR runs
in both workflows. Otherwise, cleanup can finish first and an older preview
deployment can recreate the Worker afterward. The cleanup workflow does not
need to check out or execute pull-request code; it only needs the numeric PR
identifier and the two Cloudflare credentials.

Before implementation, confirm the API token can delete Workers and audit
the phrase “all associated Cloudflare developer platform resources” for the
account's bindings. The cleanup must never target `phonaria-lab`,
`phonaria-lab-staging`, or `phonaria-lab-preview`.
