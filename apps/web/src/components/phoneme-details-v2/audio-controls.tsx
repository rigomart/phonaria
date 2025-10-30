import { Loader2, Play, Snail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioManager } from "@/hooks/use-audio-manager";
import { ButtonGroup } from "../ui/button-group";

type Props = {
	src: string;
	label: string;
	className?: string;
};

export function AudioControls({ src, label, className }: Props) {
	const { play, status } = useAudioManager(src);

	return (
		<ButtonGroup className={className}>
			<Button
				size="sm"
				onClick={() => play()}
				aria-label={`Play ${label}`}
				disabled={status === "loading" || status === "playing"}
			>
				{status === "loading" ? (
					<Loader2 className="h-3 w-3 animate-spin" />
				) : (
					<Play className="h-3 w-3" />
				)}
				<span>Play</span>
			</Button>
			<Button
				size="sm"
				variant="outline"
				onClick={() => play(0.75)}
				aria-label={`Play slow ${label}`}
				disabled={status === "loading" || status === "playing"}
			>
				{status === "loading" ? (
					<Loader2 className="h-3 w-3 animate-spin" />
				) : (
					<Snail className="h-3 w-3" />
				)}
			</Button>
		</ButtonGroup>
	);
}
