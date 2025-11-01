# Repository Guidelines

## Project Context
Phonaria is a learner-first pronunciation toolkit for ESL learners. It combines interactive IPA references, instant grapheme-to-phoneme transcription, dictionary lookups, and sound contrast practice inside a responsive, audio-first Next.js app that keeps IPA approachable.

## Learner Challenges
- English spelling unpredictability: learners encounter many words whose pronunciation cannot be inferred from spelling alone.
- Limited approachable references: traditional IPA resources feel academic, static, or scattered across multiple sites.
- Fragmented tooling: transcription, dictionary lookup, and contrast practice typically live in separate apps that force context switching.

## Core Toolkit
### Grapheme-to-Phoneme Studio
- Instant transcription with stress markers for any pasted sentence or passage.
- Clickable phoneme insights covering articulation detail, example words, and comparison notes.
- Dictionary bridge to jump from a word in the transcript to concise definitions and usage notes.

### IPA Reference Hub
- Interactive General American IPA chart optimized for responsive layouts.
- Articulation guidance that couples production notes, diagrams, and accessible descriptions.
- Word-level example library with audio so learners can hear each sound in context.

### Sound Contrast Explorer
- Minimal pair collections that focus on frequently confused sounds.
- Listening-first drills to compare audio, IPA transcriptions, and learner notes.
- Articulation cross-references that reinforce distinctions between target phonemes.

### Dictionary Lookup
- In-context definitions available without leaving the workspace.
- Pronunciation confirmation by cross-checking dictionary audio with transcription output.
- Clear empty, retry, and error states tuned for quick iteration.

## Project Structure & Module Organization
- `apps/web`: Next.js App Router project that ships the learner experience and API routes. UI primitives live in `src/components`, hooks in `src/hooks`, shared utilities in `src/lib`, global datasets in `src/data`, and localized content helpers in `src/i18n`. Feature-specific data should stay co-located under its route (e.g. `src/app/**/data`).
- `packages/shared-data`: Source of truth for typed phoneme metadata exported from `src/index.ts`; extend here before consuming new fields in the web app or scripts.
- `packages/helper-scripts`: TypeScript CMUDict and audio utilities that read `.env` config and emit assets into `apps/web/data` or `apps/web/public/audio`.
- `docs`: Product briefs, project overviews, and technical design notes that keep the roadmap and UX rationale documented.

## Build, Test, and Development Commands
- `pnpm install`: Install workspace dependencies once per environment.
- `pnpm dev`: Launch Turborepo dev servers (Next.js at `http://localhost:3000`); use `pnpm -C apps/web dev` for a focused UI loop.
- `pnpm build`: Execute workspace builds before any production verification.
- `pnpm lint`: Run Biome formatting/linting; commits should land with no follow-up edits.
- `pnpm check-types`: Run `tsc --noEmit` across packages to keep strict typings.
- `pnpm test`: Trigger Vitest suites via Turborepo; use `pnpm --filter web test --run` for targeted runs.
- `pnpm -C packages/helper-scripts generate`: Regenerate pronunciation audio once ElevenLabs credentials are set.
- `pnpm -C packages/helper-scripts cmudict-to-json`: Convert a CMUDict plaintext export into the JSON consumed by the app (configure `CMUDICT_SRC_URL` or `CMUDICT_JSON_PATH` as needed).

## Technical Philosophy
### Modern Web Standards
- Performance-first, low-latency interactions that stay responsive on desktop and mobile.
- Responsive surfaces that adapt naturally from phones to large displays.
- Audio-first experience built on Next.js, React, Tailwind CSS, and shadcn/ui.

### Development Standards
- Monorepo architecture keeps shared data, helper scripts, and the web app aligned.
- Strict TypeScript adoption to maintain end-to-end type safety.
- Composable UI patterns and data-driven layouts prevent duplication.
- Modern tooling and reusable components power every surface in the app.

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
- When updating CMUDict assets, use the helper scripts (`cmudict-to-json`, `generate`) and commit outputs under `apps/web/data` or `apps/web/public/audio` so deployments stay deterministic.

## Design & UX Patterns

Core Design Philosophy: Functional Over Marketing:
- Avoid hero sections, gradients, and marketing copy in favor of functional design
- Explain what tools do, not what benefits they provide
- Prefer subtle, functional design over decorative elements

Progressive Disclosure:
- Show examples and guidance only when needed (empty state)
- Remove help elements once users engage with content
- Reduce cognitive load. Single source of truth for each functionality

## Learning Experience Principles
- Toolbox over coursework: allow learners to enter through any feature and combine tools as needed.
- Approachable language: keep explanations plain to demystify IPA, minimal pairs, and articulation terms.
- Audio-first feedback: maintain high-quality recordings that reinforce on-screen content.
- Progressive disclosure: surface guidance when needed and recede as users explore.
- No user tracking: prioritize utility without personalization or progress scoring.

## Upcoming Features
- Spelling Pattern Explorer to explain pronunciation outcomes for recurring endings and highlight them across tools.
- Pronunciation History & Context to surface timelines, cross-language comparisons, and cultural insights that shape English sounds.

## Out of Scope
- Personal progress dashboards, adaptive lesson plans, and personalization engines remain intentionally excluded.
