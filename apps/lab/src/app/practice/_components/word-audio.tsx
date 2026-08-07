"use client";

/**
 * Hear-the-word button backed by browser speech synthesis (#146). Support is
 * detected after mount so the server and first client render agree — the
 * button simply never appears where the API is missing.
 */
import { Button } from "@phonaria/ui/components/button";
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
				window.speechSynthesis.speak(utterance);
			}}
			size="icon-sm"
			variant="ghost"
		>
			<Volume2 />
		</Button>
	);
}
