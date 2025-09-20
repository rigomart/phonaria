# Phonix

Phonix is a phoneme-first ESL pronunciation project focused on helping learners hear and produce the sounds of American English (General American). It emphasizes clear, approachable IPA-based learning and connects individual phonemes to real-word usage.

## Project Overview

This is a monorepo managed with `pnpm` workspaces, consisting of:

- `apps/web`: The main Next.js application combining frontend and API for interactive phoneme learning.
- `packages/shared-data`: Shared data models and utilities for phoneme information.
- `packages/helper-scripts`: Collection of helper scripts including TTS audio generation and data processing utilities.

## Current Status

We are currently implementing the Core MVP features, specifically focusing on phoneme awareness, transcription, and dictionary lookup. The project includes interactive IPA charts, phoneme dialogs with audio examples, a concise dictionary side panel (with pronunciation audio when available), and a comprehensive data model for 40 English phonemes.

## Development

### Prerequisites

- [pnpm](https://pnpm.io/)
- Node.js (version specified in `package.json` engines field)

### Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the application:**
   ```bash
   pnpm -C apps/web dev
   ```

   The Next.js app will be available at `http://localhost:3000` with both the frontend and API running together.

3. **(Optional) Generate example audio:**
   - Add your `ELEVENLABS_API_KEY` to `packages/helper-scripts/.env`.
   - Run the generation script:
     ```bash
     pnpm -C packages/helper-scripts generate
     ```

## Project Structure

For detailed information about each package, see their respective README files:

- [Next.js Application](apps/web/README.md)
- [Shared Data Package](packages/shared-data/README.md)
- [Helper Scripts Package](packages/helper-scripts/README.md)

## New: Dictionary Lookup

- Click any word in G2P results to view definitions in a side panel.
- Pronunciation audio plays when provided by the dictionary source.
- API: `GET /api/dictionary?word=<word>` → `{ success, data }` or `404` with `{ error: "not_found" }`.