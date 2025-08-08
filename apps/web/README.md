# Phonix Web (apps/web)

Mobile-first UI to explore American English phonemes with audio and simple, approachable design.

## Features

- Consonants: cards grouped by manner (stops, fricatives, etc.), sorted by place; tooltips and details dialog
- Vowels: temporary cards grouped by height; planned upgrade to interactive vowel chart
- Details dialogs: symbol + phonemic display, articulation info, example words with audio, allophones (when present)
- Audio: play short model clips for example words
- Dark mode: light/dark/system via class-based theming, defaulting to system

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite`) with dark variant scoped to `.dark`
- shadcn/ui components (Radix UI primitives)
- Data from `packages/shared-data` (consonants, vowels, helpers)

## App Structure

- `src/components/chart/ConsonantChart.tsx`
  - Cards-only view grouped by manner
  - Dialog shows: header, 1:1 illustration placeholder, Articulation, Examples (with audio), Allophones
- `src/components/chart/VowelChart.tsx`
  - Cards-only view grouped by height (temporary)
  - Dialog shows: header, Articulation, Examples (with audio)
- `src/components/phoneme/PhonemeTile.tsx` and `src/components/phoneme/VowelTile.tsx`
  - Symbol button + quick AudioButton for the first example
- `src/components/audio/AudioButton.tsx`
  - Accessible audio playback (HTMLAudioElement)
- `src/components/theme-provider.tsx`
  - Applies `light`/`dark` or follows `system` by toggling the `html` class; persists under `phonix-ui-theme`

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

- Interactive vowel chart (trapezoid) with tap/hover exploration
- Improve consonant dialogs with illustration assets
- Minimal pairs and spelling patterns per phoneme

## Troubleshooting

- No audio: ensure files exist under `apps/web/public/audio/examples/` with slugs matching `getExampleAudioUrl(word)`
- Styles missing: verify Tailwind v4 plugin is active and CSS imports in `src/index.css`
- Dark mode not changing: confirm `html` has `dark` class when toggled and `ThemeProvider` wraps `App`
