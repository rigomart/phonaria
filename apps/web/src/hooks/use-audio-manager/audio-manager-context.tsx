"use client";

import { createContext, useEffect, useRef, useState } from "react";

type PlaybackStatus = "idle" | "loading" | "playing" | "error";

type AudioManagerContextValue = {
	play: (src: string, speed?: number) => void;
	getStatus: (src: string) => PlaybackStatus;
	currentSrc: string | null;
};

export const AudioManagerContext = createContext<AudioManagerContextValue | null>(null);

export function AudioManagerProvider({ children }: { children: React.ReactNode }) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const currentSrcRef = useRef<string | null>(null);
	const [statusMap, setStatusMap] = useState<Map<string, PlaybackStatus>>(new Map());
	const [currentSrc, setCurrentSrc] = useState<string | null>(null);

	useEffect(() => {
		const audio = new Audio();
		audioRef.current = audio;

		const handleLoadStart = () => {
			const src = currentSrcRef.current;
			if (src) {
				setStatusMap((prev) => {
					const next = new Map(prev);
					next.set(src, "loading");
					return next;
				});
			}
		};

		const handlePlaying = () => {
			const src = currentSrcRef.current;
			if (src) {
				setStatusMap((prev) => {
					const next = new Map(prev);
					next.set(src, "playing");
					return next;
				});
			}
		};

		const handleEnded = () => {
			const src = currentSrcRef.current;
			if (src) {
				audio.currentTime = 0;
				setStatusMap((prev) => {
					const next = new Map(prev);
					next.set(src, "idle");
					return next;
				});
				currentSrcRef.current = null;
				setCurrentSrc(null);
			}
		};

		const handleError = () => {
			const src = currentSrcRef.current;
			if (src) {
				setStatusMap((prev) => {
					const next = new Map(prev);
					next.set(src, "error");
					return next;
				});
			}
		};

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

	const play = (src: string, speed = 1) => {
		const audio = audioRef.current;
		if (!audio) return;

		const previousSrc = currentSrcRef.current;
		if (previousSrc && previousSrc !== src) {
			audio.pause();
			setStatusMap((prev) => {
				const next = new Map(prev);
				next.set(previousSrc, "idle");
				return next;
			});
		}

		currentSrcRef.current = src;
		setCurrentSrc(src);
		setStatusMap((prev) => {
			const next = new Map(prev);
			next.set(src, "loading");
			return next;
		});

		audio.src = src;
		audio.currentTime = 0;
		audio.playbackRate = speed;

		audio.play().catch((e) => {
			setStatusMap((prev) => {
				const next = new Map(prev);
				next.set(src, "error");
				return next;
			});
			console.error("Audio play failed:", e);
		});
	};

	const getStatus = (src: string): PlaybackStatus => {
		return statusMap.get(src) ?? "idle";
	};

	return (
		<AudioManagerContext value={{ play, getStatus, currentSrc }}>{children}</AudioManagerContext>
	);
}
