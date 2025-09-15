import { useEffect, useRef } from "react";

type PlaybackSpeed = "slow" | "normal" | "fast" | number;

const playbackRateMap: Record<PlaybackSpeed, number> = {
	slow: 0.5,
	normal: 1.0,
	fast: 1.5,
};

export function useAudioPlayer() {
	const audioRef = useRef<HTMLAudioElement | null>(null);

	// Effect to create and cleanup the audio element
	useEffect(() => {
		const audio = new Audio();
		audioRef.current = audio;

		const handleEnded = () => {
			// Reset audio element
			audio.currentTime = 0;
		};

		audio.addEventListener("ended", handleEnded);

		return () => {
			audio.removeEventListener("ended", handleEnded);
			audio.pause();
			audioRef.current = null;
		};
	}, []);

	const playAudio = (sourceUrl: string, speed: PlaybackSpeed = "normal") => {
		const audio = audioRef.current;
		if (!audio) return;

		// Always play the audio from the beginning
		audio.src = sourceUrl;
		audio.currentTime = 0;

		audio.playbackRate = playbackRateMap[speed];

		audio.play().catch((e) => console.error("Audio play failed:", e));
	};

	return { playAudio };
}
