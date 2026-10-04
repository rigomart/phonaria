import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import types
import unittest

# Loading the data helper does not need the optional frequency-data package.
sys.modules.setdefault("wordfreq", types.SimpleNamespace(top_n_list=lambda *args: []))
spec = importlib.util.spec_from_file_location(
    "curated_chunks", Path(__file__).with_name("generate-curated-chunks.py")
)
curated_chunks = importlib.util.module_from_spec(spec)
spec.loader.exec_module(curated_chunks)


class CuratedPronunciationTests(unittest.TestCase):
    def load(self, variants):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "dictionary.json"
            path.write_text(json.dumps({"data": {"SHIP": variants}}), encoding="utf-8")
            return curated_chunks.load_cmudict(path)

    def test_normalizes_internal_pronunciations(self):
        self.assertEqual(self.load([" SH\tIX1\nP "]), {"SHIP": ["SH IX1 P"]})

    def test_rejects_malformed_source_pronunciations(self):
        for variants in [["SH UNKNOWN IX1 P"], ["SH IH1 P"], ["SH1 IX1 P"], [""], []]:
            with self.subTest(variants=variants):
                with self.assertRaisesRegex(ValueError, "SHIP"):
                    self.load(variants)


if __name__ == "__main__":
    unittest.main()
