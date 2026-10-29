import type { TargetAccent } from "@phonaria/phonetics-data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@phonaria/ui/components/tooltip";
import { Info } from "lucide-react";
import type { ComponentProps } from "react";
import { wordRecordingUrl } from "@/components/word-audio-button";
import { useWordAudioManifest } from "@/hooks/use-word-audio-manifest";
import { cn } from "@/lib/utils";

export const SYNTHETIC_VOICE_NOTE = "Word recordings use a computer-generated US English voice.";

function usePlaysRecording(targetAccent: TargetAccent, words: readonly string[]) {
	const manifest = useWordAudioManifest(targetAccent);
	return Boolean(manifest && words.some((word) => wordRecordingUrl(manifest, targetAccent, word)));
}

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
	if (!usePlaysRecording(targetAccent, words)) return null;
	return (
		<p className={cn("text-xs text-muted-foreground", className)} {...props}>
			{SYNTHETIC_VOICE_NOTE}
		</p>
	);
}

/**
 * The note behind an info mark, for compact surfaces. Shows under the same
 * condition as `SyntheticVoiceNote`.
 */
export function SyntheticVoiceInfo({
	targetAccent,
	words,
}: {
	targetAccent: TargetAccent;
	/** The words the surface can play. */
	words: readonly string[];
}) {
	if (!usePlaysRecording(targetAccent, words)) return null;
	return (
		<Tooltip>
			<TooltipTrigger
				aria-label={SYNTHETIC_VOICE_NOTE}
				className="inline-flex size-6 shrink-0 cursor-help items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
			>
				<Info aria-hidden="true" className="size-3.5" />
			</TooltipTrigger>
			<TooltipContent>{SYNTHETIC_VOICE_NOTE}</TooltipContent>
		</Tooltip>
	);
}
