"use client";

import { Button } from "@phonaria/ui/components/button";
import { ButtonGroup } from "@phonaria/ui/components/button-group";
import { Spinner } from "@phonaria/ui/components/spinner";
import { PlayIcon, Turtle } from "lucide-react";
import { useAudioManager } from "@/hooks/use-audio-manager";
import { getPublicAssetBaseUrl } from "@/lib/site";

type Props = {
	path: string;
	label: string;
	/** `labeled` adds "Play" and "Slow" beside the icons, for a sound's own page. */
	variant?: "compact" | "labeled";
};

const baseUrl = getPublicAssetBaseUrl();

function buildAudioSrc(path: string) {
	if (!baseUrl) return null;
	return `${baseUrl}/${path.replace(/^\/+/, "")}`;
}

export function AudioControls({ path, label, variant = "compact" }: Props) {
	const audioSrc = buildAudioSrc(path);
	const { play, status } = useAudioManager(audioSrc ?? "");
	const labeled = variant === "labeled";
	const size = labeled ? "lg" : "xs";

	return (
		<ButtonGroup>
			<Button
				size={size}
				variant="outline"
				onClick={() => audioSrc && play()}
				aria-label={`Play ${label}`}
				disabled={!audioSrc || status === "loading" || status === "playing"}
			>
				{status === "loading" ? <Spinner /> : <PlayIcon />}
				{labeled && "Play"}
			</Button>
			<Button
				size={size}
				variant="outline"
				onClick={() => audioSrc && play(0.75)}
				aria-label={`Play slow ${label}`}
				disabled={!audioSrc || status === "loading" || status === "playing"}
			>
				{status === "loading" ? <Spinner /> : <Turtle />}
				{labeled && "Slow"}
			</Button>
		</ButtonGroup>
	);
}
