"use client";

import { getWordAudioPath, type TargetAccent } from "@phonaria/phonetics-data";
import type { ReactNode } from "react";
import { useAudioManager } from "@/hooks/use-audio-manager";
import { buildPublicAssetUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

type Props = {
	targetAccent: TargetAccent;
	word: string;
	/** Rendered instead of the button when the word has no recording. Nothing by default. */
	fallback?: ReactNode;
	className?: string;
};

/**
 * Plays a word's recording through the shared audio manager, so one clip plays
 * at a time. Unstyled apart from the playback state it exposes as
 * `data-status` (`idle | loading | playing | error`): the caller supplies the
 * look through `className`. Without a recording it renders `fallback`, never
 * speech synthesis.
 */
export function WordAudioButton({ targetAccent, word, fallback = null, className }: Props) {
	const path = getWordAudioPath(targetAccent, word);
	const src = path ? buildPublicAssetUrl(path) : null;
	const { play, status } = useAudioManager(src ?? "");

	if (!src) return fallback;

	return (
		<button
			type="button"
			aria-label={`Hear ${word}`}
			data-status={status}
			onClick={() => play()}
			className={cn("cursor-pointer", className)}
		>
			{word}
		</button>
	);
}
