"use client";

/**
 * Hear-the-word button backed by browser speech synthesis (#146). Support is
 * detected after mount so the server and first client render agree — the
 * button simply never appears where the API is missing.
 */
import { Button } from "@phonaria/ui/components/button";
import { toastManager } from "@phonaria/ui/components/toast";
import { Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

export function WordAudio({ word }: { word: string }) {
	const [supported, setSupported] = useState(false);

	useEffect(() => {
		setSupported("speechSynthesis" in window);
	}, []);

	if (!supported) return null;

	return (
		<Button
			aria-label={`Hear ${word}`}
			onClick={() => {
				window.speechSynthesis.cancel();
				const utterance = new SpeechSynthesisUtterance(word);
				utterance.lang = "en-US";
				utterance.rate = 0.85;
				utterance.onerror = (event) => {
					// `cancel()` fires the previous utterance's error as "canceled" or
					// "interrupted" — expected on rapid replays, not a failure to surface.
					if (event.error === "canceled" || event.error === "interrupted") return;
					toastManager.add({
						title: "Playback error",
						description: "Your browser couldn't speak this word. Please try again.",
						type: "error",
					});
				};
				window.speechSynthesis.speak(utterance);
			}}
			size="icon-sm"
			variant="ghost"
		>
			<Volume2 />
		</Button>
	);
}
