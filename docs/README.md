# Phonaria Documentation

This directory centralizes long-form product context, technical deep-dives, and feature briefs for the Phonaria project. Use it alongside the package READMEs to understand the rationale behind major systems and upcoming enhancements.

## Directory map

- [`project-overview.md`](./project-overview.md) – A guided tour of the learner experience, architecture, and data sources (including dictionary lookup and audio strategy).
- [`enhancements/g2p-plan.md`](./enhancements/g2p-plan.md) – Three-phase roadmap for evolving the grapheme-to-phoneme pipeline with homograph disambiguation and performance wins.
- [`features/minimal-pairs.md`](./features/minimal-pairs.md) – Product notes and UX considerations for future minimal pair drills inside the IPA chart experience.

Add new documents in logical subfolders (`enhancements/`, `features/`, etc.) to keep related work clustered and easily discoverable.

## When to read what

| Scenario | Start here |
| --- | --- |
| New to the project | [`project-overview.md`](./project-overview.md) for context on goals, personas, and technical architecture. |
| Working on the G2P service | [`enhancements/g2p-plan.md`](./enhancements/g2p-plan.md) to understand the current baseline and proposed improvements. |
| Exploring future feature work | [`features/minimal-pairs.md`](./features/minimal-pairs.md) for the next UX milestone. |

## Contributing documentation

1. Keep filenames descriptive and use kebab-case.
2. Update this README with a short description when new docs are added so the directory remains discoverable.
3. Cross-link to relevant code packages or other documents where it helps the reader connect the dots.
