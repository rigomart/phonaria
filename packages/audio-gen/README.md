# Audio generation

Generates pronunciation MP3s for example words with ElevenLabs. The script reads the CMU ARPABET mappings in `data/cmu-arpa-mappings.json` and writes files to `output/`. Generated audio is uploaded to the external audio bucket manually.

## Setup

1. Run `bun install` at the repo root.
2. Generate the word mappings if they are missing or phoneme data has changed:

   ```bash
   bun run --cwd packages/helper-scripts generate-word-mappings
   ```

3. Set `ELEVENLABS_API_KEY` in `packages/audio-gen/.env` (see `.env.example`). `ELEVENLABS_VOICE_ID` and `ELEVENLABS_MODEL_ID` are optional overrides.
4. Generate the audio:

   ```bash
   bun run --cwd packages/audio-gen generate
   ```

The script wraps each word's CMU ARPABET transcription in an SSML phoneme tag before requesting audio. Use `WORDS_LIMIT` for a small local batch. Files under `output/` are generated artifacts; review them before uploading.
