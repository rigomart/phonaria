#!/usr/bin/env python3
"""
Generate how common each English sound is in everyday speech.

Each sound's share is its count over the curated top-10k words, each word
weighted by its wordfreq frequency, using the word's first pronunciation only.

The output carries no timestamp, so re-running with the same inputs and the
same wordfreq version reproduces the committed file.

Usage:
    pip install wordfreq
    python generate-phoneme-frequency.py

Output:
    packages/phonetics-data/data/en/phoneme-frequency.json

License:
    The shares are derived from wordfreq (Apache 2.0 code, CC-BY-SA 4.0
    data) by Robyn Speer, so the generated file is licensed under CC-BY-SA 4.0.
"""

import importlib.metadata
import json
import re
from pathlib import Path

try:
    from wordfreq import word_frequency
except ImportError:
    print("Error: wordfreq not installed. Run: pip install wordfreq")
    exit(1)

WORDFREQ_LANGUAGE = "en"
PERCENT_DECIMALS = 4
STRESS_SUFFIX = re.compile(r"[012]$")


def base_phoneme_ids(pronunciation: str) -> list[str]:
    """Strip vowel stress from a stored pronunciation such as "DH AX0"."""
    return [STRESS_SUFFIX.sub("", token) for token in pronunciation.split()]


def compute_speech_percentages(words: dict, frequency) -> dict[str, float]:
    """Share of all spoken sounds per phoneme, as a percentage.

    Each word contributes its first pronunciation, weighted by its frequency.
    Words without a frequency contribute nothing.
    """
    weights: dict[str, float] = {}
    for word, variants in words.items():
        weight = frequency(word)
        if weight <= 0:
            continue
        for phoneme_id in base_phoneme_ids(variants[0]):
            weights[phoneme_id] = weights.get(phoneme_id, 0.0) + weight
    total = sum(weights.values())
    if total <= 0:
        raise ValueError("No word frequencies found for the curated words")
    return {phoneme_id: weight / total * 100 for phoneme_id, weight in weights.items()}


def rank(percentages: dict[str, float]) -> dict[str, int]:
    """Rank 1 is the most common; ties fall back to phoneme ID order."""
    ordered = sorted(percentages, key=lambda phoneme_id: (-percentages[phoneme_id], phoneme_id))
    return {phoneme_id: index + 1 for index, phoneme_id in enumerate(ordered)}


def build_payload(curated: dict, frequency, wordfreq_version: str) -> dict:
    percentages = compute_speech_percentages(curated["words"], frequency)
    ranks = rank(percentages)
    phonemes = [
        {
            "phonemeId": phoneme_id,
            "percentage": round(percentages[phoneme_id], PERCENT_DECIMALS),
            "rank": ranks[phoneme_id],
        }
        for phoneme_id in sorted(percentages, key=ranks.__getitem__)
    ]

    return {
        "meta": {
            "wordCount": len(curated["words"]),
            "wordfreq": {"version": wordfreq_version, "language": WORDFREQ_LANGUAGE},
            "license": "CC-BY-SA-4.0",
            "attribution": (
                "Derived from wordfreq (Robyn Speer, CC-BY-SA 4.0). "
                "Pronunciations from CMUDict (Public Domain)."
            ),
        },
        "phonemes": phonemes,
    }


def main():
    project_root = Path(__file__).parent.parent.parent
    data_dir = project_root / "packages/phonetics-data/data/en"
    curated = json.loads((data_dir / "curated/top-10k.json").read_text(encoding="utf-8"))
    wordfreq_version = importlib.metadata.version("wordfreq")

    payload = build_payload(
        curated,
        lambda word: word_frequency(word, WORDFREQ_LANGUAGE),
        wordfreq_version,
    )

    output_path = data_dir / "phoneme-frequency.json"
    output_path.write_text(json.dumps(payload, indent="\t") + "\n", encoding="utf-8")

    print(f"Wrote {len(payload['phonemes'])} sounds to {output_path}")
    print("Most common:")
    for row in payload["phonemes"][:5]:
        print(f"  {row['phonemeId']}: {row['percentage']}%")


if __name__ == "__main__":
    main()
