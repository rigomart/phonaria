"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AudioDeck, PlaybackSpeed, PlaybackStatus, PlayOptions } from "./types";

type AudioEntry = {
	element: HTMLAudioElement;
	cleanup: () => void;
};

const PLAYBACK_RATE_PRESETS: Record<"slow" | "normal" | "fast", number> = {
	slow: 0.5,
	normal: 1,
	fast: 1.5,
};

export type AudioDeckConfig = {
	defaultExclusive?: boolean;
};

const canUseAudio = typeof window !== "undefined" && typeof Audio !== "undefined";

const normalizeOptions = (options?: PlaybackSpeed | PlayOptions): PlayOptions => {
	if (typeof options === "number" || typeof options === "string") {
		return { speed: options };
	}
	return options ?? {};
};

export function useAudioDeckValue({ defaultExclusive = true }: AudioDeckConfig = {}): AudioDeck {
	const entriesRef = useRef<Map<string, AudioEntry>>(new Map());
	const [statusMap, setStatusMap] = useState<Record<string, PlaybackStatus>>({});
	const [currentSource, setCurrentSource] = useState<string | null>(null);

	const updateStatus = useCallback((src: string, next: PlaybackStatus) => {
		setStatusMap((previous) => {
			if (previous[src] === next) return previous;
			if (next === "idle") {
				const { [src]: _, ...rest } = previous;
				return rest;
			}
			return { ...previous, [src]: next };
		});
	}, []);

	const ensureEntry = useCallback(
		(src: string): AudioEntry | undefined => {
			if (!canUseAudio) return undefined;
			const existing = entriesRef.current.get(src);
			if (existing) return existing;

			const element = new Audio(src);
			element.preload = "auto";

			const handleLoadStart = () => updateStatus(src, "loading");
			const handlePlaying = () => {
				setCurrentSource(src);
				updateStatus(src, "playing");
			};
			const handleEnded = () => {
				updateStatus(src, "idle");
				setCurrentSource((active) => (active === src ? null : active));
			};
			const handleError = () => {
				updateStatus(src, "error");
				setCurrentSource((active) => (active === src ? null : active));
			};

			element.addEventListener("loadstart", handleLoadStart);
			element.addEventListener("playing", handlePlaying);
			element.addEventListener("ended", handleEnded);
			element.addEventListener("error", handleError);

			const entry: AudioEntry = {
				element,
				cleanup: () => {
					element.removeEventListener("loadstart", handleLoadStart);
					element.removeEventListener("playing", handlePlaying);
					element.removeEventListener("ended", handleEnded);
					element.removeEventListener("error", handleError);
				},
			};

			entriesRef.current.set(src, entry);
			return entry;
		},
		[updateStatus],
	);

	const play = useCallback(
		async (src: string, options?: PlaybackSpeed | PlayOptions) => {
			const normalized = normalizeOptions(options);
			const entry = ensureEntry(src);
			if (!entry) return;

			const { element } = entry;
			const speed = normalized.speed ?? "normal";
			const rate =
				typeof speed === "number"
					? speed
					: (PLAYBACK_RATE_PRESETS[speed] ?? PLAYBACK_RATE_PRESETS.normal);
			const exclusive = normalized.exclusive ?? defaultExclusive;
			const shouldReset = normalized.reset ?? true;

			if (exclusive) {
				entriesRef.current.forEach((otherEntry, otherSrc) => {
					if (otherSrc === src) return;
					otherEntry.element.pause();
					otherEntry.element.currentTime = 0;
					updateStatus(otherSrc, "idle");
				});
			}

			setCurrentSource(src);

			if (shouldReset) {
				element.currentTime = normalized.startAt ?? 0;
			} else if (typeof normalized.startAt === "number") {
				element.currentTime = normalized.startAt;
			}

			element.playbackRate = rate;

			try {
				await element.play();
			} catch (error) {
				updateStatus(src, "error");
				setCurrentSource((active) => (active === src ? null : active));
				throw error;
			}
		},
		[defaultExclusive, ensureEntry, updateStatus],
	);

	const stop = useCallback(
		(src: string) => {
			const entry = entriesRef.current.get(src);
			if (!entry) return;

			entry.element.pause();
			entry.element.currentTime = 0;
			updateStatus(src, "idle");
			setCurrentSource((active) => (active === src ? null : active));
		},
		[updateStatus],
	);

	const stopAll = useCallback(() => {
		entriesRef.current.forEach((entry) => {
			entry.element.pause();
			entry.element.currentTime = 0;
		});
		setStatusMap({});
		setCurrentSource(null);
	}, []);

	const preload = useCallback(
		(src: string) => {
			const entry = ensureEntry(src);
			entry?.element.load();
		},
		[ensureEntry],
	);

	const getStatus = useCallback(
		(src: string): PlaybackStatus => statusMap[src] ?? "idle",
		[statusMap],
	);

	const isLoading = useCallback((src: string) => getStatus(src) === "loading", [getStatus]);
	const isPlaying = useCallback((src: string) => getStatus(src) === "playing", [getStatus]);
	const isError = useCallback((src: string) => getStatus(src) === "error", [getStatus]);

	useEffect(() => {
		return () => {
			entriesRef.current.forEach((entry) => {
				entry.cleanup();
				entry.element.pause();
			});
			entriesRef.current.clear();
		};
	}, []);

	return useMemo(
		() => ({
			play,
			stop,
			stopAll,
			preload,
			getStatus,
			isLoading,
			isPlaying,
			isError,
			currentSource: () => currentSource,
			hasActiveSource: () => currentSource != null,
		}),
		[play, stop, stopAll, preload, getStatus, isLoading, isPlaying, isError, currentSource],
	);
}
