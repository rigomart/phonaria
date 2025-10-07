# IPA Chart Simplification Plan

## Goals
- Reduce duplication between IPA chart components so shared behaviors live in one place.
- Keep `shared-data` focused on reusable phoneme metadata and move UI-only helpers into the web app.
- Remove unused code/state to shrink the surface area developers must understand when working on vowel features.

## Scope
The plan touches `apps/web/src/app/[locale]/ipa-chart` (components, sections, store, local libs) and related entries in `packages/shared-data`. Helper scripts should continue to function with the trimmed exports.

## Workstreams

### 1. Data Ownership & Shared Utilities
1. Relocate `getDiphthongTrajectories` and supporting `END_VOWEL_MAP` logic from `packages/shared-data/src/utils/diphthong.ts` into a web-specific helper (e.g., `apps/web/src/app/[locale]/ipa-chart/_lib/diphthong-trajectories.ts`).
2. Augment diphthong entries in `packages/shared-data/src/vowels.ts` with an explicit `glideTarget` symbol (or similar) so UI layers no longer infer endpoints from string slicing.
3. After the move, shrink `shared-data` exports to raw phoneme metadata and generic utilities only; update imports in the helper scripts to reflect any renamed exports.
4. Review `articulation.ts` and drop UI-only fields (`tooltipSide`, long-form copy) or relocate them into the web app if helper scripts do not need them.

### 2. Chart Constants & Rendering Components
1. Create a single module (e.g., `_lib/vowel-grid.ts`) that exports `HEIGHT_ORDER`, `FRONTNESS_ORDER`, label maps, and optional helpers currently duplicated in both `vowel-chart.tsx` and `diphthong-chart.tsx`.
2. Update both charts to consume the shared module, removing local copies and ensuring they stay in sync with any future changes.
3. Consolidate the rendering of vowel buttons: adapt `PhonemeCard` (or extract a base `PhonemeButton`) so both the vowel grid and category listings use the same focus states, tooltips, and round-vowel styling.

### 3. State & Data Flow Simplification
1. Replace the global `activeSection` store state with Radix Tabs internal state or a local `useState` in `nav-tabs-section.tsx`, keeping the Zustand store focused on dialog selection.
2. Precompute and export grouped vowel arrays (`monophthongs`, `diphthongs`, `rhoticVowels`) from a small selector helper so sections do not repeatedly filter the full `vowels` list at render time.

### 4. Dead Code & Directory Hygiene
1. Confirm whether `_sections/vowels-section.tsx` and `_sections/hero-section.tsx` are still needed; if unused, delete them to avoid stale entry points.
2. Remove `_lib/vowel-coordinates.ts` or repurpose it inside the shared grid module; no other file currently imports it.
3. Audit `packages/shared-data/src/vowel-axis.ts` and any other zero-consumer exports; delete or wire them up within the new shared grid helper.

### 5. Testing & Documentation
1. Run the helper scripts and web app after moving utilities to ensure no missing imports.
2. Add targeted unit tests around the relocated trajectory helper and any new selector utilities.
3. Update documentation (`docs/enhancements/diphthong-chart-improvement-plan.md`, `packages/shared-data/README.md`) to reflect the leaner shared-data contract and shared chart foundations.

## Sequence
1. Adjust shared-data models and move trajectory logic (Workstream 1), updating imports and tests.
2. Introduce shared grid constants and harmonize button rendering (Workstream 2).
3. Simplify state/data flow and remove unused files (Workstreams 3 & 4).
4. Finish with test/documentation updates and run `pnpm lint`, `pnpm check-types`, and targeted Vitest suites.

## Risks & Mitigations
- **Helper script breakage**: Keep script smoke tests in the loop after modifying shared exports.
- **UI regressions from component consolidation**: Capture the existing hover/focus behavior in a visual QA checklist and adjust shared styles carefully.
- **Drift between charts**: By centralizing grid constants and symbol rendering, both charts will inherit changes automatically, reducing long-term divergence.
