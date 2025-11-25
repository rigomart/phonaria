"""Audio generation package for Phonaria using Piper TTS."""

from audio_generation.generator import AudioGenerator
from audio_generation.models import ExampleWordsData, WordExample

__all__ = ["AudioGenerator", "ExampleWordsData", "WordExample"]
__version__ = "0.1.0"
