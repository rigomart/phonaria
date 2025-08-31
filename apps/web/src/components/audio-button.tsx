import { Play, Snail } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
	src: string;
	label: string;
	className?: string;
};

export function AudioButton({ src, label, className }: Props) {
	const audioRef = useRef<HTMLAudioElement | null>(null);

	// Effect to create and cleanup the audio element
	useEffect(() => {
		const audio = new Audio();
		audioRef.current = audio;

		const handleEnded = () => {
			// Reset audio element
			audio.currentTime = 0;
		};

		audio.addEventListener("ended", handleEnded);

		return () => {
			audio.removeEventListener("ended", handleEnded);
			audio.pause();
			audioRef.current = null;
		};
	}, []);

	const playAudio = (sourceUrl: string, speed: "normal" | "slow" = "normal") => {
		const audio = audioRef.current;
		if (!audio) return;

		// Always play the audio from the beginning
		audio.src = sourceUrl;
		audio.currentTime = 0;

		// Set playback rate and preserve pitch for slow playback
		if (speed === "slow") {
			audio.playbackRate = 0.75;
			// Preserve pitch using standard and vendor-prefixed properties
			audio.preservesPitch = true;
		} else {
			audio.playbackRate = 1.0;
			audio.preservesPitch = false;
		}

		audio.play().catch((e) => console.error("Audio play failed:", e));
	};

	return (
		<div className={cn("inline-flex items-center gap-1", className)}>
			<Button
				size="sm"
				className="h-8 gap-1 px-2 text-xs"
				onClick={() => playAudio(src, "normal")}
				aria-label={`Play ${label}`}
			>
				<Play className="h-3 w-3" />
			</Button>
			<Button
				size="sm"
				variant="outline"
				className="h-8 gap-1 px-2 text-xs"
				onClick={() => playAudio(src, "slow")}
				aria-label={`Play slow ${label}`}
			>
				<Snail className="h-3 w-3" />
			</Button>
		</div>
	);
}
