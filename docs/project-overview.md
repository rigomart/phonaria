# Project overview

Phonaria is a pronunciation toolkit for people learning English. Learners can start with a word or sentence, browse sounds in an IPA chart, or practice without following a fixed course. Explanations use plain language alongside phonetic symbols.

## Learner tools

- **Transcription:** Enter text to see IPA with stress marks. Common words resolve from two browser word lists; other words go through a rate-limited Worker lookup against Turso. Learners can open sound details, audio, and definitions from the result.
- **IPA charts:** Browse English consonants and vowels, with articulation diagrams and descriptions. The underlying phoneme data also includes a Spanish inventory and articulation data.
- **Practice:** Build and review sound sequences. It is on by default locally, enabled by `FLAG_PRACTICE` in staging and preview, and off in production.

The **target accent** is the pronunciation being taught (`en-us` or `es-419`). It is separate from the UI display language. A feature may support one accent before the other; the phonetics-data package records those capabilities.

## How the app is built

There is one TanStack Start app in `apps/phonaria`, deployed to Cloudflare Workers. Shared React components live in `packages/ui`; phoneme metadata and dictionary assets live in `packages/phonetics-data`. The app loads its small pronunciation list immediately and its larger list when needed. Turso stores the full CMU dictionary for server lookups. The Worker also handles definition requests and optional context-aware spelling suggestions.

See the [root README](../README.md) for local setup, the [app README](../apps/phonaria/README.md) for Worker configuration, and [ADR 0002](adr/0002-single-application-on-cloudflare-workers.md) for the hosting decision.
