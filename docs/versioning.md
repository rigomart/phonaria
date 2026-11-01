# Versioning

Phonaria releases with [release-please](https://github.com/googleapis/release-please). A release
is a production deploy: merging the Release PR tags the version, publishes the GitHub Release and
deploys that tag to `phonaria.rigos.dev`.

## How It Works

```text
Conventional Commits → main → Release PR updates → merge it → tag + GitHub Release + production deploy
```

1. **Development**: Work on feature branches using conventional commits. PRs get a protected
   Cloudflare preview Worker from `preview.yml`.
2. **Merge**: Merge PRs into `main`. Staging deploys every `main` merge from `staging.yml`.
3. **Release PR**: `release.yml` opens or updates one PR titled `chore(main): release phonaria X.Y.Z`.
   It bumps the root `package.json` version, the manifest and `CHANGELOG.md`, so the PR shows the
   next version and its notes before anything ships.
4. **Release**: Merge the Release PR when you want to ship. The same `release.yml` run creates the
   `phonaria-vX.Y.Z` tag and GitHub Release, runs `CI` on it, then calls `production.yml` on that
   tag.

The bot opens the Release PR with `GITHUB_TOKEN`, which starts no workflows, so the PR never gets
the required `ci` check. Merge it with the ruleset bypass ("Merge without waiting for requirements
to be met", or `gh pr merge --admin`). CI still runs before anything deploys.

To redeploy without a new release, run the `Production` workflow from the Actions tab.

## Conventional Commits

Use these commit prefixes to control version bumps. Below 1.0, a breaking change bumps the minor
version (`bump-minor-pre-major`).

```bash
# Patch release (0.5.0 → 0.5.1) - Bug fixes
git commit -m "fix: resolve sitemap issue"

# Minor release (0.5.0 → 0.6.0) - New features, and breaking changes before 1.0
git commit -m "feat: add find-by-sound page"
git commit -m "feat!: redesign API structure"

# No version bump
git commit -m "docs: update README"
git commit -m "chore: update dependencies"
git commit -m "ci: fix workflow"
```

## Files

- `release-please-config.json`: release-please configuration
- `.release-please-manifest.json`: the last released version, updated by each Release PR
- `.github/workflows/release.yml`: runs release-please and the production deploy
- `CHANGELOG.md`: written by release-please. `*.md` is in oxfmt's `ignorePatterns`, so CI's format
  check leaves it alone.

## Notes

- Tags use the format `phonaria-v${version}` (for example, `phonaria-v0.5.0`).
- Only the root `package.json` carries the version; workspace packages keep their own.
- Versioning restarted at 0.5.0 when release-please replaced semantic-release; the older tags and
  Releases were removed from GitHub. `bootstrap-sha` in the config starts the first changelog at
  the last semantic-release version (0.20.0, #195) and is ignored after that release; delete it then.
