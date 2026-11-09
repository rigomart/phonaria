"""
How often each spelling spells each en-us sound in everyday words.

Each curated top-10k word's first pronunciation, in the order the app shows
them (an /ɔ/ form first, see `preferOForms`), is matched to its letters
(see spelling_alignment.py), and each word counts as often as it is used
(its wordfreq frequency), so the shares reflect speech, not the dictionary.
A spelling's share is its part of everything the sound is spelled with alone;
letters that spell two sounds at once (x in box) and silent letters are
recorded but not ranked.
"""

from __future__ import annotations

import json
import re
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Iterable, Optional

from spelling_alignment import Alignment, base_sound, spelled

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = PROJECT_ROOT / "packages/phonetics-data/data/en"
HELPER_SCRIPTS_DIR = Path(__file__).resolve().parent

# A spelling under this share of its sound is listed under "other spellings",
# and counts as rare when picking words for word pages.
OTHER_BELOW_PERCENT = 2.0
WORDS_PER_POSITION = 3
PERCENT_DECIMALS = 4

PLAIN_WORD = re.compile(r"[a-z]+")
POSITIONS = ("start", "inside", "end")


# British spellings and the American ones they turn into (colour, centre, programme).
BRITISH_TO_AMERICAN = [
    (re.compile(r"(?<=[a-z]{3})our(?=(s|ed|ing|ite|ites|able|ful|hood)?$)"), "or"),
    (re.compile(r"(?<=[a-z]{2}[^aeiou])re(?=s?$)"), "er"),
    (re.compile(r"is(?=(e|es|ed|ing|ation|ations|er|ers)$)"), "iz"),
    (re.compile(r"ys(?=(e|es|ed|ing)$)"), "yz"),
    (re.compile(r"mme(?=s?$)"), "m"),
    (re.compile(r"ence(?=s?$)"), "ense"),
    (re.compile(r"(?<=[a-z]{3}e)ll(?=(ed|ing|er|ers)$)"), "l"),
    (re.compile(r"^grey"), "gray"),
]


def british_spellings(words: Iterable[str]) -> set[str]:
    """Words whose American spelling is also in the list; en-us keeps only the American one."""
    word_set = set(words)
    return {
        word
        for word in word_set
        for pattern, american in BRITISH_TO_AMERICAN
        if pattern.sub(american, word, count=1) != word
        and pattern.sub(american, word, count=1) in word_set
    }


def first_pronunciations(
    curated_words: dict, shown: Optional[dict[str, str]] = None
) -> dict[str, tuple[str, ...]]:
    """Each plain lowercase word's first pronunciation as tokens with stress, `shown[word]`
    when given, leaving out British spellings of words the list also has in American spelling."""
    british = british_spellings(curated_words)
    return {
        word: tuple(((shown or {}).get(word) or variants[0]).split())
        for word, variants in curated_words.items()
        if PLAIN_WORD.fullmatch(word) and variants and word not in british
    }


def position(sound_index: int, sound_count: int) -> str:
    if sound_index == 0:
        return "start"
    return "end" if sound_index == sound_count - 1 else "inside"


@dataclass(frozen=True)
class Occurrence:
    """One place a spelling spells a sound: "[gh]" in enough, at the end."""

    word: str
    spelled: str
    position: str
    stressed: bool
    """False for a vowel with no stress (the a of about), which never counts as rare."""


@dataclass
class SoundSpellings:
    weights: dict[str, float] = field(default_factory=dict)
    occurrences: dict[str, list[Occurrence]] = field(default_factory=dict)

    def percentage(self, spelling: str) -> float:
        total = sum(self.weights.values())
        return self.weights.get(spelling, 0.0) / total * 100 if total > 0 else 0.0

    def ranked(self) -> list[tuple[str, float]]:
        """Each spelling and its share, most common first; ties by spelling."""
        total = sum(self.weights.values())
        if total <= 0:
            return []
        return sorted(
            ((spelling, weight / total * 100) for spelling, weight in self.weights.items()),
            key=lambda item: (-item[1], item[0]),
        )


@dataclass
class SpellingTally:
    sounds: dict[str, SoundSpellings] = field(default_factory=dict)
    two_sounds: dict[tuple[str, tuple[str, ...]], list[str]] = field(default_factory=dict)
    silent: dict[str, list[str]] = field(default_factory=dict)


def tally(alignments: dict[str, Alignment], frequency: Callable[[str], float]) -> SpellingTally:
    """Weigh each spelling of each sound by how often its words are used."""
    result = SpellingTally()
    for word, alignment in alignments.items():
        weight = frequency(word)
        sound_count = sum(len(segment.sounds) for segment in alignment.segments)
        sound_index = 0
        for index, (segment, label) in enumerate(zip(alignment.segments, alignment.labels)):
            if segment.silent:
                result.silent.setdefault(segment.letters, []).append(word)
            elif len(segment.sounds) > 1:
                result.two_sounds.setdefault((label, segment.base_sounds), []).append(word)
            else:
                sound = segment.base_sounds[0]
                entry = result.sounds.setdefault(sound, SoundSpellings())
                if weight > 0:
                    entry.weights[label] = entry.weights.get(label, 0.0) + weight
                entry.occurrences.setdefault(label, []).append(
                    Occurrence(
                        word=word,
                        spelled=spelled(alignment, index),
                        position=position(sound_index, sound_count),
                        stressed=not segment.sounds[0].endswith("0"),
                    )
                )
            sound_index += len(segment.sounds)
    return result


