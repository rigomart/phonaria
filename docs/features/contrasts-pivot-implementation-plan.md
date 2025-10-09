# Contrasts Pivot Implementation Plan

## Context
- The existing `/minimal-pairs` experience highlights curated minimal-pair drills but the presentation feels promotional, overly spacious, and narrowly scoped.
- We are reframing the surface as a broader “Sound Contrasts” hub while initially continuing to serve the same minimal pair data.
- The minimal pair dataset currently lives in `packages/shared-data`, even though only the web app consumes it.

## Goals
- Rename the feature to “Contrasts” across navigation, metadata, copy, and routes.
- Relocate the minimal pair data into the web app, add learning-stage prioritisation metadata, and remove unused tags.
- Rebuild the page layout with a pragmatic hero, a two-column desktop layout (navigation rail + content), and grouped sections ordered from foundational to specific contrasts.
- Simplify the pair presentation to be denser and clearer while preserving existing audio hooks and pronunciation notes.

## Non-goals
- Regenerating or relocating audio assets (team will handle separately).
- Introducing filter/search interactions on day one; the first iteration remains static.
- Shipping placeholder modules for future contrast resources.

## Workstreams

### 1. Data Restructure
- Create a data module under `apps/web/src/data/contrasts` (or similar) to host the minimal pair set definitions.
- Extend the schema with a `learningStage` field (`"foundation" | "core" | "situational" | "fineTuning"`), populate each set, and remove the old `tags` array.
- Export helper selectors for reuse (`getMinimalPairSets`, `getSetsByStage`, `findSetBySlugOrId`) and update imports in the contrasts page and `phoneme-details`.
- Delete the obsolete `packages/shared-data/src/minimal-pairs.ts` exports and adjust `packages/shared-data/src/index.ts` accordingly.

### 2. Routing & Naming
- Rename the route directory to `/contrasts` (including locale segment) and update `metadata.title`/`description`.
- Add a redirect from `/minimal-pairs` to `/contrasts` to preserve existing links.
- Update navigation links, overview feature cards, and any hard-coded references to the old path/name.

### 3. Layout & Hero
- Replace the current hero with an educational, concise introduction explaining why contrasts matter (e.g., mispronunciation changing meaning) and surfacing the stage structure.
- Implement a two-column layout on desktop: a left navigation column listing the stage anchors and a wider right column for the content. Fall back to a single-column flow on mobile.
- Ensure spacing tokens align with the rest of the app (reduce vertical padding, harmonise gaps).

### 4. Minimal Pair Presentation
- Group and render sets by `learningStage`, ordered from foundational through fine-tuning.
- Refactor `PairCard` into a denser component (single card per set with inline word rows) while keeping audio controls and pronunciation tips.
- Update the articulation snapshot section to fit the new layout and ensure it remains connected to the active set.
- Verify the “Differentiate with…” section in phoneme details still links to the correct route and reflects the new naming.

### 5. Validation & Follow-up
- Run `pnpm lint`, `pnpm check-types`, and the relevant Vitest suites after refactors.
- Add lightweight unit tests for contrast resolution helpers.
- Capture screenshots for the team once spacing and grouping settle (optional but useful for design alignment).

## Sequence & Milestones
1. Data restructure and schema updates.
2. Route rename + redirects + navigation copy.
3. Layout/hero refactor with stage-based grouping.
4. Pair presentation refinements and articulation alignment.
5. Final QA and documentation updates.

## Risks & Considerations
- Route rename impacts SEO/backlinks; the redirect must deploy with the change.
- Learning-stage labels need consensus before data migration; adjust copies if wording changes.
- Spacing tweaks should respect existing design tokens to avoid regressions elsewhere in the theme.

## Open Questions
- Confirm final learning-stage labels (`foundation`, `core`, `situational`, `fineTuning` suggested) before populating data.
- Decide whether the navigation rail needs sticky behaviour on desktop for long lists.

