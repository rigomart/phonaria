import importlib.util
from pathlib import Path
import sys
import types
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))

# Loading the picker does not need the optional frequency-data package.
wordfreq_stub = sys.modules.setdefault("wordfreq", types.SimpleNamespace())
if not hasattr(wordfreq_stub, "word_frequency"):
    wordfreq_stub.word_frequency = lambda *args: 0.0
spec = importlib.util.spec_from_file_location(
    "pick_word_pages", Path(__file__).with_name("pick-word-pages.py")
)
pick_word_pages = importlib.util.module_from_spec(spec)
sys.modules["pick_word_pages"] = pick_word_pages  # dataclasses look their module up here
spec.loader.exec_module(pick_word_pages)

from spelling_alignment import align_words  # noqa: E402
from spelling_shares import Inputs, first_pronunciations, make_is_example, tally  # noqa: E402

CURATED = {
    "if": ["IX1 F"],
    "off": ["O1 F"],
    "fit": ["F IX1 T"],
    "enough": ["IX0 N AH1 F"],
    "tough": ["T AH1 F"],
    "tougher": ["T AH1 F ER0"],
    "women": ["W IX1 M AX0 N"],
    "in": ["IX1 N"],
    "it": ["IX1 T"],
    "inn": ["IX1 N"],
    "about": ["AX0 B AU1 T"],
    "out": ["AU1 T"],
    "under": ["AH1 N D ER0"],
    "cut": ["K AH1 T"],
    "tom": ["T A1 M"],
    "ago": ["AX0 G OU1"],
    "womb": ["W IX0 M"],
    "hit": ["H IX1 T"],
    "hitched": ["H IX1 CH T"],
}
FREQUENCIES = {
    "if": 0.5, "off": 0.3, "fit": 0.1, "enough": 0.005, "tough": 0.003, "tougher": 0.0005,
    "women": 0.005, "in": 0.6, "it": 0.6, "inn": 0.0001, "about": 0.2, "out": 0.2,
    "under": 0.1, "cut": 0.1, "tom": 0.001, "ago": 0.05, "womb": 0.001, "hit": 0.4, "hitched": 0.001,
}


def frequency(word):
    return FREQUENCIES.get(word, 0.0)


class PickWordPagesTests(unittest.TestCase):
    def setUp(self):
        words = first_pronunciations(CURATED)
        self.inputs = Inputs(
            curated={"words": CURATED},
            words=words,
            recorded={w: v[0] for w, v in CURATED.items() if w != "fit"},
            unlisted=set(),
            names_and_non_words={"tom"},
        )
        self.alignments, _ = align_words(words)
        self.result = tally(self.alignments, frequency)
        self.candidates = pick_word_pages.find_candidates(
            self.inputs, self.alignments, self.result, frequency
        )
        self.words = [c.word for c in self.candidates]

    def test_picks_words_with_a_spelling_rare_for_its_sound(self):
        self.assertIn("enough", self.words)
        self.assertIn("women", self.words)
        self.assertNotIn("if", self.words)
        self.assertNotIn("out", self.words)

    def test_never_counts_the_past_tense_ed_ending_as_rare(self):
        hitched = self.alignments["hitched"]
        self.assertEqual(hitched.labels[-2:], ("e", "d"))
        self.assertLess(self.result.sounds["T"].percentage("d"), 2.0)
        self.assertEqual(
            pick_word_pages.rare_spellings(hitched, self.result), (), "d is rare for /t/ only via -ed"
        )
        self.assertNotIn("hitched", self.words)

    def test_ignores_vowels_without_stress(self):
        self.assertNotIn("about", self.words)
        self.assertNotIn("ago", self.words)

    def test_counts_a_doubled_consonant_with_its_single_letter(self):
        self.assertNotIn("inn", self.words)
        self.assertGreater(pick_word_pages.rarity_share(self.result, "nn", "N"), 2.0)

    def test_needs_a_recording_and_leaves_out_names(self):
        self.assertNotIn("tom", self.words)
        self.assertNotIn("fit", self.words)

    def test_ranks_by_rarity_weighted_by_frequency(self):
        enough = next(c for c in self.candidates if c.word == "enough")
        women = next(c for c in self.candidates if c.word == "women")
        self.assertLess(self.words.index("enough"), self.words.index("tough"))
        self.assertEqual([r.spelling for r in enough.rare], ["gh"])
        self.assertEqual([(r.spelling, r.phoneme_id) for r in women.rare], [("o", "IX")])

    def test_leaves_a_word_with_an_ending_to_its_stem_and_respects_limit(self):
        picked, heads = pick_word_pages.pick(self.candidates, limit=2)
        self.assertEqual(heads.get("tougher"), "tough")
        self.assertNotIn("tougher", [c.word for c in picked])
        self.assertEqual(len(picked), 2)

    def test_gives_each_sound_example_words_whose_vowel_stress_matches(self):
        is_example = make_is_example(self.inputs.words, self.inputs.recorded, set())

        def examples(word, place, label, token):
            return pick_word_pages.segment_examples(
                word, place, label, token, self.result, frequency, is_example
            )

        self.assertEqual(examples("enough", "end", "gh", "F"), ["tou[gh]", "tou[gh]er"])
        self.assertEqual(examples("women", "inside", "o", "IX1"), [], "womb's o is unstressed")
        self.assertEqual(examples("women", "inside", "o", "IX0"), ["w[o]mb"])

    def test_writes_each_word_with_its_letters_and_sounds(self):
        enough = next(c for c in self.candidates if c.word == "enough")
        is_example = make_is_example(self.inputs.words, self.inputs.recorded, set())
        entry = pick_word_pages.word_entry(
            enough,
            self.inputs.words["enough"],
            lambda place, label, token: pick_word_pages.segment_examples(
                "enough", place, label, token, self.result, frequency, is_example
            ),
        )
        self.assertEqual(entry["pronunciation"], "IX0 N AH1 F")
        self.assertEqual(
            [(s["letters"], s["sounds"]) for s in entry["segments"]],
            [("e", ["IX0"]), ("n", ["N"]), ("ou", ["AH1"]), ("gh", ["F"])],
        )
        self.assertEqual(entry["rareSpellings"][0]["spelling"], "gh")
        self.assertEqual(entry["segments"][3]["others"], ["tou[gh]", "tou[gh]er"])


if __name__ == "__main__":
    unittest.main()
