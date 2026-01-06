# Versioning

Phonaria uses Changesets to manage a single product version for the web app.

## Scope

Versioned packages:
- @phonaria/app (apps/web)

Ignored packages (no version bumps required):
- @phonaria/helper-scripts
- @phonaria/audio-gen
- @phonaria/phonetics-data
- @phonaria/ui

## When to add a changeset

Create a changeset for any change that affects the shipped product. Use
`@phonaria/app` in the changeset whenever the user-facing app changes, even if
the code change lives in another package. Examples include:
- UI or UX changes in the app
- IPA / phonetics data changes that surface in the app
- New features or bug fixes

Do not add a changeset when only touching ignored packages, unless the change affects
the shipped app (for example, updated CMUDict JSON or UI component behavior).

## Automated Workflow

The release pipeline is fully automated:

```
Feature PR → main → Version PR (auto) → Merge (manual) → Release (auto) → Deploy (auto)
```

### 1. Development (feature branch)

```bash
# Make changes
bun run changeset        # Select @phonaria/app, choose patch/minor/major
git add .changeset/
git commit -m "feat: your feature"
# Create PR and merge to main
```

### 2. Version PR (automatic)

When you merge to main with pending changesets, the release workflow:
- Detects pending changesets
- Creates a "Version Packages" PR with bumped versions
- Updates the PR if more changesets are merged

### 3. Review and merge (manual checkpoint)

Review the version PR to:
- Verify version bumps are correct
- Batch multiple features into one release if desired
- Merge when ready to release

### 4. Release and deploy (automatic)

When the version PR is merged, the workflow:
- Creates git tag (`@phonaria/app@X.Y.Z`)
- Creates GitHub Release with auto-generated notes
- Triggers Vercel deployment

## SemVer meaning

- patch: bug fix or data correction
- minor: new feature or visible UX change
- major: breaking change

## Manual workflow (fallback)

If automation fails or for special cases:

```bash
bun run changeset:status    # Check pending changesets
bun run changeset:version   # Bump versions
git add -A && git commit -m "chore(release): version packages"
git push
bun run release             # Tag, push, and create release
```

## Notes

- Packages are private and not published to npm
- Tags use package format: `@phonaria/app@X.Y.Z`
- Deployments only trigger on GitHub Release publish
- Vercel auto-deploy disabled for `main` branch only (preview deployments still work)
