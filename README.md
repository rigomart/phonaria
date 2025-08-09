# Phonix

Phonix is a phoneme-first ESL pronunciation project focused on helping learners hear and produce the sounds of American English (General American). It emphasizes clear, approachable IPA-based learning and connects individual phonemes to real-word usage.

## Why it exists (context)

Many ESL learners struggle with:
- Phoneme blindness (not noticing contrastive sounds)
- IPA intimidation (symbols feel opaque)
- Lack of context (sounds practiced in isolation only)
- Limited feedback without a teacher

Phonix addresses these with a friendly IPA presentation, practical example words, and audio models—not speech analysis. The target user is an intermediate-to-advanced learner aiming for clearer, more confident pronunciation.

## Current status (MVP in progress)

Implemented:
- apps/web: Mobile‑first UI with consonant & vowel exploration, dark mode, audio, accessible dialogs
- Consonant chart refactor: memoized grid hook, extracted cells/dialog, header micro‑learning tooltips (place & manner popovers)
- packages/shared-data: Typed phoneme data (40 phonemes) + articulation metadata (`articulationPlaces`, `articulationManners`) + utilities (audio URLs, display helpers)
- packages/tts-generate: Scripted audio generation for example words (optional)

Planned next:
- Interactive vowel trapezoid + improved vowel navigation
- G2P transcription flow (LLM + Hono.js API)

## Monorepo layout

- apps/
	- web/
		- Vite + React + TypeScript + Tailwind v4 + shadcn/ui components
		- Components (selected):
			- `components/chart/ConsonantChart.tsx`: Table (manner rows × place columns) with memoized grid + header tooltips; dialog includes articulation, examples, allophones
				- `ConsonantCell.tsx`: Renders a cell's phoneme buttons (tooltip + select)
				- `ConsonantDialog.tsx`: Phoneme detail dialog
				- `ArticulationInfoPopover.tsx`: Micro‑help tooltip for place/manner headers
			- `components/chart/VowelChart.tsx`: Cards grouped by height (temporary until interactive chart)
			- `components/phoneme/PhonemeTile.tsx`, `components/phoneme/VowelTile.tsx`: Symbol button + quick audio
			- `components/audio/AudioButton.tsx`: Accessible audio playback
			- `components/theme-provider.tsx`: Class‑based theme (light/dark/system)
		- Styling: dark mode tokens via CSS variables; Tailwind dark variant via `.dark`
		- UI primitives imported from `@/components/ui/*` (shadcn/ui)
- packages/
	- shared-data/
		- src/consonants.ts, src/vowels.ts: 24 consonants, 16 vowels (10 monophthongs, 5 diphthongs, 1 rhotic)
		- src/types.ts: data model (articulation, examples, allophones)
		- src/index.ts: exports data and utilities
		- src/utils/:
			- slug.ts: slugifyWord(word)
			- audio.ts: getExampleAudioUrl(word, base)
			- ipa.ts: toPhonemic(ipa) for UI display
			- examples.ts: listAllExampleWords(), listAllExampleAudioUrls()
	- tts-generate/
		- generate.ts: produces MP3s for all example words using ElevenLabs
		- Outputs to apps/web/public/audio/examples/

## Data and pedagogy

- Inventory (General American):
	- Consonants (24): stops, fricatives, affricates, nasals, liquids, glides
	- Vowels (16): 10 monophthongs, 5 diphthongs, 1 rhotic (ɝ with ɚ allophone)
- Transcription conventions:
	- Use ɹ (not r) for the rhotic consonant; use ɡ (not g)
	- Example phonemic transcriptions are stored without slashes (e.g., bʌt)
	- UI can add slashes using a helper when needed
- Allophones (pedagogically relevant only):
	- Flap ɾ for /t/ and /d/ (e.g., butter, ladder)
	- Glottal stop ʔ for /t/ before syllabic /n/ (e.g., button)
	- Dark L ɫ in syllable-final position (e.g., ball)
	- Unstressed ɚ as the allophone of ɝ

### Articulation metadata (shared-data)

Exported arrays supply concise pedagogical help for chart headers:

```ts
import { articulationPlaces, articulationManners } from "shared-data";

// Example: lookup short description for a place
const alveolar = articulationPlaces.find(p => p.key === "alveolar");
console.log(alveolar?.short);
```

Each place entry: `{ key, label, short, description, how[], articulators[], commonExamples[], order }`.
Each manner entry: `{ key, label, short, description, how[], airflow, commonExamples[], order }`.

### Utilities (shared-data)

- slugifyWord(word): "Make" → make
- getExampleAudioUrl(word, base = "/audio/examples"): builds canonical audio paths
- toPhonemic(ipa): "bʌt" → "/bʌt/" (presentation only)
- listAllExampleWords(): returns unique, sorted example words across data and allophones
- listAllExampleAudioUrls(base?): list of audio URLs built from example words

## TTS generation (optional)

The tts-generate package uses the ElevenLabs API to generate example word audio files. Place an ELEVENLABS_API_KEY in packages/tts-generate/.env and run the generator to populate apps/web/public/audio/examples/.

## Tech plan (next steps)

- Frontend: React + TypeScript + Tailwind v4 + shadcn/ui (mobile-first dark UI)
- Backend/API: Hono.js, integrates with an OpenAI fine-tuned model for G2P
- Audio: One short model clip per example word (derived by slug)

## Web app (apps/web)

- Stack: Vite + React + TypeScript, Tailwind v4, shadcn/ui (Radix under the hood)
- Theming: `ThemeProvider` toggles `light`/`dark`/`system` by applying an `html` class; preference persisted in `localStorage` (key: `phonix-ui-theme`); defaults to system
- Data: Consumes `shared-data` for phoneme sets and helpers
	- Audio URLs: `phonixUtils.getExampleAudioUrl(word)` maps to `/audio/examples/<slug>.mp3`
	- Display: `phonixUtils.toPhonemic(ipa)` renders slashes for UI
- Current views:
	- Consonants: cards grouped by manner (sorted by place); tooltip on hover; dialog with articulation, examples (with audio), and allophones; placeholder box for future side‑view illustration
	- Vowels: cards grouped by height (temporary); tooltip + dialog with articulation and examples (with audio)
- Accessibility: buttons with labels, Radix dialogs/tooltips, keyboard focus via native buttons

How to run (from repository root):
- Install dependencies: pnpm install
- Start web app: pnpm -C apps/web dev (or pnpm --filter web dev)
- Optional: generate audio with ElevenLabs via `packages/tts-generate` (outputs to `apps/web/public/audio/examples/`)

## Roadmap

1. Interactive vowel chart + improved consonant illustrations
2. Sentence analysis (G2P) with phoneme breakdown & playback
3. Minimal pairs + common spelling patterns per phoneme
4. Optional (post‑MVP): progress tracking / personalization

## Requirements and constraints (summary)

- Accent: General American; UI language: English
- No authentication; no progress tracking; no user speech analysis (for now)
- Monorepo with pnpm workspaces