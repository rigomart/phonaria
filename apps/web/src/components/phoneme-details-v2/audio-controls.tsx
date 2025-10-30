import { Loader2, Play, Snail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { ButtonGroup } from "../ui/button-group";

type Props = {
	src: string;
	label: string;
	className?: string;
};

export function AudioControls({ src, label, className }: Props) {
	const { playAudio, isLoading, isPlaying, currentSource } = useAudioPlayer();

	const isActiveSource = currentSource === src;
	const isBusy = isLoading || isPlaying;

	return (
		<ButtonGroup className={className}>
			<Button
				size="sm"
				onClick={() => playAudio(src, "normal")}
				aria-label={`Play ${label}`}
				disabled={isBusy && isActiveSource}
			>
				{isLoading && isActiveSource ? (
					<Loader2 className="h-3 w-3 animate-spin" />
				) : isPlaying && isActiveSource ? (
					<Play className="h-3 w-3" />
				) : (
					<Play className="h-3 w-3" />
				)}
				<span>Play</span>
			</Button>
			<Button
				size="sm"
				variant="outline"
				onClick={() => playAudio(src, "slow")}
				aria-label={`Play slow ${label}`}
				disabled={isBusy && isActiveSource}
			>
				{isLoading && isActiveSource ? (
					<Loader2 className="h-3 w-3 animate-spin" />
				) : (
					<Snail className="h-3 w-3" />
				)}
			</Button>
		</ButtonGroup>
	);
}
