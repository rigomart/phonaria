"""Piper TTS engine wrapper with MP3 output support."""

import io
import logging
import shutil
import wave
from pathlib import Path
from typing import Literal

from piper import PiperVoice
from pydub import AudioSegment

logger = logging.getLogger(__name__)

AudioFormat = Literal["mp3", "wav"]

DEFAULT_VOICE = "en_US-ryan-high"


def _default_cache_dir() -> Path:
    """Choose a sensible cache dir, preferring the repo-local .piper if present."""
    candidates = [
        Path.cwd() / "packages" / "audio-generation" / ".piper",
        Path.cwd() / ".piper",
        Path(__file__).resolve().parent.parent.parent / ".piper",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return candidates[0]


class TTSEngine:
    """
    Wrapper around Piper TTS for audio generation.

    Handles model initialization, audio synthesis, and MP3 encoding.
    """

    def __init__(
        self,
        voice_name: str = DEFAULT_VOICE,
        voice_path: Path | None = None,
        voice_config_path: Path | None = None,
        cache_dir: Path | None = None,
    ) -> None:
        """
        Initialize the TTS engine.

        Args:
            voice_name: Piper voice name (used for defaults).
            voice_path: Path to the Piper ONNX model. Defaults to cache_dir/voice_name.onnx.
            voice_config_path: Path to the Piper voice JSON config.
                Defaults to cache_dir/voice_name.onnx.json.
            cache_dir: Directory to cache the voice files.
        """
        self.voice_name = voice_name
        self.cache_dir = cache_dir or _default_cache_dir()
        self.voice_path = Path(voice_path) if voice_path else self.cache_dir / f"{voice_name}.onnx"
        self.voice_config_path = (
            Path(voice_config_path) if voice_config_path else self.voice_path.with_suffix(".onnx.json")
        )

        self._voice: PiperVoice | None = None

    @property
    def voice(self) -> PiperVoice:
        """Lazy-load the Piper voice on first access."""
        if self._voice is None:
            self._ensure_voice_files()
            logger.info("Loading Piper voice from '%s'...", self.voice_path)
            self._voice = PiperVoice.load(
                self.voice_path,
                config_path=self.voice_config_path if self.voice_config_path.exists() else None,
                use_cuda=False,
            )
            logger.info("Voice loaded successfully")
        return self._voice

    def _ensure_voice_files(self) -> None:
        """Ensure the voice model and config are present locally; no downloads."""
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        missing: list[str] = []
        if not self.voice_path.exists():
            missing.append(f"model file missing at {self.voice_path}")
        if not self.voice_config_path.exists():
            missing.append(f"config file missing at {self.voice_config_path}")

        if missing:
            missing_text = "; ".join(missing)
            raise RuntimeError(
                f"Piper voice assets not found: {missing_text}. "
                "Place the ONNX and .onnx.json files locally or provide --voice-path/--voice-config-path."
            )

    def synthesize(self, text: str) -> tuple[bytes, int, int, int]:
        """
        Synthesize speech from text and return raw PCM bytes with metadata.

        Args:
            text: Text to synthesize.
        """
        # Use synthesize_wav into a real WAV container so pydub can parse it reliably
        buffer = io.BytesIO()
        with wave.open(buffer, "wb") as wav_file:
            self.voice.synthesize_wav(text, wav_file)

        buffer.seek(0)
        audio_segment = AudioSegment.from_file(buffer, format="wav")
        raw_bytes = audio_segment.raw_data
        if not raw_bytes:
            raise RuntimeError("Piper returned empty audio data")

        sample_width = audio_segment.sample_width
        sample_rate = audio_segment.frame_rate
        channels = audio_segment.channels

        return raw_bytes, sample_rate, sample_width, channels

    def ensure_dependencies_ready(self) -> None:
        """
        Verify external tools (ffmpeg) are available before generation.

        Raises:
            RuntimeError: if ffmpeg/ffprobe cannot be found.
        """
        converter = getattr(AudioSegment, "converter", None) or shutil.which("ffmpeg")
        ffprobe = getattr(AudioSegment, "ffprobe", None) or shutil.which("ffprobe")

        if converter is None:
            raise RuntimeError(
                "ffmpeg not found. Install ffmpeg and ensure it is on PATH before generating audio."
            )

        # pydub reads these globals; set them explicitly so exports succeed
        AudioSegment.converter = converter
        AudioSegment.ffprobe = ffprobe or converter

    def synthesize_to_mp3(
        self,
        text: str,
        output_path: Path,
        bitrate: str = "192k",
    ) -> None:
        """
        Synthesize text and save as MP3 file.

        Args:
            text: Text to synthesize.
            output_path: Path to save the MP3 file.
            bitrate: MP3 bitrate (default: 192k).
        """
        audio_bytes, sample_rate, sample_width, channels = self.synthesize(text)
        audio_segment = AudioSegment(
            data=audio_bytes,
            sample_width=sample_width,
            frame_rate=sample_rate,
            channels=channels,
        )

        output_path.parent.mkdir(parents=True, exist_ok=True)
        audio_segment.export(str(output_path), format="mp3", bitrate=bitrate)

    def synthesize_to_bytes(self, text: str, audio_format: AudioFormat = "mp3") -> bytes:
        """
        Synthesize text and return as bytes.

        Args:
            text: Text to synthesize.
            audio_format: Audio format.

        Returns:
            Audio data as bytes.
        """
        audio_bytes, sample_rate, sample_width, channels = self.synthesize(text)
        audio_segment = AudioSegment(
            data=audio_bytes,
            sample_width=sample_width,
            frame_rate=sample_rate,
            channels=channels,
        )

        buffer = io.BytesIO()
        audio_segment.export(buffer, format=audio_format)
        return buffer.getvalue()
