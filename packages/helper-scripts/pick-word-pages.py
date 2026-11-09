#!/usr/bin/env python3
"""
Pick the first batch of word-page words: common words whose spelling hides a sound.

Candidates are curated top-10k words (first pronunciation, an /ɔ/ form first as
the app shows it) that have a word recording made from that pronunciation, aren't names or non-words
(src/utils/unlisted-words.ts), and spell at least one sound in a way that is
rare for it: under the 2% share below which the sound pages list a spelling
under "other spellings". A doubled consonant counts with its single letter
(nn with n), and vowels without stress never count, since every vowel letter
spells them.

Candidates are ranked by how rare their rarest spelling is (-log of its share),
weighted by the square root of how often the word is used, so a common word
with a fairly rare spelling (enough) and a less common word with a very rare one
(colonel) both make the cut. A word that is another candidate plus an ending
(-s, -es, -ed, -d, -ing, -ly, -er) with the same rare spellings is left to that
word (friend, not friends). The top LIMIT words are kept, minus the words
dropped at review (REVIEW_DROPS) for being a fragment or profanity the lists
missed. A name found at review goes in ProperNames in src/utils/unlisted-words.ts
instead, so the sound pages' examples leave it out too.

Usage:
    pip install wordfreq
    python3 packages/helper-scripts/pick-word-pages.py

Output:
    packages/phonetics-data/data/en/word-pages.json
    packages/phonetics-data/data/en/word-page-list.json (the words alone)
    packages/helper-scripts/output/word-pages.md (review sheet, git-ignored)
"""

from __future__ import annotations

import importlib.metadata
import json
import math
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Iterable

sys.path.insert(0, str(Path(__file__).resolve().parent))

from spelling_alignment import VOWEL_SOUNDS, Alignment, align_words  # noqa: E402
from spelling_shares import (  # noqa: E402
    DATA_DIR,
    HELPER_SCRIPTS_DIR,
    OTHER_BELOW_PERCENT,
    PERCENT_DECIMALS,
    SpellingTally,
    base_sounds,
    is_rare,
    load_inputs,
    make_is_example,
    position,
    tally,
)

try:
    from wordfreq import word_frequency
except ImportError:
    print("Error: wordfreq not installed. Run: pip install wordfreq")
    sys.exit(1)

WORDFREQ_LANGUAGE = "en"
LIMIT = 150
MIN_LETTERS = 3
OTHER_WORDS = 3
ENDINGS = ("s", "es", "ed", "d", "ing", "ly", "er")
OUTPUT_PATH = DATA_DIR / "word-pages.json"
# The words alone, in a file of their own: a bundle that only links to the pages
# then leaves their data out.
LIST_PATH = DATA_DIR / "word-page-list.json"
REVIEW_PATH = HELPER_SCRIPTS_DIR / "output/word-pages.md"

# Words dropped at review: fragments and profanity the lists missed. A name goes in ProperNames instead.
REVIEW_DROPS: dict[str, str] = {}


@dataclass(frozen=True)
class RareSpelling:
    spelling: str
    phoneme_id: str
    percentage: float


@dataclass(frozen=True)
class Candidate:
    word: str
    rank: int
    frequency: float
    alignment: Alignment
    rare: tuple[RareSpelling, ...]

    @property
    def rarest(self) -> float:
        return min(spelling.percentage for spelling in self.rare)

    @property
    def score(self) -> float:
        return math.sqrt(self.frequency) * -math.log(self.rarest / 100)


def rarity_share(result: SpellingTally, spelling: str, sound: str) -> float:
    """A spelling's share, a doubled consonant counted with its single letter (nn with n)."""
    sound_spellings = result.sounds[sound]
    share = sound_spellings.percentage(spelling)
    if len(spelling) == 2 and spelling[0] == spelling[1] and spelling[0] not in "aeiouy":
        share += sound_spellings.percentage(spelling[0])
    return share


def rare_spellings(alignment: Alignment, result: SpellingTally) -> tuple[RareSpelling, ...]:
    """The word's spellings that are rare for their sound; vowels without stress never are."""
    rare = []
    for segment, label in zip(alignment.segments, alignment.labels):
        if len(segment.sounds) != 1:
            continue
        sound = segment.base_sounds[0]
        if sound in VOWEL_SOUNDS and segment.sounds[0].endswith("0"):
            continue
        share = rarity_share(result, label, sound)
        if is_rare(share):
            rare.append(RareSpelling(label, sound, share))
    return tuple(rare)


