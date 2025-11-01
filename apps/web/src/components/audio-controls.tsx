import { AudioLines, Turtle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioManager } from "@/hooks/use-audio-manager";
import { ButtonGroup } from "./ui/button-group";
import { Spinner } from "./ui/spinner";

type Props = {
	size?: "xs" | "sm" | "default" | "lg";
	src: string;
	label: string;
	className?: string;
};

export function AudioControls({ src, label, className, size = "default" }: Props) {
	const { play, status } = useAudioManager(src);

	return (
		<ButtonGroup className={className}>
			<Button
				size={size}
				variant="secondary"
				onClick={() => play()}
				aria-label={`Play ${label}`}
				disabled={status === "loading" || status === "playing"}
			>
				{status === "loading" ? <Spinner /> : <AudioLines />}
				Listen
			</Button>
			<Button
				size={size}
				variant="outline"
				onClick={() => play(0.75)}
				aria-label={`Play slow ${label}`}
				disabled={status === "loading" || status === "playing"}
			>
				{status === "loading" ? <Spinner /> : <Turtle />}
			</Button>
		</ButtonGroup>
	);
}
