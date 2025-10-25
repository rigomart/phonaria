# UI Planner Glossary & Pattern Reference

Shared vocabulary for `/ui-planner` outputs. Reference this file instead of redefining concepts inside individual plans. Keep additions concise and principle-driven.

## Layers (L1–L3)

| Layer | Meaning | Typical Content | Common Pattern Hints | Watch-outs |
|-------|---------|-----------------|----------------------|------------|
| `L1` | Always-visible essentials that support the primary goal on page load. | Critical status, core inputs, navigation anchors, top-line KPIs. | `inlineStatus`, `persistentBanner`, light `collapsible` for micro-sections. | Avoid hiding must-do actions; keep density manageable (5–7 items max). |
| `L2` | Secondary/on-demand detail that clarifies or extends the primary task when users signal intent. | Optional inputs, contextual help, advanced filters, multi-step toggles. | `collapsible`, `tabs`, `popover`, `dialog`, `inlineStatus`. | Ensure triggers are clear; indicate reversible state; honour keyboard focus travel. |
| `L3` | Deep-dive reference or guided flows that users enter intentionally. | Wizards, setup tours, analytics drilldowns, troubleshooting docs. | `wizard`, `drilldown`, `dialog`, `guidedTour`, `microQuiz`. | Provide orientation and exit paths; summarise outcomes back in L1/L2. |

## Priority Scale (P1–P3)

- `P1` **Critical** — Required for successful completion of the primary user goal. Ship in the first increment.
- `P2` **Important** — Strongly improves success or reduces errors, but can defer briefly if needed.
- `P3` **Enhancement** — Adds polish or optional capability; safe to schedule later without blocking value.

## Purpose Roles

| Purpose | Definition | Examples |
|---------|------------|----------|
| `layout` | Structural containers that organise child elements without direct interaction. | Page shells, panels, modal shells. |
| `display` | Surfaces read-only signals or metrics. | Status banners, KPI tiles, result summaries. |
| `input` | Collects user-provided data. | Forms, filters, inline editors. |
| `control` | Manages state or triggers actions. | Toggles, buttons, dropdowns, switches. |
| `feedback` | Communicates system response or guidance after interaction. | Inline validation, toasts, success notices. |
| `nav` | Moves the user between views or major sections. | Tabs, sidebars, breadcrumbs. |

## Grouping Methods

- `spacing` — default; rely on margin/padding to show separation when density is low.
- `border` — subtle delineation when items are related but benefit from a light frame.
- `divider` — thin rule separating sequential items (tables, lists).
- `tint` — neutral background to signal a functional zone.
- `depth` — elevation or shadow to signal focus/overlay.
- `heading` — typographic grouping cue; pairs well with spacing for low-chrome sections.

## Pattern Hints

### Progressive Disclosure & Layering
- `collapsible` — Expand/collapse subsections without leaving the primary view.
- `tabs` — Mutually exclusive views at the same hierarchy level; preserve context.
- `popover` — Lightweight overlay anchored to a trigger for quick actions or help.
- `dialog` — Modal window for focused tasks that temporarily block the background.
- `wizard` — Linear, multi-step journey with clear progress indicators and back/next.
- `drilldown` — Route change or nested view dedicated to detailed exploration.

### Teaching & Learning
- `guidedTour` — Sequential overlays that introduce elements step-by-step (`noticing`).
- `microQuiz` — Quick check to reinforce concepts or confirm understanding (`retrievalPractice`).
- `comparisonPairs` — Side-by-side contrasts to highlight differences (`interleaving`).
- `toolTipSeries` — Contextual hints that appear alongside interactions without overwhelming users.

### Feedback & Support
- `inlineStatus` — Immediate response inline with the triggering control (validation, confirmation).
- `toastNotice` — Temporary notification for background events; non-blocking.
- `persistentBanner` — Sticky alert for critical states requiring acknowledgement.
- `activityLog` — Chronological feed of events for audit or review contexts.

## Accessibility Anchors

- Assign explicit `role` and accessible names for every interactive region (`a11yRoleName`).
- Provide full keyboard paths: Tab order, activation keys, escape routes (`keyboardNav`).
- Ensure visible focus styles across all focusable elements (`focusVisible`).
- Maintain contrast ≥ 4.5:1 for text/icons conveying meaning (`colorContrast`).
- Honour motion preferences; offer alternatives for motion-dependent cues (`reducedMotion`).

## Interaction & Feedback Tips

- Pair every `event` with expected `feedback` states (focus change, inline status, toasts).
- Keep frequent targets large enough to satisfy `fittsLaw`; group options to mitigate `hicksLaw`.
- Document empty/loading/error states for primary components, especially P1 tasks.

## Naming Conventions

- Use PascalCase for component and container names (`ProfileSection`, `SecuritySection`).
- Use camelCase for file-friendly or plan filenames when required.
- Avoid end-user copy in names; favour developer-facing labels that stay stable across locales.

