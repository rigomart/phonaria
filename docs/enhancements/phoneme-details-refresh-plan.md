# Phoneme Details Refresh Plan

## Goals
- Reduce scrolling friction by restructuring phoneme detail content into scannable sections.
- Surface key production cues (articulation, guide, examples) in formats that match learner workflows.
- Reuse shared helpers and translations so the component stays maintainable across dialog and inspector contexts.

## Scope
This plan covers `apps/web/src/components/phoneme-details.tsx`, the shells that embed it (`apps/web/src/app/[locale]/ipa-chart/_components/phoneme-dialog.tsx`, `apps/web/src/app/[locale]/(g2p)/_components/phoneme-inspector.tsx`), and supporting utilities/translations under `apps/web/src`. Shared data additions, if needed, live in `packages/shared-data`.

## Workstreams

### 1. Information Architecture & Layout
1. Group detail subsections into logical clusters (Overview, Production, Practice, Variants) and expose them via a segmented control or tabs to cut vertical scroll.
2. Refactor the dialog layout so the header/audio block stays sticky while content scrolls, and arrange sagittal view plus production cues in a responsive two-column grid on md+ viewports.
3. Introduce an optional section index/anchor bar that mirrors the clustered tabs in contexts where tabs are not used (e.g., the inspector scroll area).

### 2. Content Presentation Enhancements
1. Enrich the header with a synthesized articulation summary (e.g., "Voiceless alveolar fricative") and badge chips for phoneme type and stress markers.
2. Replace bullet-list articulation with a tokenized grid that leverages the articulation registry for tooltips or micro-descriptions.
3. Restructure the pronunciation guide into short, ordered cues (split on paragraphs) and support inline audio snippets if assets exist.
4. Curate example words into labeled mini-cards (onset/coda, stress) with an expandable "More examples" control after a concise default set.

### 3. Progressive Disclosure & Interaction
1. Convert Allophones and Minimal Pairs sections into accordions that show a concise summary row by default, with richer detail on expand.
2. Within allophone details, collapse example lists into compact tables and highlight contexts with badges to minimize vertical space.
3. In minimal pairs, surface a single contrast pair with quick-play audio buttons, pushing the complete session launch behind a call-to-action link.

### 4. Data & Utility Updates
1. Extend the `PhonemeDetails` context with memoized selectors (articulation summary, primary examples) to simplify presentation components.
2. Introduce a stable slug field for every phoneme in `shared-data` so URLs, state, and translation keys reference symbols safely.
3. Add translation-key fields (e.g., `descriptionKey`, `guideKey`) and migrate existing prose out of the data files into locale JSON, using the slug to scope entries.
4. Extract reusable layout primitives (e.g., `PhonemeDetails.Section`, collapsible container) to keep both dialog and inspector implementations consistent.

### 5. Testing & QA
1. Update or add unit tests for new helpers and selector utilities; cover example filtering and articulation summary generation.
2. Capture interaction snapshots (Chromatic or Playwright if available) to confirm the new layouts respond correctly across breakpoints.
3. Verify audio controls and links continue to function after layout changes, and run `pnpm lint`, `pnpm check-types`, and targeted Vitest suites.

## Sequence
1. Build the structural layout changes (Workstream 1) to establish the new scaffolding.
2. Layer in content presentation upgrades (Workstream 2) alongside required data utility work (Workstream 4).
3. Add progressive disclosure interactions (Workstream 3) and refine accordions/tabs once foundational content renders correctly.
4. Finish with testing, QA, and documentation updates (Workstream 5), resolving regressions uncovered during validation.

## Risks & Mitigations
- **Tabs vs. scroll discoverability**: Provide synchronized anchors or fallback inline headings so users can still scan content when tabs are not active.
- **Content density causing cognitive overload**: Validate grouping and badge usage with a quick design review, keeping descriptive text concise.
- **Shared data regressions**: Gate any type additions behind thorough `pnpm check-types` runs and update helper scripts if exports shift.
