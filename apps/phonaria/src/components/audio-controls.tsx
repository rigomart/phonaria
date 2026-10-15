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

/** Play and Slow, labeled and thumb-sized: the first thing a learner reaches for. */
export function AudioControls({ path, label }: Props) {
	const audioSrc = buildAudioSrc(path);
	const { play, status } = useAudioManager(audioSrc ?? "");
	const disabled = !audioSrc || status === "loading" || status === "playing";

	return (
		<div className="grid grid-cols-2 gap-2">
			<Button
				className="h-11"
				onClick={() => audioSrc && play()}
				aria-label={`Play ${label}`}
				disabled={disabled}
			>
				{status === "loading" ? <Spinner /> : <PlayIcon data-icon="inline-start" />}
				Play
			</Button>
			<Button
				className="h-11"
				variant="secondary"
				onClick={() => audioSrc && play(0.75)}
				aria-label={`Play slow ${label}`}
				disabled={disabled}
			>
				{status === "loading" ? <Spinner /> : <Turtle data-icon="inline-start" />}
				Slow
			</Button>
		</div>
	);
}
