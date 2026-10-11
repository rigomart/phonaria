import importlib.util
from pathlib import Path
import sys
import types
import unittest

# Loading the computation does not need the optional frequency-data package.
# Other test modules may stub it too, so add to a shared stub instead of replacing it.
wordfreq_stub = sys.modules.setdefault("wordfreq", types.SimpleNamespace())
if not hasattr(wordfreq_stub, "word_frequency"):
    wordfreq_stub.word_frequency = lambda *args: 0.0
spec = importlib.util.spec_from_file_location(
    "phoneme_frequency", Path(__file__).with_name("generate-phoneme-frequency.py")
)
phoneme_frequency = importlib.util.module_from_spec(spec)
spec.loader.exec_module(phoneme_frequency)


class PhonemeFrequencyTests(unittest.TestCase):
    def test_weights_first_pronunciations_by_word_frequency(self):
        words = {"the": ["DH AX0", "DH I0"], "see": ["S I1"]}
        frequencies = {"the": 0.03, "see": 0.01}
        percentages = phoneme_frequency.compute_speech_percentages(words, frequencies.get)
        self.assertEqual(set(percentages), {"DH", "AX", "S", "I"})
        self.assertAlmostEqual(percentages["DH"], 37.5)
        self.assertAlmostEqual(percentages["S"], 12.5)
        self.assertAlmostEqual(sum(percentages.values()), 100)

    def test_ranks_by_share_and_breaks_ties_by_id(self):
        self.assertEqual(
            phoneme_frequency.rank({"T": 2.0, "N": 2.0, "AX": 5.0}),
            {"AX": 1, "N": 2, "T": 3},
        )

    def test_builds_rows_sorted_by_rank_without_a_timestamp(self):
        payload = phoneme_frequency.build_payload(
            {"words": {"the": ["DH AX0"], "see": ["S I1"]}},
            {"the": 0.03, "see": 0.01}.get,
            "0.0.0",
        )
        self.assertEqual([row["phonemeId"] for row in payload["phonemes"]], ["AX", "DH", "I", "S"])
        self.assertEqual(payload["phonemes"][1], {"phonemeId": "DH", "percentage": 37.5, "rank": 2})
        self.assertEqual(payload["meta"]["wordCount"], 2)
        self.assertNotIn("generatedAt", payload["meta"])


if __name__ == "__main__":
    unittest.main()
