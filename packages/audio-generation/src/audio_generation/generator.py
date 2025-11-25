"""Audio file generator with incremental generation support."""

import logging
import re
from dataclasses import dataclass, field
from pathlib import Path

from tqdm import tqdm

from audio_generation.data_loader import get_words_to_generate
from audio_generation.tts_engine import TTSEngine

logger = logging.getLogger(__name__)


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
        device: str | None = None,
    ) -> None:
        """
        Initialize the generator.

        Args:
            output_dir: Directory to save generated audio files.
            json_path: Optional custom path to example-words.json.
            device: PyTorch device for TTS ('cuda', 'cpu', or None for auto).
        """
        self.output_dir = Path(output_dir)
        self.json_path = json_path
        self._engine: TTSEngine | None = None
        self._device = device

    @property
    def engine(self) -> TTSEngine:
        """Lazy-load the TTS engine."""
        if self._engine is None:
            self._engine = TTSEngine(device=self._device)
        return self._engine

    def get_output_path(self, word: str) -> Path:
        """Get the output file path for a word."""
        return self.output_dir / f"{slugify(word)}.mp3"

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
            logger.info(f"Generated: {output_path.name}")
            return GenerationResult(word=word, success=True)
        except Exception as e:
            logger.error(f"Failed to generate '{word}': {e}")
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

