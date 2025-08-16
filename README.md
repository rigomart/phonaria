# Phonix

Phonix is a phoneme-first ESL pronunciation project focused on helping learners hear and produce the sounds of American English (General American). It emphasizes clear, approachable IPA-based learning and connects individual phonemes to real-word usage.

## Project Overview

This is a monorepo managed with `pnpm` workspaces, consisting of:

- `apps/web`: The main web application for interactive phoneme learning.
- `packages/shared-data`: Shared data models and utilities for phoneme information.
- `packages/tts-generate`: Tooling for generating example audio files.

## Current Status

We are currently implementing the Core MVP features, specifically focusing on phoneme awareness and transcription. The project includes interactive IPA charts, phoneme dialogs with audio examples, and a comprehensive data model for 40 English phonemes.

## Development

### Prerequisites

- [pnpm](https://pnpm.io/)
- Node.js (version specified in `package.json` engines field)

### Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the web application:**
   ```bash
   pnpm -C apps/web dev
   ```

3. **(Optional) Generate example audio:**
   - Add your `ELEVENLABS_API_KEY` to `packages/tts-generate/.env`.
   - Run the generation script:
     ```bash
     pnpm -C packages/tts-generate generate
     ```

## Project Structure

For detailed information about each package, see their respective README files:

- [Web Application](apps/web/README.md)
- [Shared Data Package](packages/shared-data/README.md)
- [TTS Generation Package](packages/tts-generate/README.md)

## Roadmap

For a detailed, phased roadmap, see [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md).

Current focus is on completing the Core MVP (Phase 1), which includes the interactive IPA charts and the basic G2P transcription tool. Subsequent phases will introduce interactive practice, speech input, and personalized learning features.