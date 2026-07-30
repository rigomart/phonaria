"use client";

/**
 * PROTOTYPE ONLY — throwaway. Stand-in for real word audio from the audio
 * bucket: browser speech synthesis is real enough to judge whether the
 * affordance belongs on the reveal, which is all #130 asks.
 */

import { Button } from "@phonaria/ui/components/button";
import { Volume2 } from "lucide-react";

export function WordAudio({ word, className }: { word: string; className?: string }) {
	return (
		<Button
			aria-label={`Hear ${word}`}
			className={className}
			onClick={() => {
				if (typeof window === "undefined" || !window.speechSynthesis) return;
				window.speechSynthesis.cancel();
				const utterance = new SpeechSynthesisUtterance(word);
				utterance.lang = "en-US";
				utterance.rate = 0.85;
				window.speechSynthesis.speak(utterance);
			}}
			size="icon-sm"
			variant="ghost"
		>
			<Volume2 />
		</Button>
	);
}
