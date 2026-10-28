import {
	loadWordAudioManifest,
	type TargetAccent,
	type WordAudioManifest,
} from "@phonaria/phonetics-data";
import { useCallback, useSyncExternalStore } from "react";

/** `undefined` while loading; `null` when the accent has no recordings or loading failed. */
export type LoadedWordAudioManifest = WordAudioManifest | null | undefined;

const manifests = new Map<TargetAccent, WordAudioManifest | null>();
const failed = new Set<TargetAccent>();
const pending = new Set<TargetAccent>();
const listeners = new Set<() => void>();

function load(accent: TargetAccent) {
	if (pending.has(accent)) return;
	pending.add(accent);
	const settle = (manifest?: WordAudioManifest | null) => {
		pending.delete(accent);
		if (manifest === undefined) failed.add(accent);
		else {
			failed.delete(accent);
			manifests.set(accent, manifest);
		}
		for (const listener of listeners) listener();
	};
	loadWordAudioManifest(accent).then(settle, () => settle());
}

/**
 * The session's word-audio manifests, loaded the first time a play button subscribes and
 * kept for the rest of the session. A failed load shows no buttons; the next button to
 * mount tries again.
 */
export const wordAudioManifests = {
	get(accent: TargetAccent): LoadedWordAudioManifest {
		if (manifests.has(accent)) return manifests.get(accent);
		return failed.has(accent) ? null : undefined;
	},
	subscribe(accent: TargetAccent, listener: () => void) {
		listeners.add(listener);
		if (!manifests.has(accent)) load(accent);
		return () => {
			listeners.delete(listener);
		};
	},
};

/**
 * The accent's word-audio manifest, loaded on first use. The server and the hydrating
 * client always see `undefined`, so their markup matches.
 */
export function useWordAudioManifest(targetAccent: TargetAccent): LoadedWordAudioManifest {
	const subscribe = useCallback(
		(listener: () => void) => wordAudioManifests.subscribe(targetAccent, listener),
		[targetAccent],
	);
	return useSyncExternalStore(
		subscribe,
		() => wordAudioManifests.get(targetAccent),
		() => undefined,
	);
}
