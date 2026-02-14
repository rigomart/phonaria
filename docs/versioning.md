# Versioning

Phonaria uses [Semantic Release](https://semantic-release.gitbook.io/semantic-release/) for
automated tags and GitHub Releases.

## How It Works

```
Conventional Commits → main → CI passes → Semantic Release → Tag + GitHub Release
```

1. **Development**: Work on feature branches using conventional commits.
2. **Preview**: PRs get Vercel preview deployments.
3. **Merge**: Merge PRs into `main`.
4. **CI**: The `CI` workflow must pass for that `main` push.
5. **Release**: A separate release workflow runs after CI success and creates the Git tag and
   GitHub Release.
6. **Deploy**: Vercel production deploy comes from the `main` merge (single deploy path).

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
4. Release workflow runs automatically and publishes the new tag and GitHub Release.

## Files

- `.releaserc.json` - Semantic Release configuration
- `.github/workflows/release-semantic.yml` - Release workflow triggered after CI success

## Notes

- Tags use format `phonaria-v{version}` (for example, `phonaria-v0.5.0`).
- Git tags and GitHub Releases are the source of truth for released versions.
- `apps/web/package.json` is not auto-bumped by the release workflow.
- Changelog is tracked in GitHub Releases (no committed `CHANGELOG.md` file).
