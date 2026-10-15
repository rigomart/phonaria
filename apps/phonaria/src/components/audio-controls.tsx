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
	className?: string;
};

const baseUrl = getPublicAssetBaseUrl();

function buildAudioSrc(path: string) {
	if (!baseUrl) return null;
	return `${baseUrl}/${path.replace(/^\/+/, "")}`;
}

/** Play, labeled, and Slow as an icon beside it: one compact group. Play takes any width the group is given. */
export function AudioControls({ path, label, className }: Props) {
	const audioSrc = buildAudioSrc(path);
	const { play, status } = useAudioManager(audioSrc ?? "");
	const disabled = !audioSrc || status === "loading" || status === "playing";

	return (
		<ButtonGroup className={className}>
			<Button
				className="flex-1"
				size="sm"
				variant="outline"
				onClick={() => audioSrc && play()}
				aria-label={`Play ${label}`}
				disabled={disabled}
			>
				{status === "loading" ? <Spinner /> : <PlayIcon data-icon="inline-start" />}
				Play
			</Button>
			<Button
				size="icon-sm"
				variant="outline"
				onClick={() => audioSrc && play(0.75)}
				aria-label={`Play slow ${label}`}
				title="Play slow"
				disabled={disabled}
			>
				<Turtle />
			</Button>
		</ButtonGroup>
	);
}