def find_candidates(inputs, alignments, result, frequency) -> list[Candidate]:
    rank = {word: index + 1 for index, word in enumerate(inputs.curated["words"])}
    candidates = []
    for word, alignment in alignments.items():
        if len(word) < MIN_LETTERS or word in inputs.names_and_non_words:
            continue
        recorded = inputs.recorded.get(word)
        if recorded is None or base_sounds(recorded.split()) != base_sounds(inputs.words[word]):
            continue
        rare = rare_spellings(alignment, result)
        if rare and frequency(word) > 0:
            candidates.append(Candidate(word, rank[word], frequency(word), alignment, rare))
    return sorted(candidates, key=lambda c: (-c.score, c.word))


def same_rare(a: Candidate, b: Candidate) -> bool:
    key = lambda c: sorted((s.spelling, s.phoneme_id) for s in c.rare)  # noqa: E731
    return key(a) == key(b)


def family_heads(candidates: list[Candidate]) -> dict[str, str]:
    """Each candidate that is another candidate plus an ending, with the same rare spellings,
    mapped to that word: friends → friend."""
    by_word = {c.word: c for c in candidates}
    heads = {}
    for candidate in candidates:
        for ending in ENDINGS:
            stem = candidate.word[: -len(ending)]
            if candidate.word.endswith(ending) and stem in by_word and same_rare(by_word[stem], candidate):
                heads[candidate.word] = stem
                break
    return heads


def pick(candidates: list[Candidate], limit: int = LIMIT) -> tuple[list[Candidate], dict[str, str]]:
    heads = family_heads(candidates)
    picked = [
        c for c in candidates if c.word not in heads and c.word not in REVIEW_DROPS
    ][:limit]
    return picked, heads


def rare_place(alignment: Alignment, rare: RareSpelling) -> str:
    """Where in the word the rare spelling's sound falls: start, inside or end."""
    count = sum(len(segment.sounds) for segment in alignment.segments)
    index = 0
    for segment, label in zip(alignment.segments, alignment.labels):
        if label == rare.spelling and segment.base_sounds == (rare.phoneme_id,):
            return position(index, count)
        index += len(segment.sounds)
    return "inside"


def other_words(
    candidate: Candidate,
    rare: RareSpelling,
    result: SpellingTally,
    frequency: Callable[[str], float],
    is_example: Callable[[str], bool],
) -> list[str]:
    """Up to OTHER_WORDS other words that spell the sound this way, as spelled forms
    ("tou[gh]"): those with it in the same place first, then by frequency. For a vowel only
    stressed matches count, as when picking, so women gets no pers[o]nal."""
    place = rare_place(candidate.alignment, rare)
    vowel = rare.phoneme_id in VOWEL_SOUNDS
    occurrences = sorted(
        (
            occurrence
            for occurrence in result.sounds[rare.phoneme_id].occurrences.get(rare.spelling, [])
            if occurrence.word != candidate.word
            and (occurrence.stressed or not vowel)
            and is_example(occurrence.word)
        ),
        key=lambda o: (o.position != place, -frequency(o.word), o.word),
    )
    others: dict[str, str] = {}
    for occurrence in occurrences:
        if len(others) < OTHER_WORDS:
            others.setdefault(occurrence.word, occurrence.spelled)
    return list(others.values())


def segment_entry(segment, label: str) -> dict:
    entry = {"letters": segment.letters, "sounds": list(segment.sounds)}
    if label != segment.letters:
        entry["spelling"] = label
    return entry


def word_entry(
    candidate: Candidate,
    pronunciation: tuple[str, ...],
    others: Callable[[RareSpelling], list[str]] = lambda rare: [],
) -> dict:
    alignment = candidate.alignment
    return {
        "word": candidate.word,
        "pronunciation": " ".join(pronunciation),
        "segments": [
            segment_entry(segment, label)
            for segment, label in zip(alignment.segments, alignment.labels)
        ],
        "rareSpellings": [
            {
                "spelling": rare.spelling,
                "phonemeId": rare.phoneme_id,
                "percentage": round(rare.percentage, PERCENT_DECIMALS),
                "others": others(rare),
            }
            for rare in candidate.rare
        ],
    }


def describe(candidate: Candidate) -> str:
    return " ".join(
        f"{label} /{' '.join(segment.base_sounds) or '–'}/"
        for segment, label in zip(candidate.alignment.segments, candidate.alignment.labels)
    )


def rare_text(candidate: Candidate) -> str:
    return ", ".join(
        f"{rare.spelling} for {rare.phoneme_id} ({rare.percentage:.2f}%)" for rare in candidate.rare
    )


