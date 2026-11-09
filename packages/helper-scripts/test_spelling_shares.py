from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))

from spelling_alignment import align_words  # noqa: E402
from spelling_shares import (  # noqa: E402
    british_spellings,
    build_sound_entry,
    first_pronunciations,
    make_is_example,
    tally,
)

WORDS = {
    "if": ["IX1 F"],
    "off": ["O1 F"],
    "phone": ["F OU1 N"],
    "enough": ["IX0 N AH1 F"],
    "colour": ["K AH1 L ER0"],
    "color": ["K AH1 L ER0"],
    "it's": ["IX1 T S"],
}
FREQUENCIES = {"if": 0.6, "off": 0.25, "phone": 0.1, "enough": 0.05, "color": 0.01}


class SpellingSharesTests(unittest.TestCase):
    def setUp(self):
        self.words = first_pronunciations(WORDS)
        alignments, _ = align_words(self.words)
        self.result = tally(alignments, lambda word: FREQUENCIES.get(word, 0.0))

    def test_keeps_plain_american_spellings(self):
        self.assertNotIn("colour", self.words)
        self.assertNotIn("it's", self.words)
        self.assertEqual(self.words["color"], ("K", "AH1", "L", "ER0"))

    def test_finds_british_spellings_only_when_the_american_one_is_listed(self):
        self.assertEqual(
            british_spellings(["colour", "color", "centre", "center", "four", "for", "pre", "per"]),
            {"colour", "centre"},
        )

    def test_weights_spellings_by_word_frequency(self):
        f = self.result.sounds["F"]
        self.assertAlmostEqual(f.percentage("f"), 60.0)
        self.assertAlmostEqual(f.percentage("ff"), 25.0)
        self.assertAlmostEqual(f.percentage("gh"), 5.0)

    def test_puts_spellings_under_two_percent_under_other(self):
        frequencies = dict(FREQUENCIES, enough=0.01)
        alignments, _ = align_words(self.words)
        result = tally(alignments, lambda word: frequencies.get(word, 0.0))
        entry = build_sound_entry(
            result.sounds["F"], lambda word: frequencies.get(word, 0.0), lambda word: True
        )
        self.assertEqual([row["spelling"] for row in entry["spellings"]], ["f", "ff", "ph"])
        self.assertEqual([row["spelling"] for row in entry["other"]], ["gh"])
        self.assertAlmostEqual(entry["other"][0]["percentage"], 1.0417, places=4)
        self.assertEqual(
            entry["other"][0]["words"], {"start": [], "inside": [], "end": ["enou[gh]"]}
        )
        self.assertEqual(entry["other"][0]["topWord"], "enou[gh]")
        self.assertEqual(entry["spellings"][0]["topWord"], "i[f]")

    def test_example_words_need_a_recording_of_the_listed_pronunciation(self):
        words = {"if": ("IX1", "F"), "use": ("Y", "U1", "S"), "phone": ("F", "OU1", "N"), "and": ("AX0", "N", "D")}
        recorded = {"if": "IX1 F", "use": "Y U1 Z", "phone": "F OU1 N", "and": "AE1 N D"}
        is_example = make_is_example(words, recorded, unlisted={"phone"})
        self.assertTrue(is_example("if"))
        self.assertFalse(is_example("use"))
        self.assertFalse(is_example("and"))
        self.assertFalse(is_example("phone"))
        self.assertFalse(is_example("enough"))

    def test_lists_a_word_with_the_pronunciation_the_app_shows_first(self):
        words = first_pronunciations({"bought": ["B A1 T", "B O1 T"]}, {"bought": "B O1 T"})
        self.assertEqual(words["bought"], ("B", "O1", "T"))

    def test_drops_grey_for_gray(self):
        self.assertEqual(british_spellings(["grey", "gray"]), {"grey"})


if __name__ == "__main__":
    unittest.main()
