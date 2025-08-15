import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
	src: string;
	slowSrc?: string;
	label: string;
	className?: string;
};

export function AudioButton({ src, slowSrc, label, className }: Props) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [activeSrc, setActiveSrc] = useState<string | null>(null);

	// Effect to create and cleanup the audio element
	useEffect(() => {
		const audio = new Audio();
		audioRef.current = audio;

		const handleEnded = () => {
			setIsPlaying(false);
			setActiveSrc(null);
		};

		audio.addEventListener("ended", handleEnded);
		audio.addEventListener("pause", handleEnded); // Also treat pause as ended

		return () => {
			audio.removeEventListener("ended", handleEnded);
			audio.removeEventListener("pause", handleEnded);
			audio.pause();
			audioRef.current = null;
		};
	}, []);

	const playAudio = (sourceUrl: string) => {
		const audio = audioRef.current;
		if (!audio) return;

		if (isPlaying && activeSrc === sourceUrl) {
			audio.pause();
		} else {
			audio.src = sourceUrl;
			audio.currentTime = 0;
			audio.play().catch((e) => console.error("Audio play failed:", e));
			setIsPlaying(true);
			setActiveSrc(sourceUrl);
		}
	};

	const isNormalPlaying = isPlaying && activeSrc === src;
	const isSlowPlaying = isPlaying && activeSrc === slowSrc;

	return (
		<div className={cn("inline-flex items-center gap-1", className)}>
			<Button
				size="icon"
				variant="outline"
				className="h-8 w-8"
				onClick={() => playAudio(src)}
				aria-label={label}
			>
				{isNormalPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
			</Button>
			{slowSrc ? (
				<Button
					size="sm"
					variant="ghost"
					className="h-8"
					onClick={() => playAudio(slowSrc)}
					aria-label={`Slow playback of ${label}`}
					data-state={isSlowPlaying ? "playing" : "idle"}
				>
					Slow
				</Button>
			) : null}
		</div>
	);
}
