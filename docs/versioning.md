# Versioning

Phonaria uses [Semantic Release](https://semantic-release.gitbook.io/semantic-release/) for
automated tags and GitHub Releases.

## How It Works

```text
Conventional Commits → main → CI passes → manual Release workflow → Tag + GitHub Release
```

1. **Development**: Work on feature branches using conventional commits.
2. **Preview**: PRs get a protected Cloudflare preview Worker from `lab-start.yml`.
3. **Merge**: Merge PRs into `main`.
4. **CI**: The `CI` workflow must pass for that `main` push.
5. **Release**: Run the `Release` workflow from the Actions tab (manual `workflow_dispatch`).
   Auto-release after CI remains paused; it can be restored whenever the team wants it.
6. **Deploy**: Lab staging deploys on every `main` merge. Lab production is a manual
	`Lab Production` workflow run against `phonaria.rigos.dev`; the former Lab hostname
	redirects to it.

## Conventional Commits

Use these commit prefixes to control version bumps:

```bash
# Patch release (0.5.0 → 0.5.1) - Bug fixes
git commit -m "fix: resolve sitemap issue"
git commit -m "fix(seo): correct meta tags"

# Minor release (0.5.0 → 0.6.0) - New features
git commit -m "feat: add find-by-sound page"
git commit -m "feat(ui): implement dark mode"

# Major release (0.5.0 → 1.0.0) - Breaking changes
git commit -m "feat!: redesign API structure"

# No version bump
git commit -m "docs: update README"
git commit -m "chore: update dependencies"
git commit -m "ci: fix workflow"
```

## Creating a Release

1. Write conventional commits in your PRs.
2. Merge PRs to `main`.
3. Wait for CI to pass.
4. In GitHub Actions, run the `Release` workflow on `main` to publish the tag and GitHub Release.

## Files

- `.releaserc.json` - Semantic Release configuration
- `.github/workflows/release-semantic.yml` - Release workflow (manual `workflow_dispatch`)

## Notes

- Tags use format `phonaria-v${version}` (for example, `phonaria-v0.5.0`).
- Git tags and GitHub Releases are the source of truth for released versions.
- `apps/web/package.json` is not auto-bumped by the release workflow.
- Changelog is tracked in GitHub Releases (no committed `CHANGELOG.md` file).
- `apps/web/package.json` was reset to `0.5.0` intentionally as the new version baseline.
