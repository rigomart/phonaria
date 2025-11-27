# Audio Gen

## ElevenLabs demo

Minimal example to synthesize words collected from shared-data to MP3 files.

### Setup
- Add an ElevenLabs API key to `.env` in this package:
  ```
  ELEVENLABS_API_KEY=your_key_here
  # Optional overrides
  # ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
  # ELEVENLABS_MODEL_ID=eleven_turbo_v2
  # WORDS_LIMIT=25 # optional cap while testing
  ```

### Run
- From `packages/audio-gen`:
  ```
  bun run generate
  ```
- Outputs land in `packages/audio-gen/output/*.mp3`.
