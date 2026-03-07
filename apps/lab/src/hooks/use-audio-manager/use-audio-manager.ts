"use client";

import { use } from "react";
import { AudioManagerContext } from "./audio-manager-context";

export function useAudioManager(src: string) {
	const context = use(AudioManagerContext);

	if (!context) {
		throw new Error("useAudioManager must be used within AudioManagerProvider");
	}

	const status = context.getStatus(src);
	const isActive = context.currentSrc === src;

	const controls = {
		play: (speed?: number) => context.play(src, speed),
	};

	return {
		...controls,
		status,
		isActive,
	};
}
