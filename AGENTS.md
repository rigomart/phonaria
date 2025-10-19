# Repository Guidelines

## Project Context
Phonaria helps ESL learners master General American phonemes through clickable IPA charts, phonemic transcription, and dictionary lookups delivered in a responsive, audio-first Next.js app that keeps IPA approachable.

## Project Structure & Module Organization
- `apps/web`: Next.js App Router for UI and API. Components live in `src/components`, hooks in `src/hooks`, services in `src/lib`; keep feature data under its route (e.g. `src/app/**/data`).
- `packages/shared-data`: Typed phoneme metadata exported from `src/index.ts`; extend here before consuming new fields.
- `packages/helper-scripts`: TypeScript CMUDict and audio utilities that read `.env` config and emit assets into `apps/web/data`.

## Build, Test, and Development Commands
- `pnpm install`: Install workspace dependencies once per environment.
- `pnpm dev`: Launch turbo dev servers (Next.js at `http://localhost:3000`); use `pnpm -C apps/web dev` for app-only loops.
- `pnpm build`: Execute workspace builds before any production verification.
- `pnpm lint`: Run Biome formatting/linting; commits should land with no follow-up edits.
- `pnpm check-types`: Run `tsc --noEmit` across packages to keep strict typings.
- `pnpm test`: Trigger Vitest via Turborepo; target runs with `pnpm --filter web test --run`.
- `pnpm -C packages/helper-scripts generate`: Regenerate pronunciation audio once ElevenLabs credentials are set.

## Coding Style & Naming Conventions
- Biome formats with tab indentation (visual width two) and double quotes—accept formatter output instead of hand-tuning.
- Prefer TypeScript modules with named exports; React components export PascalCase symbols even if the file name is kebab-case.
- Keep shared utilities under `apps/web/src/lib` and reuse path aliases (`@/components/...`) rather than relative dot paths.

## Testing Guidelines
- Vitest drives `apps/web` tests; co-locate specs using `.test.ts` (see `apps/web/src/app/api/dictionary/_services/dictionary-service.test.ts`).
- Favor fast unit coverage on API helpers and hooks; integration tests should mock network boundaries.
- Before pushing, run `pnpm --filter web test` and resolve snapshots or type failures alongside lints.

## Commit & Pull Request Guidelines
- Follow the Conventional Commit style: `type(scope): summary` (e.g. `feat(api): add g2p fallback`).
- Squash fixups locally and keep scopes aligned with the touched package (`web`, `helper-scripts`, etc.).
- PRs need a short summary, linked issue or task, and confirmation of `pnpm lint`, `pnpm check-types`, and `pnpm test`. Add UI screenshots or API samples when behavior changes.

## Environment & Configuration Tips
- Never commit secrets. Keep runtime credentials in `apps/web/.env.local` and ElevenLabs keys in `packages/helper-scripts/.env`.
- When updating CMUDict assets, regenerate via helper scripts and commit the JSON under `apps/web/data` so deployments stay deterministic.

## Design & UX Patterns

Core Design Philosophy: Functional Over Marketing:
- Avoid hero sections, gradients, and marketing copy in favor of functional design
- Explain what tools do, not what benefits they provide
- Prefer subtle, functional design over decorative elements

Progressive Disclosure:
- Show examples and guidance only when needed (empty state)
- Remove help elements once users engage with content
- Reduce cognitive load. Single source of truth for each functionality