"""
Match a word's letters to the sounds of its pronunciation.

`align_words` splits each word into segments, each a run of letters and the
sounds it spells: "enough" is e /ɪ/, n /n/, ou /ʌ/, gh /f/. A segment can
spell no sound (the final e of "make"), or two ("x" in "box" is /k s/).

The matcher only uses letter groups that can spell a sound: any run of vowel
letters for a vowel, a fixed list per consonant, and any letter as silent at
a cost. Among the matches allowed, it picks the one whose letter groups are
most usual, learned from the words themselves over a few rounds. A word it
can't match is left out rather than forced.

Silent letters are then joined to a neighbour, so that "island" reads is /aɪ/
and "listen" reads st /s/. A silent e after a consonant stays on its own: it
marks the vowel before it ("make" spells /eɪ/ with a-e), not the consonant.
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass
from functools import lru_cache
from typing import Iterable, Optional

VOWEL_LETTERS = frozenset("aeiouy")
STRESS = re.compile(r"[012]$")

VOWEL_SOUNDS = frozenset(
    {"AX", "IX", "I", "U", "UX", "E", "AH", "O", "AE", "A", "ER", "EI", "OU", "AI", "AU", "OI"}
)
LONG_VOWELS = frozenset({"EI", "I", "AI", "OU", "U"})

# Besides runs of vowel letters, these groups spell one vowel sound.
VOWEL_GROUPS = ("aw", "ew", "ow", "awe", "owe", "ewe", "igh", "eigh", "ough", "augh", "uy")
R_VOWEL_GROUPS = (
    "er", "ir", "ur", "or", "ar", "ear", "our", "yr", "err", "irr", "urr", "eur", "re", "r",
)

# Each single letter here also spells its sound doubled (tt, rr).
CONSONANT_GROUPS = {
    "P": ("p",),
    "B": ("b",),
    "T": ("t", "th", "d"),
    "D": ("d", "t"),
    "K": ("k", "c", "ck", "ch", "q", "kh", "cq"),
    "G": ("g", "gh"),
    "F": ("f", "ph", "gh"),
    "V": ("v", "f", "ph"),
    "TH": ("th",),
    "DH": ("th",),
    "S": ("s", "c", "sc", "z"),
    "Z": ("z", "s", "x"),
    "SH": ("sh", "shi", "ti", "ci", "si", "s", "ch", "sci", "c", "ce", "t", "ssi"),
    "ZH": ("s", "si", "g", "z", "t", "ti"),
    "H": ("h", "wh", "j"),
    "CH": ("ch", "tch", "t", "ti", "c", "ci", "cz"),
    "J": ("j", "g", "gi", "dg", "d", "di"),
    "M": ("m",),
    "N": ("n",),
    "NG": ("ng", "n"),
    "L": ("l",),
    "R": ("r",),
    "Y": ("y", "i", "j"),
    "W": ("w", "u", "o", "wh"),
}

# Letter groups that spell two sounds at once. For /j/ before a vowel (use,
# few, queue) any run of vowel letters can too.
TWO_SOUND_GROUPS = {
    ("K", "S"): ("x", "cc", "xc"),
    ("G", "Z"): ("x",),
    ("K", "SH"): ("x",),
    ("G", "ZH"): ("x",),
    ("G", "J"): ("gg",),
    ("NG", "K"): ("ng",),
    ("T", "S"): ("z", "zz"),
    ("W", "AH"): ("o",),
    ("Y", "U"): ("ew",),
    ("Y", "ER"): ("ur",),
    ("AX", "W"): ("u",),
    ("U", "W"): ("u",),
    ("AX", "L"): ("le", "l"),
    ("AX", "M"): ("m",),
}
Y_VOWELS = frozenset({"U", "UX", "AX", "ER"})

# Before i and another vowel these sounds take the i along when a schwa follows
# (nation, social, vision, question, religion, soldier), not when the i spells a
# sound of its own (appreciate, giant).
I_TAKERS = frozenset({"SH", "ZH", "CH", "J"})

# A silent first letter that belongs with the consonant after it, wherever it falls.
SILENT_FIRST_CLUSTERS = frozenset({"kn", "gn", "wr", "pn", "ps"})

SILENT_E_COST = 1.5
FINAL_SILENT_E_COST = 0.6
SILENT_LETTER_COST = 4.0
TWO_SOUND_COST = 0.5
SPLIT_RUN_COST = 0.3
SMOOTHING = 0.5
ROUNDS = 4
INF = float("inf")


def base_sound(token: str) -> str:
    return STRESS.sub("", token)


def _consonant_table() -> dict[str, frozenset[str]]:
    table = {}
    for sound, groups in CONSONANT_GROUPS.items():
        doubled = {group * 2 for group in groups if len(group) == 1}
        table[sound] = frozenset(groups) | doubled
    return table


CONSONANT_TABLE = _consonant_table()


def _vowel_runs(word: str, i: int) -> Iterable[str]:
    """The runs of vowel letters starting at `i`, up to four letters long."""
    end = i
    while end < len(word) and end - i < 4 and word[end] in VOWEL_LETTERS:
        end += 1
        yield word[i:end]


SUFFIX_AFTER_E = re.compile(r"(d|rs?|s)$")


def _takes_suffix_e(word: str, i: int, run: str) -> bool:
    """True for a run like the oye of enjoyed, whose e belongs to the ending."""
    return len(run) > 2 and run.endswith("ye") and bool(SUFFIX_AFTER_E.match(word[i + len(run) :]))


def _starts_after_gu(word: str, i: int, run: str) -> bool:
    """True for a run like the ue of guess, or its u alone, whose u goes with the g before
    it when a vowel follows (gu + e)."""
    vowel_follows = len(run) > 1 or word[i + 1 : i + 2] in VOWEL_LETTERS
    return run[0] == "u" and i > 0 and word[i - 1] in "gq" and vowel_follows


def _starting(word: str, i: int, groups: Iterable[str]) -> Iterable[str]:
    return (group for group in groups if word.startswith(group, i))


def one_sound_groups(word: str, i: int, sound: str) -> set[str]:
    """The letter groups at `i` that can spell `sound` alone."""
    if sound in VOWEL_SOUNDS:
        groups = {
            run
            for run in _vowel_runs(word, i)
            if not _takes_suffix_e(word, i, run) and not _starts_after_gu(word, i, run)
        }
        groups |= set(_starting(word, i, VOWEL_GROUPS))
        if sound == "ER":
            groups |= set(_starting(word, i, R_VOWEL_GROUPS))
        return groups
    return set(_starting(word, i, CONSONANT_TABLE.get(sound, ())))


def two_sound_groups(word: str, i: int, first: str, second: str) -> set[str]:
    """The letter groups at `i` that can spell `first` and `second` together."""
    groups = set(_starting(word, i, TWO_SOUND_GROUPS.get((first, second), ())))
    if first == "Y" and second in Y_VOWELS:
        groups |= set(_vowel_runs(word, i))
    return groups


@dataclass(frozen=True)
class Segment:
    """The word's letters from `start`, spelling `sounds` (pronunciation tokens, stress kept)."""

    letters: str
    start: int
    sounds: tuple[str, ...]

    @property
    def base_sounds(self) -> tuple[str, ...]:
        return tuple(base_sound(sound) for sound in self.sounds)

    @property
    def silent(self) -> bool:
        return not self.sounds

    @property
    def vowel(self) -> bool:
        return any(sound in VOWEL_SOUNDS for sound in self.base_sounds)


