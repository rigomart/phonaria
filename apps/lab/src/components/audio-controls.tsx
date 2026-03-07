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

const baseUrl = process.env.NEXT_PUBLIC_BUCKET_URL;

export function AudioControls({ path, label }: Props) {
	const { play, status } = useAudioManager(`${baseUrl}${path}`);

	return (
		<ButtonGroup>
			<Button
				size="xs"
				variant="outline"
				onClick={() => play()}
				aria-label={`Play ${label}`}
				disabled={status === "loading" || status === "playing"}
			>
				{status === "loading" ? <Spinner /> : <PlayIcon />}
			</Button>
			<Button
				size="xs"
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
