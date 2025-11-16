import { useEffect, useRef, useState } from "react";

export type PlaybackSpeed = "slow" | "normal" | "fast" | number;

const playbackRateMap: Record<PlaybackSpeed, number> = {
	slow: 0.5,
	normal: 1.0,
	fast: 1.5,
};

export type PlaybackStatus = "idle" | "loading" | "playing" | "error";

export function useAudioPlayer() {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [status, setStatus] = useState<PlaybackStatus>("idle");
	const [currentSource, setCurrentSource] = useState<string | null>(null);

	useEffect(() => {
		const audio = new Audio();
		audioRef.current = audio;

		const handleLoadStart = () => setStatus("loading");
		const handlePlaying = () => setStatus("playing");
		const handleEnded = () => {
			audio.currentTime = 0;
			setStatus("idle");
		};
		const handleError = () => setStatus("error");

		audio.addEventListener("loadstart", handleLoadStart);
		audio.addEventListener("playing", handlePlaying);
		audio.addEventListener("ended", handleEnded);
		audio.addEventListener("error", handleError);

		return () => {
			audio.removeEventListener("loadstart", handleLoadStart);
			audio.removeEventListener("playing", handlePlaying);
			audio.removeEventListener("ended", handleEnded);
			audio.removeEventListener("error", handleError);
			audio.pause();
			audioRef.current = null;
		};
	}, []);

	const playAudio = (sourceUrl: string, speed: PlaybackSpeed = "normal") => {
		const audio = audioRef.current;
		if (!audio) return;

		setCurrentSource(sourceUrl);
		audio.src = sourceUrl;
		audio.currentTime = 0;

		audio.playbackRate = playbackRateMap[speed];

		audio.play().catch((e) => {
			setStatus("error");
			console.error("Audio play failed:", e);
		});
	};

	return {
		playAudio,
		status,
		isLoading: status === "loading",
		isPlaying: status === "playing",
		currentSource,
	};
}