@dataclass(frozen=True)
class Alignment:
    word: str
    segments: tuple[Segment, ...]
    labels: tuple[str, ...]
    """Each segment's spelling: its letters, or "a-e" for a vowel spelled with a silent e."""


class Matcher:
    """Aligns words, preferring letter groups that were usual in the last round."""

    def __init__(self):
        self.costs: dict[tuple[str, tuple[str, ...]], float] = {}
        self.unseen: dict[tuple[str, ...], float] = {}
        self.default_unseen = 1.0

    def cost(self, group: str, sounds: tuple[str, ...]) -> float:
        if not self.costs:
            return 1.0
        return self.costs.get((group, sounds), self.unseen.get(sounds, self.default_unseen))

    @staticmethod
    def split_cost(word: str, start: int, end: int) -> float:
        """A small cost for ending a vowel group inside a run of vowel letters (o|ur in our)."""
        inside = 0 < end < len(word) and word[end - 1] in VOWEL_LETTERS and word[end] in VOWEL_LETTERS
        return SPLIT_RUN_COST if inside and word[start] in VOWEL_LETTERS else 0.0

    @staticmethod
    def silent_cost(word: str, i: int) -> float:
        if word[i] == "e":
            return FINAL_SILENT_E_COST if i == len(word) - 1 else SILENT_E_COST
        return SILENT_LETTER_COST

    def align(self, word: str, sounds: tuple[str, ...]) -> Optional[list[Segment]]:
        bases = tuple(base_sound(sound) for sound in sounds)
        n, m = len(word), len(sounds)

        @lru_cache(maxsize=None)
        def best(i: int, j: int) -> tuple[float, tuple[Segment, ...]]:
            if i == n and j == m:
                return 0.0, ()
            options = []

            def take(cost: float, segment: Segment, rest: tuple[float, tuple[Segment, ...]]):
                if rest[0] < INF:
                    options.append((rest[0] + cost, (segment,) + rest[1]))

            if j < m:
                for group in one_sound_groups(word, i, bases[j]):
                    end = i + len(group)
                    if (
                        bases[j] in I_TAKERS
                        and not group.endswith("i")
                        and word[end : end + 1] == "i"
                        and word[end + 1 : end + 2] in VOWEL_LETTERS
                        and (j + 1 == m or bases[j + 1] in ("AX", "ER"))
                    ):
                        continue
                    take(
                        self.cost(group, (bases[j],)) + self.split_cost(word, i, end),
                        Segment(group, i, (sounds[j],)),
                        best(i + len(group), j + 1),
                    )
            if j + 1 < m:
                pair = (bases[j], bases[j + 1])
                for group in two_sound_groups(word, i, *pair):
                    take(
                        self.cost(group, pair) + TWO_SOUND_COST,
                        Segment(group, i, (sounds[j], sounds[j + 1])),
                        best(i + len(group), j + 2),
                    )
            if i < n:
                take(self.silent_cost(word, i), Segment(word[i], i, ()), best(i + 1, j))
            if not options:
                return INF, ()
            # Equal costs fall back to the letters and sounds, so every run picks the same match.
            return min(options, key=lambda o: (o[0], [(s.letters, s.sounds) for s in o[1]]))

        total, segments = best(0, 0)
        return None if total == INF else list(segments)

    def learn(self, alignments: Iterable[list[Segment]]):
        counts: dict[tuple[str, tuple[str, ...]], float] = {}
        totals: dict[tuple[str, ...], float] = {}
        for segments in alignments:
            for segment in segments:
                if segment.silent:
                    continue
                key = (segment.letters, segment.base_sounds)
                counts[key] = counts.get(key, 0.0) + 1
                totals[key[1]] = totals.get(key[1], 0.0) + 1

        def log_share(count: float, total: float) -> float:
            return -math.log((count + SMOOTHING) / (total + SMOOTHING * 20))

        self.costs = {key: log_share(count, totals[key[1]]) for key, count in counts.items()}
        self.unseen = {sounds: log_share(0, total) for sounds, total in totals.items()}
        self.default_unseen = max(self.unseen.values(), default=1.0)


