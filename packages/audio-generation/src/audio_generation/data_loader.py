"""Load and validate example words data from shared JSON."""

import json
from pathlib import Path
from typing import Final

from pydantic import ValidationError

from audio_generation.models import ExampleWordsData

# Path to shared data JSON file (relative to this package)
SHARED_DATA_PATH: Final[Path] = (
    Path(__file__).parent.parent.parent.parent / "shared-data" / "data" / "example-words.json"
)


def load_example_words(json_path: Path | None = None) -> ExampleWordsData:
    """
    Load and validate example words from JSON file.

    Args:
        json_path: Optional custom path to JSON file. Defaults to shared-data location.

    Returns:
        Validated ExampleWordsData model.

    Raises:
        FileNotFoundError: If the JSON file doesn't exist.
        ValidationError: If the JSON data doesn't match the expected schema.
    """
    path = json_path or SHARED_DATA_PATH

    if not path.exists():
        raise FileNotFoundError(
            f"Example words JSON not found at {path}. "
            f"Expected location: {SHARED_DATA_PATH}"
        )

    with open(path, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    # Remove $schema key if present (JSON schema reference, not data)
    raw_data.pop("$schema", None)

    try:
        return ExampleWordsData.model_validate(raw_data)
    except ValidationError as e:
        raise ValidationError(
            f"Invalid example words data at {path}: {e.error_count()} validation errors"
        ) from e


def get_words_to_generate(json_path: Path | None = None) -> list[str]:
    """
    Get sorted list of unique words that need audio generation.

    Args:
        json_path: Optional custom path to JSON file.

    Returns:
        Sorted list of unique words.
    """
    data = load_example_words(json_path)
    return sorted(data.extract_unique_words())

