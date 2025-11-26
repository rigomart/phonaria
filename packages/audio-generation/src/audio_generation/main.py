"""CLI entrypoint that reads the shared word manifest."""

from __future__ import annotations

import json
from pathlib import Path
from typing import TypedDict


class WordManifestMeta(TypedDict):
    generatedAt: str
    source: str
    total: int
    sourceCounts: dict[str, int]


class WordManifest(TypedDict):
    meta: WordManifestMeta
    words: list[str]


DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "phoneme-words.json"


def load_word_manifest(path: Path = DATA_PATH) -> WordManifest:
    if not path.exists():
        msg = (
            "Word manifest not found. "
            "Run `bun --cwd packages/helper-scripts emit-phoneme-words` first."
        )
        raise FileNotFoundError(f"{msg} (expected at {path})")

    with path.open("r", encoding="utf-8") as file:
        manifest: WordManifest = json.load(file)

    return manifest


def preview_manifest(manifest: WordManifest) -> None:
    total = manifest["meta"]["total"]
    sample = ", ".join(manifest["words"][:10])
    print(f"phoneme-words: {total} total (showing first 10) -> {sample}")


def main() -> int:
    manifest = load_word_manifest()
    preview_manifest(manifest)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
