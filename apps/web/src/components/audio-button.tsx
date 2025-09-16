import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, Play, Snail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { cn } from "@/lib/utils";

type ControlsVariant = "default" | "extended";

const controlsVariants = cva("inline-flex items-center", {
	variants: {
		variant: {
			default: "gap-1",
			extended: "gap-2",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

type Props = {
	src: string;
	label: string;
	className?: string;
	variant?: ControlsVariant;
} & VariantProps<typeof controlsVariants>;

export function AudioControls({ src, label, className, variant = "default" }: Props) {
	const { playAudio, isLoading, isPlaying, currentSource } = useAudioPlayer();

	const isActiveSource = currentSource === src;
	const isBusy = isLoading || isPlaying;

	return (
		<div className={cn(controlsVariants({ variant }), className)}>
			<Button
				size="sm"
				className="h-8 gap-1 px-2 text-xs"
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
				{variant === "extended" ? <span>Play</span> : null}
			</Button>
			<Button
				size="sm"
				variant="outline"
				className="h-8 gap-1 px-2 text-xs"
				onClick={() => playAudio(src, "slow")}
				aria-label={`Play slow ${label}`}
				disabled={isBusy && isActiveSource}
			>
				{isLoading && isActiveSource ? (
					<Loader2 className="h-3 w-3 animate-spin" />
				) : (
					<Snail className="h-3 w-3" />
				)}
				{variant === "extended" ? <span>Slow</span> : null}
			</Button>
		</div>
	);
}

// Backwards-compatible named export
export { AudioControls as AudioButton };
