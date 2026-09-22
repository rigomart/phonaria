"use client";

import { toastManager } from "@phonaria/ui/components/toast";
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
	const playRequestIdRef = useRef(0);
	/**
	 * The media `error` event and the `play()` rejection can both fire for one
	 * failed source (e.g. a missing bucket file) — remembers which play request
	 * already toasted so a single failure never toasts twice.
	 */
	const toastedRequestIdRef = useRef(0);
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
			// `src` is only ever set by `play()`, so this event always follows an
			// explicit playback request — safe to surface to the user. A stale event
			// from a load that a newer `play()` replaced carries no `error` on the
			// element (assigning `src` clears it), so it must not toast — it would
			// consume the newer request's dedupe slot and swallow its real failure.
			if (!audio.error) return;
			const src = currentSrcRef.current;
			if (src) {
				setStatusMap((prev) => {
					const next = new Map(prev);
					next.set(src, "error");
					return next;
				});
				if (toastedRequestIdRef.current !== playRequestIdRef.current) {
					toastedRequestIdRef.current = playRequestIdRef.current;
					toastManager.add({
						title: "Playback error",
						description: "Could not play the audio. Please try again.",
						type: "error",
					});
				}
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

		const requestId = ++playRequestIdRef.current;

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

		audio.play().catch(() => {
			if (requestId !== playRequestIdRef.current) return;
			setStatusMap((prev) => {
				const next = new Map(prev);
				next.set(src, "error");
				return next;
			});
			if (toastedRequestIdRef.current === requestId) return;
			toastedRequestIdRef.current = requestId;
			toastManager.add({
				title: "Playback error",
				description: "Could not play the audio. Please try again.",
				type: "error",
			});
		});
	};

	const getStatus = (src: string): PlaybackStatus => {
		return statusMap.get(src) ?? "idle";
	};

	return (
		<AudioManagerContext value={{ play, getStatus, currentSrc }}>{children}</AudioManagerContext>
	);
}