def example_words(
    occurrences: Iterable[Occurrence],
    frequency: Callable[[str], float],
    is_example: Callable[[str], bool],
    limit: int = WORDS_PER_POSITION,
) -> dict[str, list[str]]:
    """The most frequent example words per position, as spelled forms ("enou[gh]")."""
    lists: dict[str, list[str]] = {name: [] for name in POSITIONS}
    seen: dict[str, set[str]] = {name: set() for name in POSITIONS}
    ordered = sorted(occurrences, key=lambda o: (-frequency(o.word), o.word))
    for occurrence in ordered:
        bucket = lists[occurrence.position]
        if len(bucket) >= limit or occurrence.word in seen[occurrence.position]:
            continue
        if not is_example(occurrence.word):
            continue
        bucket.append(occurrence.spelled)
        seen[occurrence.position].add(occurrence.word)
    return lists


def top_word(
    occurrences: Iterable[Occurrence],
    frequency: Callable[[str], float],
    is_example: Callable[[str], bool],
) -> Optional[str]:
    """The most frequent example word wherever the sound falls, as a spelled form, or None."""
    for occurrence in sorted(occurrences, key=lambda o: (-frequency(o.word), o.word)):
        if is_example(occurrence.word):
            return occurrence.spelled
    return None


def is_rare(percentage: float) -> bool:
    return percentage < OTHER_BELOW_PERCENT


def build_sound_entry(
    spellings: SoundSpellings,
    frequency: Callable[[str], float],
    is_example: Callable[[str], bool],
) -> dict:
    ranked, other = [], []
    for spelling, percentage in spellings.ranked():
        words = example_words(spellings.occurrences[spelling], frequency, is_example)
        row = {
            "spelling": spelling,
            "percentage": round(percentage, PERCENT_DECIMALS),
            "topWord": top_word(spellings.occurrences[spelling], frequency, is_example),
            "words": words,
        }
        (other if is_rare(percentage) else ranked).append(row)
    return {"spellings": ranked, "other": other}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def load_word_exclusions() -> dict[str, set[str]]:
    """The words generated lists leave out, from src/utils/unlisted-words.ts:
    "unlisted" for example words, "namesAndNonWords" for word pages."""
    script = (
        'import { NamesAndNonWords, UnlistedWords } from "./src/utils/unlisted-words.ts";'
        "console.log(JSON.stringify({ unlisted: [...UnlistedWords], namesAndNonWords: [...NamesAndNonWords] }));"
    )
    result = subprocess.run(
        ["bun", "--eval", script],
        cwd=HELPER_SCRIPTS_DIR,
        check=True,
        capture_output=True,
        text=True,
    )
    return {key: set(words) for key, words in json.loads(result.stdout).items()}


def base_sounds(tokens: Iterable[str]) -> tuple[str, ...]:
    return tuple(base_sound(token) for token in tokens)


def make_is_example(
    words: dict[str, tuple[str, ...]], recorded: dict[str, str], unlisted: set[str]
) -> Callable[[str], bool]:
    """A word can be an example when its recording was made from the pronunciation it is
    listed with. `recorded` maps each recorded word to that pronunciation."""

    def is_example(word: str) -> bool:
        if len(word) < 2 or word in unlisted or word not in recorded:
            return False
        return base_sounds(recorded[word].split()) == base_sounds(words[word])

    return is_example


def load_pronunciations() -> dict[str, dict]:
    """For each curated top-10k word, the pronunciation the app shows first (`shown`) and
    the one its recording was made from (`recorded`, null without a recording), as
    audio-gen's `pickPronunciation` chose it."""
    script = (
        'import { pickPronunciation } from "./src/curated-words.ts";'
        'import { preferOForms } from "@phonaria/phonetics-data";'
        'import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";'
        'import { EnglishWordAudio } from "@phonaria/phonetics-data/data/en/word-audio";'
        "const recorded = new Set(EnglishWordAudio.words);"
        "const out = {};"
        "for (const [word, variants] of Object.entries(EnglishCuratedTop10k.words)) {"
        "  out[word] = {"
        "    shown: preferOForms(word, variants)[0],"
        "    recorded: recorded.has(word) ? pickPronunciation(word, variants).variant : null,"
        "  };"
        "}"
        "console.log(JSON.stringify(out));"
    )
    result = subprocess.run(
        ["bun", "--eval", script],
        cwd=PROJECT_ROOT / "packages/audio-gen",
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


@dataclass
class Inputs:
    curated: dict
    words: dict[str, tuple[str, ...]]
    recorded: dict[str, str]
    """Each recorded word and the pronunciation its recording was made from."""
    unlisted: set[str]
    names_and_non_words: set[str]


def load_inputs() -> Inputs:
    curated = load_json(DATA_DIR / "curated/top-10k.json")
    exclusions = load_word_exclusions()
    pronunciations = load_pronunciations()
    return Inputs(
        curated=curated,
        words=first_pronunciations(
            curated["words"], {word: p["shown"] for word, p in pronunciations.items()}
        ),
        recorded={word: p["recorded"] for word, p in pronunciations.items() if p["recorded"]},
        unlisted=exclusions["unlisted"],
        names_and_non_words=exclusions["namesAndNonWords"],
    )
