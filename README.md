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

Implemented in this repo:
- packages/shared-data: Typed phoneme data (40 phonemes) + small utilities for audio paths and display
- packages/tts-generate: Scripted audio generation via ElevenLabs for example words

Not implemented yet (planned next):
- Web app UI (React + TypeScript + shadcn/ui)
- API layer for G2P/LLM glue (Hono.js)
- Sentence analysis flow and interactive IPA chart UI

## Monorepo layout

- apps/
	- (empty for now; planned: web app)
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

## Utilities (shared-data)

- slugifyWord(word): "Make" → make
- getExampleAudioUrl(word, base = "/audio/examples"): builds canonical audio paths
- toPhonemic(ipa): "bʌt" → "/bʌt/" (presentation only)
- listAllExampleWords(): returns unique, sorted example words across data and allophones
- listAllExampleAudioUrls(base?): list of audio URLs built from example words

## TTS generation (optional)

The tts-generate package uses the ElevenLabs API to generate example word audio files. Place an ELEVENLABS_API_KEY in packages/tts-generate/.env and run the generator to populate apps/web/public/audio/examples/.

## Tech plan (next steps)

- Frontend: React + TypeScript + shadcn/ui (mobile-first dark UI)
- Backend/API: Hono.js, integrates with an OpenAI fine-tuned model for G2P
- Audio: One short model clip per example word (derived by slug)

## Roadmap

1) Wire the web app UI to render the IPA chart from shared-data and play audio via getExampleAudioUrl
2) Add sentence analysis (G2P) and show phoneme-level breakdowns with audio models
3) Incremental content: minimal pairs and common spelling patterns per phoneme
4) Optional: progress, personalization—out of scope for MVP

## Requirements and constraints (summary)

- Accent: General American; UI language: English
- No authentication; no progress tracking; no user speech analysis (for now)
- Monorepo with pnpm workspaces