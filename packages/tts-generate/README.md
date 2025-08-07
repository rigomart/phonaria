# TTS Generate Package

This package is responsible for generating Text-to-Speech (TTS) audio files for the example words used in the Phonexis application. It uses the [ElevenLabs API](https://elevenlabs.io/) to create high-quality audio for each unique word found in the shared phonemes data.

## How It Works

The script performs the following actions:

1.  **Extracts Words**: It reads the `packages/shared/src/phonemes.json` file to gather a unique list of all example words.
2.  **Generates Audio**: It iterates through the list of words and uses the ElevenLabs API to generate an MP3 audio file for each one.
3.  **Saves Files**: The generated `.mp3` files are saved to the `apps/web/public/audio/` directory, making them available to the frontend application.

## Setup

1.  **API Key**: You must have an ElevenLabs API key. Create a `.env` file in this directory (`packages/tts-generate/.env`) and add your key:

    ```
    ELEVENLABS_API_KEY=your_api_key_here
    ```

2.  **Install Dependencies**: From the root of the monorepo, run:
    ```bash
    pnpm install
    ```

## Usage

To generate the audio files, run the following command from the root of the monorepo:

```bash
pnpm run --filter tts-generate generate
```

The script will process all unique words and save the corresponding `.mp3` files to `apps/web/public/audio/`.

### Generating a Sample

For testing or development, you can modify the `generate.ts` script to process only a small sample of words. Locate the following line:

```typescript
const words = extractExampleWords();
```

And modify it to select a few words, for example:

```typescript
const words = extractExampleWords().slice(0, 3);
```

