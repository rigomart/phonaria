# Versioning

Phonaria uses a simple version-based release workflow for the web app.

## How It Works

```
Feature PR → main → Version bump PR → main → Tag + Release (auto) → Deploy (auto)
```

1. **Development**: Work on feature branches, create PRs to main
2. **Preview**: PRs get automatic Vercel preview deployments
3. **Release**: Bump version in `apps/web/package.json` via PR
4. **Auto-release**: Workflow detects version change, creates tag + GitHub Release
5. **Auto-deploy**: Release triggers Vercel production deployment

## Creating a Release

1. Create a PR that bumps the version in `apps/web/package.json`:
   ```json
   {
     "version": "0.7.0"  // was "0.6.0"
   }
   ```

2. Use clear PR title describing what's in the release

3. Merge the PR

4. Workflow automatically:
   - Creates git tag `v0.7.0`
   - Creates GitHub Release with auto-generated notes from PR titles
   - Triggers Vercel production deployment

## SemVer Guidelines

- **patch** (0.6.0 → 0.6.1): Bug fixes, small corrections
- **minor** (0.6.0 → 0.7.0): New features, visible UX changes
- **major** (0.6.0 → 1.0.0): Breaking changes

## Release Notes

GitHub auto-generates release notes from merged PR titles since the last tag. Write clear, descriptive PR titles for better release notes.

**Example release notes:**
```markdown
## What's Changed
* fix(seo): add find-by-sound route to sitemap by @rigomart in #62
* feat(ui): improve mobile navigation by @rigomart in #61

**Full Changelog**: https://github.com/rigomart/phonaria/compare/v0.6.0...v0.7.0
```

## Notes

- Version in `apps/web/package.json` is the source of truth
- Tags use format `v{version}` (e.g., `v0.7.0`)
- Vercel auto-deploy is disabled for `main` branch (preview deployments still work)
- Production deploys only happen on GitHub Release publish
