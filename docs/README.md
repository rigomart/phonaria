# Phonaria Documentation

This directory centralizes long-form product context, accepted decisions, and the records behind major changes. Use it alongside the package READMEs to understand the rationale behind major systems.

## Directory map

- [`project-overview.md`](./project-overview.md) – A guided tour of the learner experience, architecture, and data sources.
- [`versioning.md`](./versioning.md) – How tags and GitHub Releases are produced, and how deploys relate to them.
- [`adr/`](./adr/) – Accepted architecture and data-model decisions whose reasoning should be preserved for future contributors.
- [`agents/`](./agents/) – Conventions agents follow in this repo: the issue tracker, triage labels, and domain docs.
- [`research/`](./research/) – Point-in-time records of investigations and measured decisions, such as the migration to Cloudflare Workers and the [spelling suggestion case review](./research/issue-247-spelling-suggestion-case-review.md), kept as evidence rather than as current guidance.

Add new documents in logical subfolders to keep related work clustered and easily discoverable.

## When to read what

| Scenario | Start here |
| --- | --- |
| New to the project | [`project-overview.md`](./project-overview.md) for context on goals, personas, and technical architecture. |
| Understanding the current shape of the app | [`adr/0002-single-application-on-cloudflare-workers.md`](./adr/0002-single-application-on-cloudflare-workers.md) for why there is one application and what was dropped. |
| Changing articulation data | [`adr/0001-symbol-faithful-articulations.md`](./adr/0001-symbol-faithful-articulations.md) for the data-model principle. |
| Cutting a release | [`versioning.md`](./versioning.md) for the commit conventions and the release workflow. |

## Contributing documentation

1. Keep filenames descriptive and use kebab-case.
2. Update this README with a short description when new docs are added so the directory remains discoverable.
3. Cross-link to relevant code packages or other documents where it helps the reader connect the dots.
