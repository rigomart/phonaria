/**
 * Hear-the-word button on the reveal (#146, #166): plays the word's recording
 * through the shared audio manager. A word without a recording gets no button.
 */
import { buttonVariants } from "@phonaria/ui/components/button";
import { Volume2 } from "lucide-react";
import { WordAudioButton } from "@/components/word-audio-button";
import { cn } from "@/lib/utils";

export function WordAudio({ word }: { word: string }) {
	return (
		<WordAudioButton
			targetAccent="en-us"
			word={word}
			className={cn(
				buttonVariants({ size: "icon-sm", variant: "ghost" }),
				"data-[status=loading]:animate-pulse motion-reduce:data-[status=loading]:animate-none",
			)}
		>
			<Volume2 aria-hidden="true" />
		</WordAudioButton>
	);
}