def _silent_runs(segments: list[Segment]) -> list[tuple[int, int]]:
    """Index ranges [start, end) of consecutive silent segments."""
    runs, index = [], 0
    while index < len(segments):
        if segments[index].silent:
            end = index
            while end < len(segments) and segments[end].silent:
                end += 1
            runs.append((index, end))
            index = end
        else:
            index += 1
    return runs


def _silent_side(
    letters: str, before: Optional[Segment], after: Optional[Segment], compound_e: bool = False
) -> str:
    """Which neighbour a run of silent letters joins: "before", "after", or "alone".
    `compound_e` marks a silent e that ends the first word of a compound (make|up)."""
    if before is None:
        return "after" if after is not None else "alone"
    if any(letter in VOWEL_LETTERS for letter in letters):
        if letters == "u" and before.letters[-1] in "gq" and after is not None:
            return "before"  # guess, guitar
        if before.vowel and not (letters == "e" and after is not None):
            return "before"  # toe, queue; not the e of played
        if after is not None and after.vowel and not compound_e:
            return "after"  # receipt, colonel; not makeup
        return "alone"  # make, chocolate
    if (letters[0] in "lhsw" or letters.startswith("gh")) and before.vowel:
        return "before"  # walk, could, island, oh, knowledge, straight
    if after is not None and letters + after.letters[:1] in SILENT_FIRST_CLUSTERS:
        return "after"  # unknown (un|kn), not nk
    if not before.vowel:
        return "before"  # listen, comb, autumn
    if after is not None and not after.vowel:
        return "after"  # doubt, receipt, know
    return "before"


