"""Audio file generator with incremental generation support."""

import hashlib
import logging
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Final

from tqdm import tqdm

from audio_generation.data_loader import get_words_to_generate
from audio_generation.tts_engine import TTSEngine

logger = logging.getLogger(__name__)
MIN_AUDIO_FILE_BYTES: Final[int] = 512  # Rough guardrail to catch empty/corrupt outputs


def slugify(word: str) -> str:
    """
    Convert word to URL-safe filename slug.

    Args:
        word: Word to slugify.

    Returns:
        Lowercase slug with non-alphanumeric chars replaced by hyphens.
    """
    return re.sub(r"[^a-z0-9]+", "-", word.lower()).strip("-")


@dataclass
class GenerationResult:
    """Result of a single word generation attempt."""

    word: str
    success: bool
    skipped: bool = False
    error: str | None = None


@dataclass
class GenerationSummary:
    """Summary of the entire generation run."""

    total: int = 0
    generated: int = 0
    skipped: int = 0
    failed: int = 0
    results: list[GenerationResult] = field(default_factory=list)

    def add_result(self, result: GenerationResult) -> None:
        """Add a result and update counts."""
        self.results.append(result)
        self.total += 1
        if result.skipped:
            self.skipped += 1
        elif result.success:
            self.generated += 1
        else:
            self.failed += 1

    def print_summary(self) -> None:
        """Print a summary of the generation run."""
        print("\n" + "=" * 50)
        print("Generation Summary")
        print("=" * 50)
        print(f"Total words:  {self.total}")
        print(f"Generated:    {self.generated}")
        print(f"Skipped:      {self.skipped}")
        print(f"Failed:       {self.failed}")

        if self.failed > 0:
            print("\nFailed words:")
            for result in self.results:
                if not result.success and not result.skipped:
                    print(f"  - {result.word}: {result.error}")


class AudioGenerator:
    """
    Generate audio files for phoneme example words.

    Supports incremental generation (skipping existing files) and
    provides progress reporting.
    """

    def __init__(
        self,
        output_dir: Path,
        json_path: Path | None = None,
        voice_name: str | None = None,
        voice_path: Path | None = None,
        voice_config_path: Path | None = None,
        voice_cache_dir: Path | None = None,
    ) -> None:
        """
        Initialize the generator.

        Args:
            output_dir: Directory to save generated audio files.
            json_path: Optional custom path to example-words.json.
            voice_name: Piper voice name (used for defaults).
            voice_path: Path to ONNX model.
            voice_config_path: Path to ONNX JSON config.
            voice_cache_dir: Directory to cache voice assets.
        """
        self.output_dir = Path(output_dir)
        self.json_path = json_path
        self._engine: TTSEngine | None = None
        self._voice_name = voice_name
        self._voice_path = voice_path
        self._voice_config_path = voice_config_path
        self._voice_cache_dir = voice_cache_dir
        self._slug_cache: dict[str, str] = {}
        self._slug_to_word: dict[str, str] = {}

    @property
    def engine(self) -> TTSEngine:
        """Lazy-load the TTS engine."""
        if self._engine is None:
            self._engine = TTSEngine(
                voice_name=self._voice_name or "en_US-ryan-high",
                voice_path=self._voice_path,
                voice_config_path=self._voice_config_path,
                cache_dir=self._voice_cache_dir,
            )
        return self._engine

    def get_output_path(self, word: str) -> Path:
        """Get the output file path for a word."""
        return self.output_dir / f"{self.get_slug(word)}.mp3"

    def get_slug(self, word: str) -> str:
        """Get a deterministic slug, disambiguating collisions with a short hash."""
        if word in self._slug_cache:
            return self._slug_cache[word]

        base_slug = slugify(word)
        slug = base_slug

        digest = hashlib.sha1(word.encode("utf-8")).hexdigest()
        suffix_length = 6
        counter = 1

        # If another word already claimed this slug, append a short hash until unique
        while slug in self._slug_to_word and self._slug_to_word[slug] != word:
            slug = f"{base_slug}-{digest[:suffix_length]}"
            if suffix_length < len(digest):
                suffix_length = min(len(digest), suffix_length + 2)
            else:
                slug = f"{slug}-{counter}"
                counter += 1

        self._slug_cache[word] = slug
        self._slug_to_word[slug] = word
        return slug

    def file_exists(self, word: str) -> bool:
        """Check if audio file already exists for a word."""
        return self.get_output_path(word).exists()

    def generate_word(self, word: str, force: bool = False) -> GenerationResult:
        """
        Generate audio for a single word.

        Args:
            word: Word to generate audio for.
            force: If True, regenerate even if file exists.

        Returns:
            GenerationResult with success/failure info.
        """
        output_path = self.get_output_path(word)

        # Skip if exists and not forcing
        if not force and output_path.exists():
            logger.debug(f"Skipping '{word}' - file exists")
            return GenerationResult(word=word, success=True, skipped=True)

        try:
            self.engine.synthesize_to_mp3(word, output_path)
            if output_path.stat().st_size < MIN_AUDIO_FILE_BYTES:
                raise ValueError("Generated file too small; treating as failed generation.")

            logger.info(f"Generated: {output_path.name}")
            return GenerationResult(word=word, success=True)
        except Exception as e:  # noqa: BLE001 - Catch all TTS errors gracefully
            logger.error(f"Failed to generate '{word}': {e}")
            if output_path.exists():
                try:
                    output_path.unlink()
                except OSError as cleanup_error:
                    logger.warning(
                        "Unable to remove partial file for '%s': %s", word, cleanup_error
                    )
            return GenerationResult(word=word, success=False, error=str(e))

    def generate_all(
        self,
        force: bool = False,
        progress: bool = True,
    ) -> GenerationSummary:
        """
        Generate audio for all words in the dataset.

        Args:
            force: If True, regenerate all files even if they exist.
            progress: If True, show progress bar.

        Returns:
            GenerationSummary with counts and results.
        """
        words = get_words_to_generate(self.json_path)
        summary = GenerationSummary()

        # Ensure output directory exists
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Verify ffmpeg availability early to fail fast with a clear message
        self.engine.ensure_dependencies_ready()

        # Process words with optional progress bar
        iterator = tqdm(words, desc="Generating audio", disable=not progress)

        for word in iterator:
            result = self.generate_word(word, force=force)
            summary.add_result(result)

            # Update progress bar description
            if progress:
                status = "✓" if result.success else "✗"
                if result.skipped:
                    status = "⏭"
                iterator.set_postfix_str(f"{status} {word}")

        return summary

    def list_words(self) -> list[str]:
        """Get list of all words that would be generated."""
        return get_words_to_generate(self.json_path)

    def list_missing(self) -> list[str]:
        """Get list of words that don't have generated audio files."""
        return [word for word in self.list_words() if not self.file_exists(word)]
