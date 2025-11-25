"""CLI entry point for audio generation."""

import argparse
import logging
import sys
from pathlib import Path

from audio_generation.generator import AudioGenerator


def setup_logging(verbose: bool = False) -> None:
    """Configure logging based on verbosity."""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s - %(levelname)s - %(message)s",
        datefmt="%H:%M:%S",
    )


def main() -> int:
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Generate MP3 audio files for phoneme example words using Chatterbox TTS",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate audio to default location
  audio-gen generate

  # Generate with custom output directory
  audio-gen generate --output-dir ./audio

  # Regenerate all files (ignore existing)
  audio-gen generate --force

  # List words that would be generated
  audio-gen list

  # List words missing audio files
  audio-gen missing
""",
    )

    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Enable verbose logging",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    # Generate command
    gen_parser = subparsers.add_parser(
        "generate",
        help="Generate audio files for all words",
    )
    gen_parser.add_argument(
        "-o", "--output-dir",
        type=Path,
        default=Path(__file__).parent.parent.parent.parent.parent
        / "apps"
        / "web"
        / "public"
        / "audio"
        / "examples",
        help="Output directory for MP3 files (default: apps/web/public/audio/examples)",
    )
    gen_parser.add_argument(
        "-f", "--force",
        action="store_true",
        help="Regenerate files even if they already exist",
    )
    gen_parser.add_argument(
        "--no-progress",
        action="store_true",
        help="Disable progress bar",
    )
    gen_parser.add_argument(
        "--device",
        type=str,
        choices=["cuda", "cpu"],
        default=None,
        help="PyTorch device (default: auto-detect)",
    )
    gen_parser.add_argument(
        "--json-path",
        type=Path,
        default=None,
        help="Custom path to example-words.json",
    )

    # List command
    list_parser = subparsers.add_parser(
        "list",
        help="List all words that would be generated",
    )
    list_parser.add_argument(
        "--json-path",
        type=Path,
        default=None,
        help="Custom path to example-words.json",
    )

    # Missing command
    missing_parser = subparsers.add_parser(
        "missing",
        help="List words that don't have generated audio files",
    )
    missing_parser.add_argument(
        "-o", "--output-dir",
        type=Path,
        default=Path(__file__).parent.parent.parent.parent.parent
        / "apps"
        / "web"
        / "public"
        / "audio"
        / "examples",
        help="Output directory to check (default: apps/web/public/audio/examples)",
    )
    missing_parser.add_argument(
        "--json-path",
        type=Path,
        default=None,
        help="Custom path to example-words.json",
    )

    args = parser.parse_args()
    setup_logging(args.verbose)

    if args.command == "generate":
        generator = AudioGenerator(
            output_dir=args.output_dir,
            json_path=args.json_path,
            device=args.device,
        )

        print(f"Output directory: {args.output_dir}")
        print(f"Force regenerate: {args.force}")
        print()

        summary = generator.generate_all(
            force=args.force,
            progress=not args.no_progress,
        )
        summary.print_summary()

        return 0 if summary.failed == 0 else 1

    elif args.command == "list":
        generator = AudioGenerator(
            output_dir=Path("."),  # Not used for list
            json_path=args.json_path,
        )
        words = generator.list_words()
        print(f"Total words: {len(words)}\n")
        for word in words:
            print(word)
        return 0

    elif args.command == "missing":
        generator = AudioGenerator(
            output_dir=args.output_dir,
            json_path=args.json_path,
        )
        missing = generator.list_missing()
        if missing:
            print(f"Missing audio files: {len(missing)}\n")
            for word in missing:
                print(word)
        else:
            print("All audio files are present!")
        return 0

    return 1


if __name__ == "__main__":
    sys.exit(main())

