from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))

from spelling_alignment import Segment, align_words, finish, spelled  # noqa: E402

# Enough words for the learned costs to settle the way they do on the full list.
WORDS = {
    "enough": "IX0 N AH1 F",
    "tough": "T AH1 F",
    "women": "W IX1 M AX0 N",
    "colonel": "K ER1 N AX0 L",
    "island": "AI1 L AX0 N D",
    "listen": "L IX1 S AX0 N",
    "walk": "W O1 K",
    "talk": "T O1 K",
    "know": "N OU1",
    "make": "M EI1 K",
    "take": "T EI1 K",
    "time": "T AI1 M",
    "these": "DH I1 Z",
    "people": "P I1 P AX0 L",
    "little": "L IX1 T AX0 L",
    "one": "W AH1 N",
    "box": "B A1 K S",
    "nation": "N EI1 SH AX0 N",
    "social": "S OU1 SH AX0 L",
    "appreciate": "AX0 P R I1 SH I0 EI2 T",
    "receipt": "R IX0 S I1 T",
    "enjoyed": "E0 N J OI1 D",
    "played": "P L EI1 D",
    "our": "AU1 ER0",
    "all": "O1 L",
    "will": "W IX1 L",
    "and": "AX0 N D",
    "guess": "G E1 S",
    "get": "G E1 T",
    "yes": "Y E1 S",
    "unknown": "AX0 N N OU1 N",
    "zzz": "B AH1 Z",
}


def describe(alignment) -> str:
    return " ".join(
        f"{label}:{'/'.join(segment.base_sounds) or '-'}"
        for segment, label in zip(alignment.segments, alignment.labels)
    )


class AlignmentTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.alignments, cls.failed = align_words(
            {word: tuple(pronunciation.split()) for word, pronunciation in WORDS.items()}
        )

    def check(self, word: str, expected: str):
        self.assertEqual(describe(self.alignments[word]), expected)

    def test_matches_letters_to_sounds(self):
        self.check("enough", "e:IX n:N ou:AH gh:F")
        self.check("women", "w:W o:IX m:M e:AX n:N")
        self.check("will", "w:W i:IX ll:L")

    def test_joins_silent_letters_to_a_neighbour(self):
        self.check("island", "is:AI l:L a:AX n:N d:D")
        self.check("colonel", "c:K olo:ER n:N e:AX l:L")
        self.check("listen", "l:L i:IX st:S e:AX n:N")
        self.check("walk", "w:W al:O k:K")
        self.check("know", "kn:N ow:OU")
        self.check("unknown", "u:AX n:N kn:N ow:OU n:N")
        self.check("guess", "gu:G e:E ss:S")
        self.check("receipt", "r:R e:IX c:S ei:I pt:T")

    def test_keeps_a_silent_e_after_a_consonant_and_names_the_split_vowel(self):
        self.check("make", "m:M a-e:EI k:K e:-")
        self.check("time", "t:T i-e:AI m:M e:-")
        self.check("these", "th:DH e-e:I s:Z e:-")
        self.check("played", "p:P l:L ay:EI e:- d:D")
        self.check("enjoyed", "e:E n:N j:J oy:OI e:- d:D")

    def test_keeps_the_e_ending_the_first_word_of_a_compound(self):
        segments = [
            Segment("m", 0, ("M",)),
            Segment("a", 1, ("EI1",)),
            Segment("k", 2, ("K",)),
            Segment("e", 3, ()),
            Segment("u", 4, ("AH2",)),
            Segment("p", 5, ("P",)),
        ]
        makeup = finish("makeup", segments, frozenset({"make", "up"}))
        self.assertEqual(describe(makeup), "m:M a-e:EI k:K e:- u:AH p:P")
        joined = finish("makeup", segments, frozenset())
        self.assertEqual(describe(joined), "m:M a:EI k:K eu:AH p:P")

    def test_letters_for_two_sounds(self):
        self.check("box", "b:B o:A x:K/S")
        self.check("one", "o:W/AH n:N e:-")
        self.check("people", "p:P eo:I p:P le:AX/L")

    def test_i_goes_with_sh_before_a_schwa_only(self):
        self.check("nation", "n:N a:EI ti:SH o:AX n:N")
        self.check("social", "s:S o:OU ci:SH a:AX l:L")
        self.check("appreciate", "a:AX pp:P r:R e:I c:SH i:I a-e:EI t:T e:-")

    def test_keeps_a_vowel_run_together(self):
        self.check("our", "ou:AU r:ER")

    def test_leaves_out_words_it_cannot_match(self):
        self.assertEqual(self.failed, ["zzz"])

    def test_marks_the_letters_of_a_segment(self):
        enough = self.alignments["enough"]
        self.assertEqual(spelled(enough, 3), "enou[gh]")
        make = self.alignments["make"]
        self.assertEqual(spelled(make, 1), "m[a]k[e]")


if __name__ == "__main__":
    unittest.main()
