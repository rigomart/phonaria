"""Chatterbox TTS engine wrapper with MP3 output support."""

import io
import logging
from pathlib import Path
from typing import TYPE_CHECKING

import torch
from pydub import AudioSegment

if TYPE_CHECKING:
    from chatterbox.tts import ChatterboxTTS

logger = logging.getLogger(__name__)


class TTSEngine:
    """
    Wrapper around Chatterbox TTS for audio generation.

    Handles model initialization, audio synthesis, and MP3 encoding.
    """

    def __init__(self, device: str | None = None) -> None:
        """
        Initialize the TTS engine.

        Args:
            device: PyTorch device ('cuda', 'cpu', or None for auto-detect).
        """
        self._model: "ChatterboxTTS | None" = None
        self._device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"TTS engine will use device: {self._device}")

    @property
    def model(self) -> "ChatterboxTTS":
        """Lazy-load the TTS model on first access."""
        if self._model is None:
            logger.info("Loading Chatterbox TTS model...")
            from chatterbox.tts import ChatterboxTTS

            self._model = ChatterboxTTS.from_pretrained(device=self._device)
            logger.info("Model loaded successfully")
        return self._model

    def synthesize(self, text: str) -> torch.Tensor:
        """
        Synthesize speech from text.

        Args:
            text: Text to synthesize.

        Returns:
            Audio tensor from Chatterbox.
        """
        return self.model.generate(text)

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
        # Generate audio tensor
        audio_tensor = self.synthesize(text)

        # Convert to numpy and normalize to int16
        audio_np = audio_tensor.squeeze().cpu().numpy()

        # Normalize to int16 range
        audio_int16 = (audio_np * 32767).astype("int16")

        # Create AudioSegment from raw audio data
        # Chatterbox outputs at 24kHz sample rate
        audio_segment = AudioSegment(
            data=audio_int16.tobytes(),
            sample_width=2,  # 16-bit = 2 bytes
            frame_rate=24000,  # Chatterbox sample rate
            channels=1,
        )

        # Export as MP3
        output_path.parent.mkdir(parents=True, exist_ok=True)
        audio_segment.export(str(output_path), format="mp3", bitrate=bitrate)

    def synthesize_to_bytes(self, text: str, format: str = "mp3") -> bytes:
        """
        Synthesize text and return as bytes.

        Args:
            text: Text to synthesize.
            format: Audio format ('mp3', 'wav').

        Returns:
            Audio data as bytes.
        """
        audio_tensor = self.synthesize(text)
        audio_np = audio_tensor.squeeze().cpu().numpy()
        audio_int16 = (audio_np * 32767).astype("int16")

        audio_segment = AudioSegment(
            data=audio_int16.tobytes(),
            sample_width=2,
            frame_rate=24000,
            channels=1,
        )

        buffer = io.BytesIO()
        audio_segment.export(buffer, format=format)
        return buffer.getvalue()

