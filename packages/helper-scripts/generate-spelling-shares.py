#!/usr/bin/env python3
"""
Rank each en-us sound's spellings by how often they spell it in everyday words.

Matches the letters of each curated top-10k word (its first pronunciation, an
/ɔ/ form first as the app shows it) to its sounds, weights each word by its wordfreq frequency, and keeps, per sound,
each spelling's share and its most frequent words where the sound starts,
sits inside and ends a word. Spellings under 2% of their sound go under
"other"; spellings of two sounds at once (x in box) and silent letters are
left out of the ranking and listed on the review sheet.

The output carries no timestamp, so re-running with the same inputs and the
same wordfreq version reproduces the committed file.

Usage:
    pip install wordfreq
    python3 packages/helper-scripts/generate-spelling-shares.py

Output:
    packages/phonetics-data/data/en/spelling-shares.json
    packages/helper-scripts/output/spelling-shares.md (review sheet, git-ignored)

License:
    The shares are derived from wordfreq (Apache 2.0 code, CC-BY-SA 4.0
    data) by Robyn Speer, so the generated file is licensed under CC-BY-SA 4.0.
"""

from __future__ import annotations

import importlib.metadata
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from spelling_alignment import align_words  # noqa: E402
from spelling_shares import (  # noqa: E402
    DATA_DIR,
    HELPER_SCRIPTS_DIR,
    OTHER_BELOW_PERCENT,
    WORDS_PER_POSITION,
    SpellingTally,
    build_sound_entry,
    load_inputs,
    make_is_example,
    tally,
)

try:
    from wordfreq import word_frequency
except ImportError:
    print("Error: wordfreq not installed. Run: pip install wordfreq")
    sys.exit(1)

WORDFREQ_LANGUAGE = "en"
OUTPUT_PATH = DATA_DIR / "spelling-shares.json"
REVIEW_PATH = HELPER_SCRIPTS_DIR / "output/spelling-shares.md"


def build_payload(sound_ids, result: SpellingTally, frequency, is_example, meta: dict) -> dict:
    return {
        "meta": meta,
        "phonemes": {
            sound: build_sound_entry(result.sounds[sound], frequency, is_example)
            for sound in sound_ids
            if sound in result.sounds
        },
    }


def review_sheet(payload: dict, result: SpellingTally, failed: list[str], aligned_count: int) -> str:
    lines = [
        "# Spelling shares review",
        "",
        f"{aligned_count} words matched, {len(failed)} not. Shares weight each word by how often it is used.",
        f"Spellings under {OTHER_BELOW_PERCENT:g}% of their sound are listed as other spellings.",
        "",
    ]
    for sound, entry in payload["phonemes"].items():
        lines += [f"## {sound}", "", "| Spelling | Share | Start | Inside | End |", "| --- | ---: | --- | --- | --- |"]
        for kind, rows in (("", entry["spellings"]), ("other: ", entry["other"])):
            for row in rows:
                words = row["words"]
                lines.append(
                    f"| {kind}{row['spelling']} | {row['percentage']:.2f}% | "
                    + " | ".join(", ".join(words[p]) for p in ("start", "inside", "end"))
                    + " |"
                )
        lines.append("")
    lines += ["## Letters spelling two sounds (not ranked)", ""]
    for (label, sounds), words in sorted(result.two_sounds.items(), key=lambda item: -len(item[1])):
        lines.append(f"- {label} /{' '.join(sounds)}/: {len(words)} words, e.g. {', '.join(words[:6])}")
    lines += ["", "## Silent letters (not ranked)", ""]
    for letters, words in sorted(result.silent.items(), key=lambda item: -len(item[1])):
        lines.append(f"- {letters}: {len(words)} words, e.g. {', '.join(words[:6])}")
    lines += ["", "## Words not matched", "", ", ".join(failed), ""]
    return "\n".join(lines)


def main():
    inputs = load_inputs()
    alignments, failed = align_words(inputs.words)

    def frequency(word: str) -> float:
        return word_frequency(word, WORDFREQ_LANGUAGE)

    result = tally(alignments, frequency)
    is_example = make_is_example(inputs.words, inputs.recorded, inputs.unlisted)
    sound_ids = [
        row["phonemeId"]
        for row in json.loads((DATA_DIR / "phoneme-frequency.json").read_text(encoding="utf-8"))[
            "phonemes"
        ]
    ]
    curated_meta = inputs.curated["meta"]
    payload = build_payload(
        sound_ids,
        result,
        frequency,
        is_example,
        {
            "source": f"Curated top-10k list {curated_meta['version']}, first pronunciation of each word as the app orders them",
            "wordCount": len(inputs.words),
            "matchedWordCount": len(alignments),
            "wordfreq": {
                "version": importlib.metadata.version("wordfreq"),
                "language": WORDFREQ_LANGUAGE,
            },
            "otherBelowPercentage": OTHER_BELOW_PERCENT,
            "wordsPerPosition": WORDS_PER_POSITION,
            "license": "CC-BY-SA-4.0",
            "attribution": (
                "Derived from wordfreq (Robyn Speer, CC-BY-SA 4.0). "
                "Pronunciations from CMUDict (Public Domain)."
            ),
        },
    )
    OUTPUT_PATH.write_text(json.dumps(payload, indent="\t", ensure_ascii=False) + "\n", encoding="utf-8")
    REVIEW_PATH.parent.mkdir(parents=True, exist_ok=True)
    REVIEW_PATH.write_text(review_sheet(payload, result, failed, len(alignments)), encoding="utf-8")
    print(f"Matched {len(alignments)} of {len(inputs.words)} words")
    print(f"Wrote {OUTPUT_PATH}")
    print(f"Wrote {REVIEW_PATH}")


if __name__ == "__main__":
    main()
