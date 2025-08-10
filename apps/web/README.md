# Phonix Web (apps/web)

Mobile-first UI to explore American English phonemes with audio and simple, approachable design.

## Features

- Consonant chart: table (manner rows × place columns) with dotted‑underline header tooltips (place/manner micro‑help)
- Vowel chart: full height × frontness grid (7 × 5) with visual encodings:
  - Rounded (ring), Rhotic (baseline bar); tenseness retained in data only
- Phoneme dialogs: symbol, articulation tags, guide, examples with audio, pedagogically relevant allophones
- Audio: quick playback for example words (one clip per word)
- Dark mode: light/dark/system theme preference persisted
- Routing: TanStack Router (`/` landing placeholder, `/ipa-chart` exploration)

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite`) with dark variant scoped to `.dark`
- shadcn/ui components (Radix UI primitives)
- Data from `packages/shared-data` (consonants, vowels, helpers)

## App Structure

Charts and related hooks/components were reorganized under the `(charts)` route segment:

- `src/routes/(charts)/ipa-chart.tsx`: Chart route with tabs (Consonants | Vowels)
  - `src/routes/(charts)/-components/chart/consonant-chart.tsx`
    - `consonant-cell.tsx`, `articulation-info-popover.tsx`
    - `src/routes/(charts)/-hooks/use-consonant-grid.ts`
  - `src/routes/(charts)/-components/chart/vowel-chart.tsx`
    - `vowel-cell.tsx`, `vowel-axis-info-popover.tsx`
    - `src/routes/(charts)/-hooks/use-vowel-grid.ts`
  - `phoneme-dialog.tsx`: unified dialog for consonant & vowel details
- `src/components/audio/audio-button.tsx`: Audio playback button
- `src/components/theme-provider.tsx`: Theme context/provider
- `src/routes/__root.tsx`: Root layout (theme provider, devtools, outlet)
- `src/routes/index.tsx`: Placeholder landing (future transcription tool)

Removed (legacy) height-grouped vowel card list in favor of grid.

## Data & Audio

- Import from `shared-data`:
  - `consonants`, `vowels`
  - `phonixUtils`: `toPhonemic(ipa)`, `getExampleAudioUrl(word)`
- Example audio files are served from `/audio/examples/<slug>.mp3`
  - Generate with `packages/tts-generate` (optional), or provide your own files in `public/audio/examples/`

## Development

From repository root:

```sh
pnpm install
pnpm -C apps/web dev
```

### Routing Dev

File-based routes are defined under `src/routes`. The plugin generates `routeTree.gen.ts` which is imported by `src/routes/main.tsx` to create the router instance. Add a new page by creating `src/routes/<name>.tsx` using `createFileRoute("/<path>")` and the generator will rebuild the tree.

Current routes:

- `/` – placeholder landing (future transcription UI)
- `/(charts)/ipa-chart` – IPA exploration (internal tab state local)

Devtools: TanStack Router devtools are enabled in the root layout (`<TanStackRouterDevtools />`). They can be removed or gated later.

Build and preview:

```sh
pnpm -C apps/web build
pnpm -C apps/web preview
```

Typecheck & lint:

```sh
pnpm -C apps/web typecheck
pnpm -C apps/web lint
```

## Theming

- Default: `system` (matches OS)
- Toggle persists to `localStorage` (`phonix-ui-theme`)
- Tailwind dark styles use `.dark` class; tokens defined in CSS variables

## Accessibility

- Buttons have labels for screen readers
- Dialogs and tooltips come from Radix primitives (focus management, ARIA)
- Audio controls are keyboard accessible

## Roadmap (UI)

- Dedicated diphthong view + optional glide path visualization
- Vowel trapezoid refinement / coordinate overlay
- Illustration assets for consonant place/manner (dialog + tooltips)
- Minimal pairs + spelling patterns panel
- URL search params for deep linking directly to a symbol/dialog
- Optional side reference / articulation guide panel

## Troubleshooting

- No audio: ensure files exist under `apps/web/public/audio/examples/` with slugs matching `getExampleAudioUrl(word)`
- Vowel grid shows empty dots: that cell has no vowel in General American inventory (placeholder dot is expected)
- Styles missing: verify Tailwind v4 plugin is active and CSS imported in `src/index.css`
- Dark mode not changing: confirm `html` has `dark` class and `ThemeProvider` wraps root
