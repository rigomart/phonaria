"use client";

import { createContext, useContext } from "react";
import type { AudioDeck } from "./types";
import type { AudioDeckConfig } from "./use-audio-deck-value";
import { useAudioDeckValue } from "./use-audio-deck-value";

const AudioDeckContext = createContext<AudioDeck | null>(null);

type AudioDeckProviderProps = {
	children: React.ReactNode;
	config?: AudioDeckConfig;
};

export function AudioDeckProvider({ children, config }: AudioDeckProviderProps) {
	const deck = useAudioDeckValue(config);

	return <AudioDeckContext.Provider value={deck}>{children}</AudioDeckContext.Provider>;
}

export function useAudioDeckContext() {
	const context = useContext(AudioDeckContext);
	if (!context) {
		throw new Error("useAudioDeckContext must be used within an AudioDeckProvider");
	}
	return context;
}

export function useAudioDeck() {
	return useAudioDeckContext();
}
