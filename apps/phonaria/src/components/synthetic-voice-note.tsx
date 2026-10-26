"use client";

import type { TargetAccent } from "@phonaria/phonetics-data";
import type { ComponentProps } from "react";
import { wordRecordingUrl } from "@/components/word-audio-button";
import { useWordAudioManifest } from "@/hooks/use-word-audio-manifest";
import { cn } from "@/lib/utils";

export const SYNTHETIC_VOICE_NOTE = "Word recordings use a computer-generated US English voice.";

/**
 * Says the word recordings are synthetic, once per surface that plays them,
 * never on a play button. Shows only when one of `words` has a recording the
 * surface's play buttons would play, so it never appears where none does.
 */
export function SyntheticVoiceNote({
	targetAccent,
	words,
	className,
	...props
}: Omit<ComponentProps<"p">, "children"> & {
	targetAccent: TargetAccent;
	/** The words the surface can play. */
	words: readonly string[];
}) {
	const manifest = useWordAudioManifest(targetAccent);
	if (!manifest || !words.some((word) => wordRecordingUrl(manifest, targetAccent, word))) {
		return null;
	}
	return (
		<p className={cn("text-xs text-muted-foreground", className)} {...props}>
			{SYNTHETIC_VOICE_NOTE}
		</p>
	);
}
