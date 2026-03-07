"use client";

import { Button } from "@phonaria/ui/components/button";
import { ButtonGroup } from "@phonaria/ui/components/group";
import { Spinner } from "@phonaria/ui/components/spinner";
import { PlayIcon, Turtle } from "lucide-react";
import { useAudioManager } from "@/hooks/use-audio-manager";

type Props = {
	path: string;
	label: string;
};

const baseUrl = process.env.NEXT_PUBLIC_BUCKET_URL?.replace(/\/+$/, "");

function buildAudioSrc(path: string) {
	if (!baseUrl) return null;
	return `${baseUrl}/${path.replace(/^\/+/, "")}`;
}

export function AudioControls({ path, label }: Props) {
	const audioSrc = buildAudioSrc(path);
	const { play, status } = useAudioManager(audioSrc ?? "");

	return (
		<ButtonGroup>
			<Button
				size="xs"
				variant="outline"
				onClick={() => audioSrc && play()}
				aria-label={`Play ${label}`}
				disabled={!audioSrc || status === "loading" || status === "playing"}
			>
				{status === "loading" ? <Spinner /> : <PlayIcon />}
			</Button>
			<Button
				size="xs"
				variant="outline"
				onClick={() => audioSrc && play(0.75)}
				aria-label={`Play slow ${label}`}
				disabled={!audioSrc || status === "loading" || status === "playing"}
			>
				{status === "loading" ? <Spinner /> : <Turtle />}
			</Button>
		</ButtonGroup>
	);
}
