# Audio Gen

## ElevenLabs demo

Minimal example to synthesize a few hard-coded utterances to MP3 files.

### Setup
- Add an ElevenLabs API key to `.env` in this package:
  ```
  ELEVENLABS_API_KEY=your_key_here
  # Optional overrides
  # ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
  # ELEVENLABS_MODEL_ID=eleven_turbo_v2
  ```

### Run
- From `packages/audio-gen`:
  ```
  bun run generate
  ```
- Outputs land in `packages/audio-gen/output/*.mp3`.
