"""Pydantic models for phoneme example words data."""

from typing import Literal

from pydantic import BaseModel, Field


class WordExample(BaseModel):
    """A single word example with its phonemic transcription."""

    word: str = Field(..., min_length=1, description="The word in standard orthography")
    phonemic: str = Field(..., min_length=1, description="IPA phonemic transcription")


class MinimalPair(BaseModel):
    """A pair of word examples forming a minimal pair."""

    first: WordExample
    second: WordExample

    @classmethod
    def from_list(cls, data: list[dict[str, str]]) -> "MinimalPair":
        """Create from JSON list format [[{word, phonemic}, {word, phonemic}]]."""
        return cls(first=WordExample(**data[0]), second=WordExample(**data[1]))


# Phoneme contrast types
ContrastTypeValue = Literal[
    "voicing",
    "place",
    "manner",
    "height",
    "backness",
    "roundness",
    "tenseness",
]


class PhonemeContrast(BaseModel):
    """A contrast between two phonemes with minimal pair examples."""

    phoneme_ids: tuple[str, str] = Field(
        ..., alias="phonemeIds", description="Pair of phoneme IDs being contrasted"
    )
    contrast_type: list[ContrastTypeValue] = Field(
        ..., alias="contrastType", description="Articulatory feature(s) that differ"
    )
    minimal_pairs: list[list[WordExample]] = Field(
        ..., alias="minimalPairs", description="List of minimal pair examples"
    )


class SpellingPattern(BaseModel):
    """Spelling patterns for a phoneme with example words."""

    patterns: list[str] = Field(..., description="Common spelling patterns")
    examples: list[WordExample] = Field(..., description="Example words")


# Allophone context keys
AllophoneContextKey = Literal[
    "stressed-onset-aspirated",
    "after-s-onset-unaspirated",
    "vowel-to-vowel-flap",
    "t-before-syllabic-n-glottal",
    "coda-dark-l",
    "pre-voiced-coda-lengthened",
    "pre-voiceless-coda-shorter",
    "stressed-r-colored",
    "unstressed-r-colored",
]


class AllophoneEntry(BaseModel):
    """An allophone variant with context and examples."""

    ipa_variant: str = Field(..., alias="ipaVariant", description="IPA symbol for this allophone")
    context_key: AllophoneContextKey = Field(
        ..., alias="contextKey", description="Phonological context identifier"
    )
    examples: list[WordExample] = Field(..., description="Example words")


class ExampleWordsData(BaseModel):
    """Root model for the example-words.json file."""

    contrasts: list[PhonemeContrast] = Field(
        ..., description="Minimal pair contrasts between phonemes"
    )
    patterns: dict[str, SpellingPattern] = Field(..., description="Spelling patterns by phoneme ID")
    allophones: dict[str, list[AllophoneEntry]] = Field(
        ..., description="Allophone variants by phoneme ID"
    )

    def extract_unique_words(self) -> set[str]:
        """Extract all unique words from the entire dataset."""
        words: set[str] = set()

        # From contrasts (minimal pairs)
        for contrast in self.contrasts:
            for pair in contrast.minimal_pairs:
                words.add(pair[0].word)
                words.add(pair[1].word)

        # From spelling patterns
        for pattern in self.patterns.values():
            for example in pattern.examples:
                words.add(example.word)

        # From allophones
        for allophone_list in self.allophones.values():
            for allophone in allophone_list:
                for example in allophone.examples:
                    words.add(example.word)

        return words
