"use client";

import { getWordAudioPath, type TargetAccent } from "@phonaria/phonetics-data";
import type { ReactNode } from "react";
import { useAudioManager } from "@/hooks/use-audio-manager";
import { buildPublicAssetUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

type Props = {
	targetAccent: TargetAccent;
	word: string;
	/** What the button shows; the word itself by default. */
	children?: ReactNode;
	/** Rendered instead of the button when the word has no recording. Nothing by default. */
	fallback?: ReactNode;
	className?: string;
};

/**
 * Plays one recording, by its public URL, through the shared audio manager,
 * so one clip plays at a time. Unstyled apart from the playback state
 * it exposes as `data-status` (`idle | loading | playing | error`).
 */
export function RecordingButton({
	src,
	name,
	children,
	className,
}: {
	src: string;
	/** The accessible name, e.g. "Hear read, past tense". */
	name: string;
	children: ReactNode;
	className?: string;
}) {
	const { play, status } = useAudioManager(src);
	return (
		<button
			type="button"
			aria-label={name}
			data-status={status}
			onClick={() => play()}
			className={cn("cursor-pointer", className)}
		>
			{children}
		</button>
	);
}

/**
 * Plays a word's main recording. The caller supplies the look through
 * `className`. Without a recording it renders `fallback`, never speech
 * synthesis.
 */
export function WordAudioButton({
	targetAccent,
	word,
	children = word,
	fallback = null,
	className,
}: Props) {
	const path = getWordAudioPath(targetAccent, word);
	const src = path ? buildPublicAssetUrl(path) : null;
	if (!src) return fallback;
	return (
		<RecordingButton src={src} name={`Hear ${word}`} className={className}>
			{children}
		</RecordingButton>
	);
}
