# Phonix

Phonix is a phoneme-first ESL pronunciation project focused on helping learners hear and produce the sounds of American English (General American). It emphasizes clear, approachable IPA-based learning and connects individual phonemes to real-word usage.

## Current Status (MVP in Progress)

We are currently implementing the Core MVP features outlined in [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md#phase-1--core-mvp-phoneme-level-learning), specifically focusing on phoneme awareness and transcription.

**Implemented:**
- **Web App (`apps/web`)**:
  - Mobile-first UI with interactive consonant and vowel charts.
  - Dark mode support.
  - Unified phoneme dialog for detailed information, examples, and audio.
  - Consonant Chart: 2D grid (manner × place) with articulation tooltips.
  - Vowel Chart: 2D grid (height × frontness) with visual encodings for rounding and rhoticity.
- **Shared Data (`packages/shared-data`)**:
  - Typed phoneme data for 40 phonemes (24 consonants, 16 vowels).
  - Articulation metadata (places, manners, vowel dimensions).
  - Utility functions for audio URLs, display formatting, and example word lists.
- **TTS Generation (`packages/tts-generate`)**:
  - Scripted audio generation for example words using ElevenLabs (optional).

**Planned Next:**
- Interactive vowel trapezoid for better vowel navigation.
- Grapheme-to-Phoneme (G2P) transcription flow (using LLM + Hono.js API).

## Project Structure

This is a monorepo managed with `pnpm` workspaces.

- `apps/web`: The main web application.
- `packages/shared-data`: Shared data models and utilities.
- `packages/tts-generate`: Tooling for generating example audio.

### Web App (`apps/web`)

- **Stack**: Vite + React + TypeScript + Tailwind CSS v4 + shadcn/ui.
- **Key Components**:
  - `ipa-chart.tsx`: Main view with tabs for consonants and vowels.
  - `consonant-chart.tsx` & `vowel-chart.tsx`: Interactive 2D grids.
  - `phoneme-dialog.tsx`: Detailed view for a selected phoneme.
  - `audio-button.tsx`: Accessible audio playback.
  - `theme-provider.tsx`: Handles light/dark/system themes.
- **Data**: Consumes `shared-data` for phoneme information and utilities.
- **Styling**: Uses Tailwind CSS with a custom dark theme.
- **Accessibility**: Built with accessible components from Radix UI and proper focus management.

### Shared Data (`packages/shared-data`)

- Defines the core phoneme data (consonants, vowels) and their properties.
- Provides articulation metadata for educational context.
- Includes utility functions for common tasks like generating audio URLs (`getExampleAudioUrl`) and formatting IPA for display (`toPhonemic`).
- Example words and their corresponding audio filenames are managed here.

### TTS Generation (`packages/tts-generate`)

- A utility script to generate audio files for all example words.
- Uses the ElevenLabs API.
- Outputs files to `apps/web/public/audio/examples/`.

## Development

### Prerequisites

- [pnpm](https://pnpm.io/)
- Node.js (version specified in `package.json` engines field)

### Running the Project

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the web application:**
   ```bash
   pnpm -C apps/web dev
   ```
   Or, using pnpm's filter:
   ```bash
   pnpm --filter web dev
   ```

3. **(Optional) Generate example audio:**
   - Add your `ELEVENLABS_API_KEY` to `packages/tts-generate/.env`.
   - Run the generation script:
     ```bash
     pnpm -C packages/tts-generate generate
     ```
   - This will populate `apps/web/public/audio/examples/`.

## Roadmap

For a detailed, phased roadmap, see [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md).

Current focus is on completing the Core MVP (Phase 1), which includes the interactive IPA charts and the basic G2P transcription tool. Subsequent phases will introduce interactive practice, speech input, and personalized learning features.