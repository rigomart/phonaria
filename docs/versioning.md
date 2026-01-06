# Versioning

Phonaria uses [Release Please](https://github.com/googleapis/release-please) for automated releases.

## How It Works

```
Conventional Commits → main → Release PR (auto) → Merge → Tag + Release (auto) → Deploy (auto)
```

1. **Development**: Work on feature branches using conventional commits
2. **Preview**: PRs get automatic Vercel preview deployments
3. **Release PR**: Release Please auto-creates a PR with version bump + changelog
4. **Merge**: Merging the release PR creates the tag and GitHub Release
5. **Deploy**: Release triggers Vercel production deployment

## Conventional Commits

Use these commit prefixes to control version bumps:

```bash
# Patch release (0.6.0 → 0.6.1) - Bug fixes
git commit -m "fix: resolve sitemap issue"
git commit -m "fix(seo): correct meta tags"

# Minor release (0.6.0 → 0.7.0) - New features
git commit -m "feat: add find-by-sound page"
git commit -m "feat(ui): implement dark mode"

# Major release (0.6.0 → 1.0.0) - Breaking changes
git commit -m "feat!: redesign API structure"

# No version bump
git commit -m "docs: update README"
git commit -m "chore: update dependencies"
git commit -m "ci: fix workflow"
```

## Creating a Release

1. Write conventional commits in your PRs
2. Merge PRs to main
3. Release Please automatically creates/updates a "Release PR"
4. Review the release PR (shows version bump + changelog)
5. Merge when ready → tag + release created → deploy triggered

## Files

- `.github/release-please-config.json` - Release Please configuration
- `.github/.release-please-manifest.json` - Current version tracking
- `apps/web/CHANGELOG.md` - Auto-generated changelog
- `apps/web/package.json` - Version auto-updated

## Notes

- Only `apps/web` is released (other packages are internal)
- Tags use format `@phonaria/app-v{version}` (e.g., `@phonaria/app-v0.7.0`)
- Vercel auto-deploy is disabled for `main` branch (preview deployments still work)
- Production deploys only happen on GitHub Release publish
