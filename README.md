# Phonaria

[Phonaria](https://phonaria.rigos.dev) helps English learners explore pronunciation. It combines text-to-IPA transcription, interactive sound charts, definitions, and pronunciation guidance. Practice is available in local, staging, and preview environments; it is off in production.

## Run locally

Install [Bun 1.3+](https://bun.sh/) and Node.js 22.12+, then run:

```bash
bun install
bun run dev # http://localhost:3000
```

For full transcription, add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to `apps/phonaria/.dev.vars`. The app's Worker reads those keys at request time. Values in `.env.local` alone do not reach that Worker. Restart the dev server after changing `.dev.vars`. `OPENROUTER_API_KEY` in the same file enables context-aware spelling suggestions; transcription works without it. See [the app README](apps/phonaria/README.md) for a safe setup example.

## Check the workspace

```bash
bun run check-types
bun run test
bunx biome check . # read-only; bun run lint applies fixes
bun run build
```

Use `bun run test`: plain `bun test` starts Bun's own test runner instead of this repo's Turbo/Vitest script. The test suite includes a live Wiktionary smoke test that needs internet access. The production build also starts a local Cloudflare Worker during prerendering, so it needs permission to bind local ports.

`bun run e2e` checks the deployed production site by default, not the local dev server. See [the browser contract README](packages/browser-contract/README.md) for target options.

## Where things live

| Path | Purpose |
| --- | --- |
| [`apps/phonaria`](apps/phonaria/README.md) | TanStack Start app and Cloudflare Worker |
| [`packages/phonetics-data`](packages/phonetics-data/README.md) | Phoneme data, pronunciation dictionaries, and curated word lists |
| [`packages/ui`](packages/ui/README.md) | Shared React components and styles |
| [`packages/flags`](packages/flags/README.md) | Environment-backed feature flags |
| [`packages/browser-contract`](packages/browser-contract/README.md) | Playwright checks against a selected target |
| [`packages/helper-scripts`](packages/helper-scripts/README.md) | Dictionary and word-list generation |
| [`packages/audio-gen`](packages/audio-gen/README.md) | Pronunciation audio generation |
| [`docs`](docs/README.md) | Product overview, decisions, and research records |

The browser resolves common words from bundled lists. Other words use a rate-limited Worker lookup against Turso. Phoneme IDs and language-specific data come from `packages/phonetics-data`. See [the project overview](docs/project-overview.md) for the learner experience and architecture.

## License

MIT. The embedded CMU Pronouncing Dictionary retains its [BSD-3-Clause license](CMUdict-BSD-3-LICENSE.md).
