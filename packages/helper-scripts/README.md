# Helper Scripts Package

This package contains various helper scripts for the Phonix application, including Text-to-Speech (TTS) audio generation and data processing utilities.

## Available Scripts

### 1. TTS Audio Generation

This script generates Text-to-Speech (TTS) audio files for the example words used in the Phonix application. It uses the [ElevenLabs API](https://elevenlabs.io/) to create high-quality audio for each unique word found in the shared phonemes data.

**How It Works:**

1.  **Extracts Words**: It gathers a unique list of all example words from the `shared-data` package (consonants, vowels, and allophones).
2.  **Generates Audio**: It iterates through the list of words and uses the ElevenLabs API to generate an MP3 audio file for each one.
3.  **Saves Files**: The generated `.mp3` files are saved to the `apps/web/public/audio/examples/` directory, making them available to the frontend application.

### 2. CMUDict JSON Generation

This script downloads the CMU Pronouncing Dictionary and converts it to a compact JSON format for use by the API. The generated JSON file can be bundled with the application for fast dictionary lookups.

**How It Works:**

1.  **Fetches Data**: Downloads the CMUDict data from a configurable URL (set via `CMUDICT_SRC_URL` environment variable).
2.  **Processes Entries**: Parses the dictionary format and handles multiple pronunciations for each word.
3.  **Generates JSON**: Creates a compact JSON file with optimized format for fast API lookups.
4.  **Saves File**: Outputs to `apps/web/public/data/cmudict.json` for bundling with the Next.js application.

## Setup

1. **Install Dependencies**: From the root of the monorepo, run:
    ```bash
    pnpm install
    ```

## Usage

### TTS Audio Generation

To generate the audio files, you need an ElevenLabs API key. Create a `.env` file in this directory (`packages/helper-scripts/.env`) and add your key:

```
ELEVENLABS_API_KEY=your_api_key_here
```

Then run:
```bash
pnpm run --filter helper-scripts generate
```

The script will process all unique words and save the corresponding `.mp3` files to `apps/web/public/audio/examples/`.

#### Generating a Sample (TTS)

For testing or development, you can modify the `generate.ts` script to process only a small sample of words. Locate the following line:

```typescript
const words = extractExampleWords();
```

And modify it to select a few words, for example:

```typescript
const words = extractExampleWords().slice(0, 3);
```

### CMUDict JSON Generation

To generate the CMUDict JSON file, you need to set up the source URL. Create a `.env` file in this directory (`packages/helper-scripts/.env`) with:

```
CMUDICT_SRC_URL=https://raw.githubusercontent.com/rigomart/cmudict/refs/heads/master/cmudict.dict
```

Optionally, you can specify a custom output path:
```
CMUDICT_JSON_PATH=/path/to/your/custom/location.json
```

Then run:
```bash
pnpm run --filter helper-scripts cmudict-to-json
```

The script will download the CMUDict data and save it as a JSON file for use by the API.

