"use client";

import { Button } from "@phonaria/ui/components/button";
import { ButtonGroup } from "@phonaria/ui/components/group";
import { Spinner } from "@phonaria/ui/components/spinner";
import { PlayIcon, Turtle } from "lucide-react";
import { useAudioManager } from "@/hooks/use-audio-manager";

type SourceProps =
	| {
			src: string;
			path?: never;
	  }
	| {
			path: string;
			src?: never;
	  };

type Props = {
	size?: "xs" | "sm" | "default" | "lg";
	variant?: "default" | "compact";
	label: string;
	className?: string;
} & SourceProps;

const baseUrl = process.env.NEXT_PUBLIC_BUCKET_URL;

export function AudioControls(props: Props) {
	const { label, className, size = "default", variant = "default", src, path } = props;
	const resolvedSrc = src ? src : `${baseUrl}${path}`;
	const { play, status } = useAudioManager(resolvedSrc);

	return (
		<ButtonGroup className={className}>
			<Button
				size={size}
				variant="outline"
				onClick={() => play()}
				aria-label={`Play ${label}`}
				disabled={status === "loading" || status === "playing"}
			>
				{status === "loading" ? <Spinner /> : <PlayIcon />}
				{variant === "compact" ? null : <span>Listen</span>}
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
