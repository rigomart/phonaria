# Versioning

Phonaria uses Changesets to manage a single product version shared by the core packages.

## Scope

Versioned packages:
- @phonaria/app
- @phonaria/phonetics-data
- @phonaria/ui

Ignored packages (no version bumps required):
- @phonaria/helper-scripts
- @phonaria/audio-gen

Baseline version: 0.5.0

## When to add a changeset

Create a changeset for any change that affects the shipped product. Include
`@phonaria/app` in the changeset whenever the user-facing app changes, even if
the code change lives in another package. Examples include:
- UI or UX changes in the app
- IPA / phonetics data changes
- New features or bug fixes

Do not add a changeset when only touching ignored packages, unless the change produces
new assets that ship to users (for example, updated CMUDict JSON or audio assets).

## Workflow

Add a changeset:
- bun changeset
- choose patch/minor/major
- write a short summary

Prepare a release:
- bun changeset status
- bun changeset version
- commit version bumps
- tag the release as vX.Y.Z (use the app package version)

## Automation

CI enforces changesets on pull requests and opens a release PR on pushes to main:
- PRs fail if versioned packages changed without a changeset.
- The release workflow runs `changeset version` and opens a version bump PR.

## SemVer meaning

- patch: bug fix or data correction
- minor: new feature or visible UX change
- major: breaking change

## Notes

Packages are private and not published to npm. The config explicitly versions private
packages and does not create tags automatically.
