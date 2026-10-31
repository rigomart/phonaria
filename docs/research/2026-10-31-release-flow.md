# Release flow review

Date: 2026-10-31. Status: proposal. Nothing in this note has been changed yet. The maintainer picks a flow, and the follow-up tasks at the end turn it into workflow and doc changes.

Question: what release flow suits Phonaria, a web app on Cloudflare Workers with one maintainer, squash merges and conventional commits?

## How it works today

Seven workflows run around a change. Three deploy it, one cuts a release, and none of them connects a release to a deploy.

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `CI` (`pull_request.yml`) | every PR and every push to `main` | lint, format, types, tests, a production build with production flags |
| `Preview` | every PR | builds with all flags on, deploys `phonaria-pr-<n>`, runs smoke checks |
| `Staging` | every push to `main` | builds with all flags on, deploys `phonaria-staging`, runs smoke checks |
| `Production` | manual (`workflow_dispatch`) | builds with Practice, History and Speech off, deploys `phonaria` to `phonaria.rigos.dev`, runs smoke checks unless the `run_contract` input is turned off |
| `Cleanup preview` | PR closed | deletes the PR's preview Worker and marks its deployments inactive |
| `Qualify` | manual | runs the full browser contract against staging or production; deploys nothing |
| `Release` (`release-semantic.yml`) | manual (`workflow_dispatch`) | runs semantic-release, which reads commits since the last `phonaria-v*` tag, picks the next version, pushes the tag and publishes a GitHub Release |

Staging, Preview and Production each record a GitHub Deployment against the commit they built (`scripts/github-deployment.ts`), so the repository's Environments page lists every production deploy with its SHA.

`docs/versioning.md` describes the intended order: merge, CI passes, run Release, then deploy. In practice Release and Production are unrelated. Release does not deploy, and Production does not look at tags.

### What the history shows

