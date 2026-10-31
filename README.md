# Phonaria

[Phonaria](https://phonaria.rigos.dev) is a web toolkit for learning to pronounce American English. Type a word or sentence to see it in IPA, then open any sound to see how it's made, how it's spelled and which sounds it gets mixed up with. There is no course to follow: start from whichever tool fits the question you have. Explanations use plain language next to the phonetic symbols.

## What you can do

- **Transcription** (`/`): turn text into IPA with stress marks. Click a sound for its details, or a word for its recording and a Wiktionary definition. When a word isn't in the dictionary, Phonaria suggests nearby spellings.
- **IPA chart** (`/ipa-chart`): the consonants and vowels of American English, with articulation diagrams, and a Frequency page showing how often each sound comes up in everyday speech.
- **Sound pages** (`/sounds`): a page for each sound, with how it's made, how it's spelled, example words and the sounds it's often mixed up with. The chart's sound tiles link to them.
- **Minimal pairs** (`/minimal-pairs`): pairs of words that differ by one sound, like *ship* and *sheep*, with a page and recordings for each contrast. Sound pages link to them.

## Run locally

Install [Bun 1.3+](https://bun.sh/) and Node.js 22.12+, then run:

```bash
bun install
bun run dev # http://localhost:3000
```

Common words transcribe in the browser from bundled word lists. Other words go to a rate-limited lookup in a Turso copy of the CMU dictionary, so full transcription needs `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in `apps/phonaria/.dev.vars`. The app runs as a Cloudflare Worker, which reads that file at request time; values in `.env.local` alone don't reach it. Restart the dev server after changing `.dev.vars`.

`OPENROUTER_API_KEY` in the same file turns on context-aware spelling suggestions; transcription works without it. The [app README](apps/phonaria/README.md) has a full `.dev.vars` example and describes each service.

## Check the workspace

```bash
bun run check-types
bun run test
bun run lint:check # read-only; bun run lint applies fixes
bun run build
```

Use `bun run test`: plain `bun test` starts Bun's own test runner instead of this repo's Turbo and Vitest script. The suite includes a live Wiktionary smoke test that needs internet access. The production build starts a local Cloudflare Worker to prerender pages, so it needs permission to bind local ports.

`bun run e2e` runs the browser contract against the deployed production site by default, not your local dev server. The [browser contract README](packages/browser-contract/README.md) lists the other targets.

## Repository layout

| Path | What's there |
| --- | --- |
| [`apps/phonaria`](apps/phonaria/README.md) | The app: TanStack Start on Cloudflare Workers |
| [`packages/phonetics-data`](packages/phonetics-data/README.md) | Sound data, the CMU dictionary, curated word lists and minimal pairs |
| [`packages/pronunciation`](packages/pronunciation/README.md) | Scoring and judging which sound a learner said |
| [`packages/ui`](packages/ui/README.md) | Shared React components and styles |
| [`packages/flags`](packages/flags/README.md) | Environment-backed feature flags |
| [`packages/browser-contract`](packages/browser-contract/README.md) | Playwright checks against a deployed site |
| [`packages/helper-scripts`](packages/helper-scripts/README.md) | Dictionary, word-list and minimal-pair tooling |
| [`packages/audio-gen`](packages/audio-gen/README.md) | Word recordings generated with Azure Speech |
| [`docs`](docs/README.md) | Project overview, decisions and research records |

All sound data comes from `packages/phonetics-data`. It also holds a Spanish sound inventory that the app's pages don't use yet. [The project overview](docs/project-overview.md) covers the learner experience and how the app is built. Releases are described in [docs/versioning.md](docs/versioning.md).

## Data and credits

- [CMU Pronouncing Dictionary](https://github.com/cmusphinx/cmudict) from Carnegie Mellon University for transcriptions, under its [BSD-3-Clause license](CMUdict-BSD-3-LICENSE.md).
- [Wiktionary](https://en.wiktionary.org/) for definitions (CC BY-SA 4.0).
- [wordfreq](https://github.com/rspeer/wordfreq) by Robyn Speer for the curated word lists and sound frequencies (CC BY-SA 4.0).
- [Wikimedia Commons](https://commons.wikimedia.org/wiki/General_phonetics) contributors for the sound recordings (CC BY-SA 3.0 and compatible licenses).
- [Azure AI Speech](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech) for word recordings in Jenny, a synthetic US English voice.
- [Jev](https://docs.typesafe.ai/api), TypeSafe's decision model, through OpenRouter, for spelling suggestions.
- The [International Phonetic Association](https://www.internationalphoneticassociation.org/content/full-ipa-chart) for the IPA chart's symbols and layout (CC BY-SA 3.0).

The [credits page](https://phonaria.rigos.dev/credits) has the full list.

## License

Phonaria is MIT licensed, as declared in the root `package.json`. The embedded CMU Pronouncing Dictionary keeps its [BSD-3-Clause license](CMUdict-BSD-3-LICENSE.md).
