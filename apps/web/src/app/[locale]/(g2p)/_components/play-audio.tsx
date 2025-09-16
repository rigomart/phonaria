import { Play, Snail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { cn } from "@/lib/utils";

type Props = {
	src: string;
	label: string;
	className?: string;
};

export function PlayAudio({ src, label, className }: Props) {
	const { playAudio } = useAudioPlayer();

	return (
		<div className={cn("inline-flex items-center gap-1", className)}>
			<Button
				size="sm"
				className="h-8 gap-1 px-2 text-xs"
				onClick={() => playAudio(src, "normal")}
				aria-label={`Play ${label}`}
			>
				<Play className="h-3 w-3" /> Hear
			</Button>
			<Button
				size="sm"
				variant="outline"
				className="h-8 gap-1 px-2 text-xs"
				onClick={() => playAudio(src, "slow")}
				aria-label={`Play slow ${label}`}
			>
				<Snail className="h-3 w-3" /> Slow
			</Button>
		</div>
	);
}
