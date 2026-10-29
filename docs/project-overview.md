# Project overview

Phonaria is a pronunciation toolkit for people learning English. Learners can start with a word or sentence, browse sounds in an IPA chart, or practice without following a fixed course. Explanations use plain language alongside phonetic symbols.

## Learner tools

- **Transcription:** Enter text to see IPA with stress marks. Common words resolve from two browser word lists; other words go through a rate-limited Worker lookup against Turso. Learners can open sound details, audio, and definitions from the result.
- **IPA charts:** Browse English consonants and vowels, with articulation diagrams and descriptions. The underlying phoneme data also includes a Spanish inventory and articulation data.
- **Practice:** Build and review sound sequences. It is on by default locally, enabled by `FLAG_PRACTICE` in staging and preview, and off in production.
- **Minimal-pair practice:** Say a word such as *ship*, shown beside *sheep*, and hear back which sound came through. It is its own tool in the main nav at `/minimal-pairs`, and each pair in a sound's details links to it. It is behind `FLAG_SPEECH`, on in staging and preview and off in production.
  - **Data use:** Each recording goes to Microsoft Azure for scoring and is not kept. Learners can opt in, from a setting on the practice page that is off by default, to sharing scoring results to help tune the checks: the word, its scores, the verdicts and whether they tried again. That is never audio, an account, an IP address or words outside the practice list, and it is deleted after 90 days. See the [app README](../apps/phonaria/README.md#request-time-services).
- **Language Spread:** A scroll-driven story of English over a globe, from its Indo-European ancestor through Old English, the Vikings, the Norman Conquest and the Great Vowel Shift to the English used worldwide today. It stands alone and follows the same flag pattern as Practice through `FLAG_LANGUAGE_SPREAD`. Unlike Practice it is indexed like other public pages, with its own social card and `Article` structured data, and joins the sitemap only in builds where the flag is on. The research behind each stop is in [research/language-spread](research/language-spread/).

The **target accent** is the pronunciation being taught (`en-us` or `es-419`). It is separate from the UI display language. A feature may support one accent before the other; the phonetics-data package records those capabilities.

## How the app is built

There is one TanStack Start app in `apps/phonaria`, deployed to Cloudflare Workers. Shared React components live in `packages/ui`; phoneme metadata and dictionary assets live in `packages/phonetics-data`. The app loads its small pronunciation list immediately and its larger list when needed. Turso stores the full CMU dictionary for server lookups. The Worker also handles definition requests, optional context-aware spelling suggestions, pronunciation scoring, and the opt-in evidence log, a separate Turso database.

See the [root README](../README.md) for local setup, the [app README](../apps/phonaria/README.md) for Worker configuration, and [ADR 0002](adr/0002-single-application-on-cloudflare-workers.md) for the hosting decision.
