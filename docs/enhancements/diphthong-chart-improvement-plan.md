# Diphthong Chart Improvement Plan

## Goals
- Preserve the IPA chart's interactive learning focus while clarifying how diphthongs glide between vowel positions.
- Fix accessibility and resilience gaps so keyboard users and dynamic layout changes are handled gracefully.
- Tighten visual communication so start/end positions, path direction, and legend cues are obvious even for first-time ESL learners.

## Scope
This plan covers updates to `apps/web/src/app/[locale]/ipa-chart` components (charts, sections, store) plus supporting utilities in `packages/shared-data`. Visual refinements must land in both the diphthong and monophthong charts so they remain stylistically aligned. The work also includes unit/interaction tests directly tied to these views.

## Workstreams

### 1. Interaction & Accessibility
1. Add `onFocus`/`onBlur` handlers (or CSS `:focus-visible`) on trajectory `<g>` groups so keyboard navigation mirrors hover styling. Ensure `aria-pressed`/`aria-expanded` states stay consistent with dialog behavior.
2. Increase hit areas where possible (e.g., maintain transparent path stroke) and verify assistive tech announces "Diphthong <symbol>" when focused.
3. Introduce a lightweight legend or tooltip explaining start/end markers and the combined diphthong label to reduce ambiguity for screen readers and sighted users alike.

### 2. Layout & Rendering Resilience
1. Replace the manual `window.resize` listener with a `ResizeObserver` watching the grid element. Recompute cell centers when:
   - The observer fires (grid size change).
   - `diphthongs` prop changes (covers data updates/localization).
2. Guard against measurement before layout settles by deferring the first calculation to `requestAnimationFrame` or after fonts load.
3. Fallback gracefully if measurements fail (e.g., log a warning and skip rendering paths instead of crashing).

### 3. Visual & Information Design
1. Raise grid legibility: lighten border color/opacity and, if necessary, surface alternating background shades so each cell is scannable on dark mode.
2. Differentiate start vs. end points (filled vs. outlined, or tinted variants) while keeping color language consistent with `primary`.
3. Slightly thicken path stroke, reposition arrowheads so they sit a few pixels away from end markers, and scale heads up so the arrow form stays visible; add a subtle contrast outline or shadow to keep trajectories readable over the grid.
4. Bump glyph font sizes and add a soft text shadow/halo for IPA labels to prevent overlap with paths. Ensure the combined diphthong label does not occlude start/end letters and that the arrowhead offset keeps the head visible.
5. Rename the diphthong tab header block title (e.g., "Diphthong Glides") to reinforce context and prevent confusion with the monophthong chart copy.
6. Provide a more intentional empty-state treatment inside unused grid cells (e.g., maintain neutral background with understated guidance text on first load, cleared once the user interacts).
7. Add hover feedback on cells or paths (light glow) so the interaction target is obvious before click.
8. Mirror applicable grid, marker, and typography updates in `VowelChart` to keep both vowel views cohesive.

### 4. Data Integrity & Testing
1. Expand `END_VOWEL_MAP` or introduce a fallback that uses the diphthong's own articulation when no map entry exists. Log a developer warning when the fallback activates so future data gaps can be spotted.
2. Write unit tests for `getDiphthongEndPosition`/`getDiphthongTrajectories` covering mapped, fallback, and unmatched symbols.
3. Add component-level tests (e.g., with Testing Library + JSDOM) verifying keyboard navigation, focus styling, and click-to-select behavior.
4. Document the expectations for adding new diphthongs (symbol mapping, legend updates) in the shared-data README or a chart maintenance note inside `/docs`.

## Sequence & Dependencies
1. Start with data integrity and measurement changes to stabilize rendering (`ResizeObserver`, fallback logic).
2. Layer in interaction/accessibility updates so QA can focus on correct state handling early.
3. Apply visual refinements once the behavior is locked, coordinating with design to confirm contrast values and reusing the same tokens/styles in both DiphthongChart and VowelChart.
4. Finish with test coverage and documentation updates, then run `pnpm lint`, `pnpm check-types`, and targeted Vitest suites.

## Testing & QA Checklist
- Keyboard users can tab through trajectories, see visible focus, activate with Enter/Space, and open the phoneme dialog.
- Resizing, zooming, and toggling tabs keeps paths aligned with cell centers (manually verify and add automated coverage if possible).
- All defined diphthongs render; adding a temporary unmapped diphthong in fixtures surfaces a warning but still draws a trajectory.
- Visual review in dark/light themes confirms contrast, label readability, arrowhead visibility, and legend clarity across both vowel charts.
- Unit/integration tests pass along with workspace lint/type checks.

## Risks & Mitigations
- **Font loading shifts**: Mitigate by observing layout and debouncing updates.
- **Overly busy visuals**: Review iterations with design to keep focus on functional clarity.
- **Legend clutter**: Prefer a single concise legend line or tooltip to avoid reintroducing cognitive load.

## Deliverables
- Updated chart components and store logic.
- Refined styles/legend assets.
- Extended shared-data utilities with tests.
- QA notes plus documentation in `/docs` describing maintenance expectations and parity requirements between vowel charts.
