"use client";

import { Button } from "@phonaria/ui/components/button";
import { Spinner } from "@phonaria/ui/components/spinner";
import { PlayIcon, Turtle } from "lucide-react";
import { useAudioManager } from "@/hooks/use-audio-manager";
import { getPublicAssetBaseUrl } from "@/lib/site";

type Props = {
	path: string;
	label: string;
};

const baseUrl = getPublicAssetBaseUrl();

function buildAudioSrc(path: string) {
	if (!baseUrl) return null;
	return `${baseUrl}/${path.replace(/^\/+/, "")}`;
}

/** Play the recording at full speed or slowed down. */
export function AudioControls({ path, label }: Props) {
	const audioSrc = buildAudioSrc(path);
	const { play, status } = useAudioManager(audioSrc ?? "");
	const disabled = !audioSrc || status === "loading" || status === "playing";

	return (
		<div className="flex gap-2">
			<Button
				variant="default"
				className="h-11 px-5"
				onClick={() => audioSrc && play()}
				aria-label={`Play ${label}`}
				disabled={disabled}
			>
				{status === "loading" ? <Spinner /> : <PlayIcon data-icon="inline-start" aria-hidden />}
				Play
			</Button>
			<Button
				variant="secondary"
				className="h-11 px-5"
				onClick={() => audioSrc && play(0.75)}
				aria-label={`Play slow ${label}`}
				disabled={disabled}
			>
				{status === "loading" ? <Spinner /> : <Turtle data-icon="inline-start" aria-hidden />}
				Slow
			</Button>
		</div>
	);
}
