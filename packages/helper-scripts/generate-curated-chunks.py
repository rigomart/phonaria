#!/usr/bin/env python3
"""
Generate curated word chunks for client-side tiered lookup.

This script generates top-1k and top-10k word lists with CMU ARPABET pronunciations
from wordfreq frequency data and CMUDict.

The client-side code handles IPA conversion, syllabification, and phoneme key
generation at runtime using existing TypeScript utilities.

Usage:
    pip install wordfreq
    python generate-curated-chunks.py

Output:
    packages/phonetics-data/data/curated/top-1k.json
    packages/phonetics-data/data/curated/top-10k.json

License:
    The generated word lists are derived from:
    - wordfreq (Apache 2.0 code, CC-BY-SA 4.0 data) by Robyn Speer
    - CMUDict (Public Domain)

    Generated files are licensed under CC-BY-SA 4.0.
"""

import json
from datetime import datetime, timezone
from pathlib import Path

try:
    from wordfreq import top_n_list
except ImportError:
    print("Error: wordfreq not installed. Run: pip install wordfreq")
    exit(1)


def load_cmudict(cmudict_path: Path) -> dict:
    """Load CMUDict JSON file."""
    with open(cmudict_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["data"]


def generate_curated_chunk(
    words: list[str],
    cmudict: dict,
    tier: str,
    version: str,
) -> dict:
    """Generate a curated word chunk with CMU ARPABET pronunciations.

    The output maps each word to an array of CMU ARPABET variants.
    IPA conversion, syllabification, and phoneme key generation are
    handled at runtime by the client using existing TypeScript utilities.
    """
    entries = {}

    for word in words:
        # CMUDict keys are uppercase
        cmu_key = word.upper()
        if cmu_key not in cmudict:
            continue

        # Use first pronunciation variant
        variants = cmudict[cmu_key]
        if not variants:
            continue

        # Store all CMU ARPABET variants
        entries[word] = variants

    return {
        "meta": {
            "version": version,
            "tier": tier,
            "wordCount": len(entries),
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "license": "CC-BY-SA-4.0",
            "attribution": (
                "Derived from wordfreq (Robyn Speer, CC-BY-SA 4.0) incorporating data from "
                "Google Books Ngrams, OpenSubtitles, SUBTLEX (Brysbaert et al.), and Wikipedia. "
                "Pronunciations from CMUDict (Public Domain)."
            ),
            "sources": {
                "wordfreq": "https://github.com/rspeer/wordfreq",
                "cmudict": "https://github.com/cmusphinx/cmudict",
            },
        },
        "words": entries,
    }


def main():
    # Paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    cmudict_path = project_root / "packages/phonetics-data/data/dict/cmudict.json"
    output_dir = project_root / "packages/phonetics-data/data/curated"

    # Version for cache invalidation (2.0.0: switched from single string to array of variants)
    version = "2.0.0"

    print("Loading CMUDict...")
    cmudict = load_cmudict(cmudict_path)
    print(f"  Loaded {len(cmudict)} words from CMUDict")

    print("\nFetching word frequencies from wordfreq...")
    # Get more than needed to account for filtering
    raw_words = top_n_list("en", 15000)
    print(f"  Retrieved {len(raw_words)} words from wordfreq")

    # Filter to CMUDict-valid words
    print("\nFiltering to CMUDict-valid words...")
    valid_words = [w for w in raw_words if w.upper() in cmudict]
    print(f"  {len(valid_words)} words have CMUDict entries")

    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)

    # Generate Tier 1 (top 1k)
    print("\nGenerating top-1k.json (Tier 1)...")
    tier1_words = valid_words[:1000]
    tier1_chunk = generate_curated_chunk(tier1_words, cmudict, "1k", version)

    tier1_path = output_dir / "top-1k.json"
    with open(tier1_path, "w", encoding="utf-8") as f:
        json.dump(tier1_chunk, f, separators=(",", ":"))

    tier1_size = tier1_path.stat().st_size
    print(f"  Written {tier1_chunk['meta']['wordCount']} words ({tier1_size:,} bytes)")

    # Generate Tier 2 (top 10k)
    print("\nGenerating top-10k.json (Tier 2)...")
    tier2_words = valid_words[:10000]
    tier2_chunk = generate_curated_chunk(tier2_words, cmudict, "10k", version)

    tier2_path = output_dir / "top-10k.json"
    with open(tier2_path, "w", encoding="utf-8") as f:
        json.dump(tier2_chunk, f, separators=(",", ":"))

    tier2_size = tier2_path.stat().st_size
    print(f"  Written {tier2_chunk['meta']['wordCount']} words ({tier2_size:,} bytes)")

    # Summary
    print("\n" + "=" * 50)
    print("Generation complete!")
    print("=" * 50)
    print("\nTier 1 (top-1k.json):")
    print(f"  Words: {tier1_chunk['meta']['wordCount']}")
    print(f"  Size: {tier1_size:,} bytes ({tier1_size / 1024:.1f} KB)")
    print(f"  Sample: {list(tier1_chunk['words'].keys())[:5]}")

    print("\nTier 2 (top-10k.json):")
    print(f"  Words: {tier2_chunk['meta']['wordCount']}")
    print(f"  Size: {tier2_size:,} bytes ({tier2_size / 1024:.1f} KB)")
    print(f"  Word 1000: {tier2_words[999]}")
    print(f"  Word 5000: {tier2_words[4999]}")
    print(f"  Word 10000: {tier2_words[9999]}")

    print(f"\nOutput directory: {output_dir}")
    print("\nLicense: CC-BY-SA-4.0")
    print("Remember to include attribution in your credits page.")


if __name__ == "__main__":
    main()
