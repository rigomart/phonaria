# Audio Generation

Generate MP3 audio files for phoneme example words using [Piper TTS](https://github.com/rhasspy/piper).

## Prerequisites

- Python 3.10–3.11
- uv (Python package manager)
- ffmpeg (for MP3 encoding)

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian  
sudo apt install ffmpeg
```

## Setup

```bash
cd packages/audio-generation

# Install dependencies
uv sync

# (Optional) Pre-download the default voice into the cache
uv run python -m piper.download_voices en_US-ryan-high --output-dir packages/audio-generation/.piper
```

## Development

```bash
# Format code
uv run ruff format src

# Lint code
uv run ruff check src

# Lint and auto-fix
uv run ruff check --fix src

# Type check
uv run pyright src
```

## Usage

### Generate Audio Files

Generate MP3 files for all example words:

```bash
# Generate to default location (apps/web/public/audio/examples)
uv run audio-gen generate --voice-url https://github.com/rhasspy/piper/releases/download/v1.2.0/en_US-ryan-high.onnx --voice-config-url https://github.com/rhasspy/piper/releases/download/v1.2.0/en_US-ryan-high.onnx.json

# Generate to custom directory
uv run audio-gen generate --output-dir ./output

# Force regenerate all files (ignore existing)
uv run audio-gen generate --force

# Use a custom voice path (if already downloaded)
uv run audio-gen generate --voice-path ./models/en_US-ryan-high.onnx --voice-config-path ./models/en_US-ryan-high.onnx.json
```

Notes:
- Default voice is `en_US-ryan-high`. Voice files are cached at `packages/audio-generation/.piper` unless you pass `--voice-cache-dir`.
- If you provide `--voice-path`, also provide `--voice-config-path` (the `.onnx.json` file that ships with the voice).
- You can pre-download voices with `uv run python -m piper.download_voices <voice> --output-dir <dir>`.

### List Words

```bash
# List all words that would be generated
uv run audio-gen list

# List words missing audio files
uv run audio-gen missing
```

## Data Source

Words are loaded from `packages/shared-data/data/example-words.json`, which is the single source of truth for phoneme example words across the monorepo.

The JSON file contains:
- **contrasts** - Minimal pairs showing phoneme distinctions
- **patterns** - Spelling pattern examples  
- **allophones** - Allophone variant examples

## Output

Generated MP3 files are saved with slugified filenames:
- `hello.mp3`
- `think.mp3`
- `mother.mp3`

Files are generated at 192kbps MP3 quality; sample rate matches the Piper voice (en_US-ryan-high is 22050 Hz).

## Performance

- CPU: ~2-3s per word (varies by hardware). Piper is CPU-first.

## Safety & Reliability Notes

- Input validation is strict: JSON is validated with Pydantic (`extra="forbid"`) and word/IPA lengths are bounded to avoid pathological inputs when using `--json-path`.
- Slug collisions are disambiguated with a short hash suffix, so distinct words never overwrite each other.
- ffmpeg is checked before generation; if it is missing, the CLI fails fast with a clear error.
- Piper voice files are downloaded on first run unless you supply `--voice-path/--voice-config-path`. Place them under `packages/audio-generation/.piper` to avoid repeated downloads.
