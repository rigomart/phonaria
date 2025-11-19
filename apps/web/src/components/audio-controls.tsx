"use client";

import { AudioLines, Turtle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioManager } from "@/hooks/use-audio-manager";
import { ButtonGroup } from "./ui/button-group";
import { Spinner } from "./ui/spinner";

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
	const resolvedSrc = src ? src : `${baseUrl}/${path}`;
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
				{status === "loading" ? <Spinner /> : <AudioLines />}
				{variant === "compact" ? null : "Listen"}
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
