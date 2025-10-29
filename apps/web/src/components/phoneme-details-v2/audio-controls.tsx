import { Loader2, Play, Snail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioDeck } from "@/hooks/audio-deck";
import { ButtonGroup } from "../ui/button-group";

type Props = {
	src: string;
	label: string;
	className?: string;
};

export function AudioControls({ src, label, className }: Props) {
	const { play, getStatus } = useAudioDeck();

	const isLoading = getStatus(src) === "loading";

	return (
		<ButtonGroup className={className}>
			<Button
				size="sm"
				onClick={() => play(src, "normal")}
				aria-label={`Play ${label}`}
				disabled={isLoading}
			>
				{isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
				<span>Play</span>
			</Button>
			<Button
				size="sm"
				variant="outline"
				onClick={() => play(src, "slow")}
				aria-label={`Play slow ${label}`}
				disabled={isLoading}
			>
				{isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Snail className="h-3 w-3" />}
			</Button>
		</ButtonGroup>
	);
}
