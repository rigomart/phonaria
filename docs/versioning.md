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

Baseline version: 0.5.0.

## When to add a changeset

Create a changeset for any change that affects the shipped product. Use
`@phonaria/app` in the changeset whenever the user-facing app changes, even if
the code change lives in another package. Examples include:
- UI or UX changes in the app
- IPA / phonetics data changes that surface in the app
- New features or bug fixes

Do not add a changeset when only touching ignored packages, unless the change affects
the shipped app (for example, updated CMUDict JSON or UI component behavior).

## Workflow

Add a changeset (feature branches):
- bun run changeset
- choose patch/minor/major
- write a short summary

Prepare a release (main is protected, use a release branch + PR):
- bun run changeset:status
- bun run changeset:version
- commit version bumps (chore(release): vX.Y.Z)
- open a PR from release/vX.Y.Z and merge into main
- tag after merge:
  - bun run changeset:tag
  - git push origin --follow-tags

Notes on tagging:
- Changesets creates package tags in monorepos (for example, @phonaria/app@0.5.0).
- If you want a single global tag (vX.Y.Z), add it manually after merge.

## Automation

CI (optional) can enforce changesets on pull requests and open a release PR on pushes to main:
- PRs fail if versioned packages changed without a changeset.
- The release workflow runs `changeset version` and opens a version bump PR.

## SemVer meaning

- patch: bug fix or data correction
- minor: new feature or visible UX change
- major: breaking change

## Notes

Packages are private and not published to npm. The Changesets config explicitly
versions private packages and does not publish.