def review_sheet(
    picked: list[Candidate], candidates: list[Candidate], heads: dict[str, str], words: dict
) -> str:
    picked_words = {c.word for c in picked}
    position = {c.word: index + 1 for index, c in enumerate(candidates)}
    lines = [
        "# Word pages: first batch",
        "",
        f"{len(candidates)} candidates; {len(picked)} kept. A spelling is rare under {OTHER_BELOW_PERCENT:g}% of its sound.",
        "Ranked by -log(rarest share) × √(word frequency). At review, a name goes in ProperNames (src/utils/unlisted-words.ts), a fragment or profanity in REVIEW_DROPS; never add a word.",
        "",
        "## Checks",
        "",
    ]
    for word in ("enough", "women", "colonel", "island", "wednesday", "queue", "will", "and"):
        if word in picked_words:
            status = f"kept, #{position[word]}"
        elif word in position:
            status = f"candidate #{position[word]}, not kept"
        elif word in words:
            status = "not a candidate"
        else:
            status = "not in the list"
        lines.append(f"- {word}: {status}")
    lines += ["", "## Kept", "", "| # | Word | Top-10k rank | Rare spellings | Letters and sounds |", "| ---: | --- | ---: | --- | --- |"]
    for index, candidate in enumerate(picked, 1):
        lines.append(
            f"| {index} | {candidate.word} | {candidate.rank} | {rare_text(candidate)} | {describe(candidate)} |"
        )
    lines += ["", "## Left to a word in the same family", ""]
    lines += [f"- {word} → {head}" for word, head in sorted(heads.items())]
    lines += ["", "## Dropped at review", ""]
    lines += [f"- {word}: {reason}" for word, reason in sorted(REVIEW_DROPS.items())] or ["- none"]
    lines += ["", "## Next 50 candidates", "", "| # | Word | Top-10k rank | Rare spellings | Letters and sounds |", "| ---: | --- | ---: | --- | --- |"]
    rest = [c for c in candidates if c.word not in picked_words and c.word not in heads and c.word not in REVIEW_DROPS]
    for candidate in rest[:50]:
        lines.append(
            f"| {position[candidate.word]} | {candidate.word} | {candidate.rank} | {rare_text(candidate)} | {describe(candidate)} |"
        )
    return "\n".join(lines) + "\n"


def dump(payload: dict) -> str:
    """The meta indented, then each word's page data on a line of its own, so the list
    reviews as a list."""
    meta = json.dumps(payload["meta"], indent="\t", ensure_ascii=False).replace("\n", "\n\t")
    words = ",\n".join(
        "\t\t" + json.dumps(entry, ensure_ascii=False, separators=(", ", ": "))
        for entry in payload["words"]
    )
    return f'{{\n\t"meta": {meta},\n\t"words": [\n{words}\n\t]\n}}\n'


def main():
    inputs = load_inputs()
    alignments, _ = align_words(inputs.words)

    def frequency(word: str) -> float:
        return word_frequency(word, WORDFREQ_LANGUAGE)

    result = tally(alignments, frequency)
    candidates = find_candidates(inputs, alignments, result, frequency)
    picked, heads = pick(candidates)
    is_example = make_is_example(inputs.words, inputs.recorded, inputs.unlisted)
    curated_meta = inputs.curated["meta"]
    payload = {
        "meta": {
            "source": f"Curated top-10k list {curated_meta['version']}, first pronunciation of each word",
            "wordfreq": {
                "version": importlib.metadata.version("wordfreq"),
                "language": WORDFREQ_LANGUAGE,
            },
            "rareBelowPercentage": OTHER_BELOW_PERCENT,
            "limit": LIMIT,
            "license": "CC-BY-SA-4.0",
            "attribution": (
                "Derived from wordfreq (Robyn Speer, CC-BY-SA 4.0). "
                "Pronunciations from CMUDict (Public Domain)."
            ),
        },
        "words": [
            word_entry(
                c,
                inputs.words[c.word],
                lambda rare, c=c: other_words(c, rare, result, frequency, is_example),
            )
            for c in picked
        ],
    }
    OUTPUT_PATH.write_text(dump(payload), encoding="utf-8")
    LIST_PATH.write_text(
        json.dumps([entry["word"] for entry in payload["words"]], ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    REVIEW_PATH.parent.mkdir(parents=True, exist_ok=True)
    REVIEW_PATH.write_text(review_sheet(picked, candidates, heads, inputs.words), encoding="utf-8")
    print(f"{len(candidates)} candidates, kept {len(picked)}")
    print(f"Wrote {OUTPUT_PATH}")
    print(f"Wrote {REVIEW_PATH}")


if __name__ == "__main__":
    main()