- **Releases did happen, then the tags disappeared.** Release ran on `workflow_run` after CI until 2026-09-13. Its logs show it creating tags `phonaria-v0.14.0` through `phonaria-v0.20.0` and publishing GitHub Releases (for example run 34724997919 on 2026-09-12: "Published GitHub release: …/releases/tag/phonaria-v0.20.0"). Today the remote has no tags and no releases (`git ls-remote --tags origin` and `gh api repos/rigomart/phonaria/tags` and `/releases` all return nothing). A local clone still holds 19 `phonaria-v*` tags, from `v0.5.0` (2026-02-13) to `v0.20.0` (2026-09-12). I could not find why the remote tags and releases are gone. The tasks below assume the remote history is gone.
- **A stray tag sits in the local set.** `phonaria-v1.3.0` points at the same commit as `phonaria-v0.5.0`. If the local tags were pushed back, semantic-release would take 1.3.0 as the latest version.
- **Release was paused for a cutover that has finished.** #209 (2026-09-13) switched Release to manual "during Lab migration", and the workflow comment says to restore `workflow_run` "after cutover". The cutover finished with #237 and #260. Release has not run since.
- **Production ships often, with no version.** Production ran 12 times between 2026-09-24 and 2026-10-31 (11 succeeded, one failed on 2026-09-27), the last on `cb269acd`. None of those deploys has a tag or release notes. 126 commits have landed on `main` since `phonaria-v0.20.0`.
- **Not every commit title is conventional.** Squash merges use the PR title (the repository's `squash_merge_commit_title` is `PR_TITLE`). Of those 126 titles, 19 have no type prefix, for example "Clear transcription text and share it as ?q= (#268)" and "Move history into the header and filter it by sound (#290)". semantic-release ignores them, so their changes would not count toward a version bump or show up in its notes. There is no check on PR titles.

## What is broken, missing or redundant

1. **Tags don't say what is live.** The plan in `docs/versioning.md` makes tags the "source of truth for released versions", but a tag marks a commit on `main`, not a deploy. Staging gets every commit, and production gets whatever commit was on `main` when someone pressed the button. Even with Release running, a tag and the production Worker could point at different commits. Right now there are no tags at all.
2. **The version is invisible.** `apps/phonaria/package.json` says `0.1.0` and nothing reads it. The build doesn't embed a version or SHA, and the deploy doesn't pass `--tag` or `--message` to Wrangler, so the Cloudflare dashboard's version list can't be matched to a commit. The GitHub Deployment record is the only link from production to a SHA.
3. **No changelog.** The note says the changelog lives in GitHub Releases, and there are none. Nothing tells a reader what changed in production on a given day.
4. **Production can deploy any branch.** `workflow_dispatch` lets the person running it pick any branch. Production doesn't check that the commit is on `main` or that CI passed for it.
5. **Rollback is undocumented.** There are two ways back, and neither is written down:
   - `wrangler rollback [version-id]` switches the Worker to an earlier version in seconds. Cloudflare keeps the 100 most recent versions for this. Because flags are baked into the build, a rollback also restores that build's flags, which is what you want. It doesn't revert connected resources (the Turso database, rate-limit namespaces). Without `--tag` on deploys, picking the right version ID means matching upload times by hand.
   - Re-running Production on an older commit. The workflow has no ref input, so this needs a branch pointing at the old commit, which is clumsy.
6. **A flag flip ships everything on `main`.** Flags are read at build time. Turning on Practice in production means editing the flag value, merging, and running Production, and that run deploys every other commit merged since the last production deploy. There is no way to flip a flag on the commit that is already live.
7. **Flag values live in seven places.** They are written in the env of `production.yml`, `staging.yml`, `preview.yml` and `pull_request.yml` (the CI build), in the `production`, `staging` and `preview` vars of `wrangler.jsonc`, and as defaults in `scripts/deploy-staging.ts`. The Vite config replaces each `process.env.FLAG_*` with the value in the build environment, so the build takes its flags from the workflow env. Wrangler still uploads the `FLAG_*` entries in `wrangler.jsonc` as runtime vars, but the built code doesn't read them (inferred from `vite.config.mts`, not tested). If the copies disagree, the workflow env wins and nothing warns.
8. **Next Release run would be surprising.** With no tags on the remote, semantic-release treats the next run as the first release and builds notes from the whole history. Its default first version is 1.0.0 (not verified here; its FAQ says it doesn't support starting below 1.0.0). If the old tags were restored, `feat!: remove the legacy Next.js application (#237)` would make the next version 1.0.0. If the stray 1.3.0 tag came back with them, it would be 2.0.0.
9. **Generated notes would announce unfinished features.** The README describes only what is live in production, and leaves out Practice, History and Speech while their flags are off. Notes built from commit or PR titles would list that work anyway: since `phonaria-v0.20.0` there are titles like `feat(practice): add strut and r-colored vowel topics (#381)`, `feat(app): rename Language Spread to History (#397)` and `feat(app): add FLAG_SPEECH and a rate-limited pronunciation scoring route (#343)`. The scope doesn't reliably mark flagged work (#343 and #397 use `app`), and "history" also names the transcription history, which is live (#271, #311). So no filter on today's titles can drop the flagged work cleanly. This applies to all three candidates below.

Some of today's flow works well and should stay. Every PR gets a preview, every `main` push reaches staging with smoke checks, preview Workers are cleaned up when the PR closes, and Production records Worker startup time and a GitHub Deployment on each run.

## Candidate flows

### A. Turn auto-release back on

Restore `workflow_run` on Release so every green `main` push gets a semver tag and GitHub Release. Keep Production manual and separate.

- Cost: one workflow edit, a doc tweak, and a PR-title check so commits stay conventional.
- Gains: notes grouped by commit type, with no new tooling.
- Doesn't fix: tags describe `main`, not production, so problem 1 stays. Tags would follow staging, and nothing would record how far production is behind them. Version numbers climb fast (62 `feat` commits since v0.20.0 would have been dozens of minor releases), and no user sees them.

### B. A production deploy is the release, versioned with semver

Production becomes the only way to release. It deploys `main`, and once the smoke checks pass it runs semantic-release, which tags the deployed commit and publishes notes covering everything since the last production tag. The Release workflow goes away.

- Cost, in three parts:
  - semantic-release skips publishing when `main` has moved past the commit it runs on, so a merge during a deploy can leave that deploy untagged.
  - A deploy that brings only `docs`, `ci` or `chore` commits gets no new version, and so no tag, unless the config is changed to release on every commit type.
  - To show the version in the app, the workflow has to compute it with a dry run before the build and create it after the deploy.
- Gains: every tag is something that was live. Notes come grouped by type.
- Doesn't fix: the semver number still means little for a website with no API consumers. Breaking changes for a learner aren't marked by `feat!`.

### C. A production deploy is the release, versioned by date

Same shape as B, without semantic-release. After a successful production deploy, the Production workflow tags the deployed commit with the date (`phonaria-2026.10.31`, with `.2`, `.3` for later deploys the same day) and creates a draft GitHub Release whose notes list the PR titles merged since the previous production tag (`gh release create --draft --generate-notes --notes-start-tag <previous>`). The maintainer deletes the lines about flagged-off features and publishes it. The tag name is also passed to Wrangler (`--tag`, `--message`) and baked into the build, so the app, the Cloudflare version list and GitHub all show the same name.

- Cost: lose notes grouped by commit type, unless a short script groups PR titles by their `feat:`/`fix:` prefix. Removes four semantic-release dev dependencies.
- Gains: every deploy gets exactly one tag, including flag-only and docs-only deploys. Because the workflow creates the release as a draft, the maintainer removes flagged-off work from the notes before anyone sees them (problem 9). The tag name says when it went live, which is what a solo maintainer looks up when something breaks. No version math, no race with `main`.
- Doesn't fix: nothing in the version says how big the change was. For this app that information sits in the notes anyway.

### Comparison

| | A. Auto-release | B. Deploy = release, semver | C. Deploy = release, date |
| --- | --- | --- | --- |
| Tag means "was in production" | no | yes, but deploys without a `feat` or `fix` get no tag | yes, every deploy |
| Notes per production deploy | no, per `main` push | yes | yes |
| Grouped by commit type | yes | yes | only with a small script |
| Version visible in app and Cloudflare | no | yes, with extra wiring | yes |
| Notes leave out flagged-off work | no, published automatically | no, published automatically | yes, after a hand edit of the draft |
| Moving parts | semantic-release + 2 workflows | semantic-release inside Production | `gh` + Production |
| Race with `main` moving | none | yes | none |

## Recommendation: C

Phonaria is a website. Nobody installs a version of it, so semver's promise to dependents has no audience. What the maintainer needs is "what is live, since when, what changed, and how do I go back", and C answers all four once its follow-up tasks ship, with less machinery than today. Going back rests on task 3. B gets close but keeps semantic-release's edge cases (no-bump deploys, the race with `main`) for a number nobody reads.

Keep conventional commits under C. They make the notes readable and the history searchable, and a check on PR titles would keep them consistent.

The flag problem (6) doesn't depend on the versioning choice. The fix below lets Production deploy a chosen commit, so a flag flip can be deployed on the commit that's already live.

### Follow-up tasks

Each is a separate task. Order matters only where noted.

1. **Decide what to do with the old tags.** Either push the 18 good local `phonaria-v*` tags (`v0.5.0` to `v0.20.0`, without `v1.3.0`; leave out the `wip-snapshot-*` tags and the three old package tags `@phonaria/app-v0.6.0`, `@phonaria/phonetics-data@0.5.0` and `@phonaria/ui@0.5.0`) back to the remote as history, or leave them local. Under C they don't affect anything; the first date tag starts fresh.
2. **Gate Production on `main` and on CI.** For the branch, add `environment: Production` to the deploy job and limit that environment (it already exists, with no rules) to the `main` branch. For CI, add a first step that fails unless the `CI` run for the commit being deployed succeeded (`gh run list --workflow CI --commit <sha>`). That step needs `actions: read` in the job's `permissions` and `GH_TOKEN` in its env.
3. **Let Production deploy a chosen commit.** Add an optional `ref` input (default: `main` HEAD). The workflow itself still runs from `main`, so its flag values come from `main`, while the checkout uses the chosen commit. That covers rollback by redeploy and "flip a flag on the live commit": merge the new flag value, then run Production with `ref` set to the last production tag. The step must fetch `main` (checkout is depth 1) and fail unless the chosen commit is on it.
4. **Tag and release after a successful deploy.** At the end of `production.yml`, after the smoke checks, compute the next `phonaria-YYYY.MM.DD[.N]` tag and run `gh release create <tag> --target <deployed sha> --draft --generate-notes --notes-start-tag <previous tag>`. `gh` creates the tag itself, which matters because checkout runs with `persist-credentials: false`, so a plain `git push` of the tag would fail. The first run has no earlier date tag, so it needs a start point (for example the commit of the previous successful production deploy, or no start tag and a hand-written first note). The job needs `contents: write`. GitHub creates a draft's tag only when the draft is published, so the step that picks the `.N` suffix must count draft releases as well as tags. Optional: a small script that groups the notes by commit type and puts titles with a flagged scope (task 8) in a separate "not live yet" block for the maintainer to delete.
5. **Show the version.** Compute the tag name before the build, expose it to the build (for example `APP_VERSION`, replaced the way `definePublicAppFlags` replaces flags), and pass `--tag <name> --message <sha>` to `wrangler deploy` in Production (and `--tag` with the short SHA in Staging). Where the app shows it, if anywhere (page footer, `/credits`, or only a response header), is a product call.
6. **Remove semantic-release.** Delete `release-semantic.yml`, `.releaserc.json`, the `release` and `release:dry` scripts, and the four `semantic-release` dev dependencies in the root `package.json`. Depends on 4.
7. **Drop the unused flag copies.** Confirm that nothing reads the `FLAG_*` entries in `wrangler.jsonc` vars at runtime, then remove them. Keep each deploy workflow's env as the source of its flags: task 3 relies on the flags coming from the workflow file on `main` while the code comes from an older commit, and a flag file inside the checkout would bring back the old commit's values. To keep CI's production build in step with `production.yml`, add a test that compares the two.
8. **Check PR titles.** Add a CI job that fails when the PR title isn't a conventional commit, since squash merges use it as the commit message. Also agree on scopes for flagged work (`practice`, `history-page`, `speech`) so task 4's script can set those titles aside. Until every flagged PR uses them, the hand edit of the draft stays the real check.
9. **Rewrite `docs/versioning.md`.** Describe the new flow: merge to `main` → staging; run Production → deploy, tag, release; how to roll back (`wrangler rollback` with the tagged version for speed, or run Production with `ref` set to the previous tag); how to flip a flag; and that release notes, like the README, leave out features whose production flag is off. Update the row in `docs/README.md` to match.

## Sources

- Repository files, read in full on 2026-10-31: `docs/versioning.md`, `.releaserc.json`, every file in `.github/workflows`, `apps/phonaria/wrangler.jsonc`, `packages/flags`, `apps/phonaria/vite.config.mts` (flag section), `apps/phonaria/scripts/github-deployment.ts`, `apps/phonaria/scripts/deploy-staging.ts` (flag defaults).
- GitHub, read 2026-10-31: `gh run list` for Production, Staging and Release; Release run logs 34724997919 (created `v0.20.0`), 34771275929 (no release), and the runs that created `v0.14.0` to `v0.20.0`; `gh api` tags, releases, deployments, environments and merge settings.
- Git history: `git log phonaria-v0.20.0..origin/main` (126 commits, commit types counted from titles) and the local tag list.
- Wrangler 4.156.0 `--help` for `deploy` (`--tag`, `--message`), `rollback` and `versions`, run locally.
- Cloudflare, "Rollbacks" (developers.cloudflare.com/workers/configuration/versions-and-deployments/rollbacks/), read through a summary on 2026-10-31: 100 most recent versions; connected resources aren't changed; blocked by Durable Object class changes or deleted R2, KV or queue bindings. Whether secrets and static assets roll back is not stated there and not verified.
- semantic-release FAQ (semantic-release.gitbook.io/semantic-release/support/faq), read through a summary on 2026-10-31: starting below 1.0.0 isn't supported. The 1.0.0 first-release default is not verified.

- GitHub behaviour that a draft release creates its tag only on publish, and `gh release create --target`: not verified here.

Not found: why the remote tags and GitHub Releases are gone.