def attach_silent_letters(
    segments: list[Segment], word: str = "", vocabulary: frozenset[str] = frozenset()
) -> list[Segment]:
    """Join each run of silent letters to the segment it belongs with (see `_silent_side`).
    A silent e that splits `word` into two words of `vocabulary` (make|up, where|as) stays
    with the first word."""
    result: list[Segment] = []
    pending = ""
    pending_start = 0
    runs = {start: end for start, end in _silent_runs(segments)}
    index = 0
    while index < len(segments):
        if index in runs:
            end = runs[index]
            letters = "".join(segment.letters for segment in segments[index:end])
            start = segments[index].start
            before = result[-1] if result and not result[-1].silent else None
            after = segments[end] if end < len(segments) else None
            cut = start + len(letters)
            compound_e = letters == "e" and word[:cut] in vocabulary and word[cut:] in vocabulary
            side = _silent_side(letters, before, after, compound_e)
            if side == "before" and before is not None:
                result[-1] = Segment(before.letters + letters, before.start, before.sounds)
            elif side == "after":
                pending, pending_start = letters, start
            else:
                result.append(Segment(letters, start, ()))
            index = end
            continue
        segment = segments[index]
        if pending:
            segment = Segment(pending + segment.letters, pending_start, segment.sounds)
            pending = ""
        result.append(segment)
        index += 1
    return result


def spelling_labels(segments: list[Segment]) -> tuple[str, ...]:
    """Each segment's spelling. A single vowel letter spelling a long vowel, then one
    consonant and a silent e, is spelled with the e: a-e in make, i-e in time."""
    labels = [segment.letters for segment in segments]
    for index in range(len(segments) - 2):
        vowel, consonant, e = segments[index : index + 3]
        if (
            len(vowel.letters) == 1
            and vowel.letters in VOWEL_LETTERS
            and vowel.sounds
            and vowel.base_sounds[-1] in LONG_VOWELS
            and not consonant.silent
            and not consonant.vowel
            and len(consonant.letters) <= 2
            and consonant.letters[0] not in VOWEL_LETTERS
            and consonant.letters != consonant.letters[0] * 2
            and e.silent
            and e.letters == "e"
        ):
            labels[index] = f"{vowel.letters}-e"
    return tuple(labels)


def finish(word: str, segments: list[Segment], vocabulary: frozenset[str] = frozenset()) -> Alignment:
    attached = attach_silent_letters(segments, word, vocabulary)
    return Alignment(word=word, segments=tuple(attached), labels=spelling_labels(attached))


def align_words(
    words: dict[str, tuple[str, ...]], rounds: int = ROUNDS
) -> tuple[dict[str, Alignment], list[str]]:
    """Align each word to its pronunciation tokens; return the alignments and the words that failed."""
    matcher = Matcher()
    raw: dict[str, list[Segment]] = {}
    for _ in range(rounds):
        raw = {}
        for word, sounds in words.items():
            segments = matcher.align(word, sounds)
            if segments is not None:
                raw[word] = segments
        matcher.learn(raw.values())
    failed = [word for word in words if word not in raw]
    vocabulary = frozenset(words)
    return {word: finish(word, segments, vocabulary) for word, segments in raw.items()}, failed


def spelled(alignment: Alignment, index: int) -> str:
    """The word with segment `index`'s letters in brackets, and the e of a split spelling:
    "ha[pp]y", "m[a]k[e]"."""
    word = alignment.word
    segment = alignment.segments[index]
    marks = [(segment.start, segment.start + len(segment.letters))]
    if alignment.labels[index].endswith("-e"):
        e = alignment.segments[index + 2]
        marks.append((e.start, e.start + 1))
    parts, cursor = [], 0
    for start, end in marks:
        parts += [word[cursor:start], f"[{word[start:end]}]"]
        cursor = end
    parts.append(word[cursor:])
    return "".join(parts)
