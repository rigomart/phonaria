# Audio Generation

Generate MP3 audio files for phoneme example words using [Chatterbox TTS](https://github.com/nari-labs/chatterbox).

## Prerequisites

- Python 3.10+
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
uv run audio-gen generate

# Generate to custom directory
uv run audio-gen generate --output-dir ./output

# Force regenerate all files (ignore existing)
uv run audio-gen generate --force

# Use CPU instead of GPU
uv run audio-gen generate --device cpu
```

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

Files are generated at 192kbps MP3 quality with 24kHz sample rate.

## Performance

- **GPU (CUDA)**: ~0.3s per word
- **CPU**: ~2-3s per word

The generator automatically detects GPU availability and uses it when present.

