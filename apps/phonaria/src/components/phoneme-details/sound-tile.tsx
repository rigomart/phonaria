"use client";

import { Spinner } from "@phonaria/ui/components/spinner";
import { PlayIcon } from "lucide-react";
import { useAudioManager } from "@/hooks/use-audio-manager";
import { buildPublicAssetUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

const tileClass =
	"relative flex h-16 min-w-16 shrink-0 items-center justify-center rounded-2xl bg-background px-3 font-display text-4xl leading-none text-foreground";

/** The sound's symbol. With a recording the whole tile plays it. */
export function SoundTile({ ipa, audioPath }: { ipa: string; audioPath?: string | null }) {
	const src = audioPath ? buildPublicAssetUrl(audioPath) : null;
	const { play, status } = useAudioManager(src ?? "");

	if (!src) {
		return (
			<span aria-hidden="true" className={tileClass}>
				{ipa}
			</span>
		);
	}

	const busy = status === "loading" || status === "playing";

	return (
		<button
			type="button"
			aria-label={`Play /${ipa}/`}
			title="Play"
			data-status={status}
			onClick={() => {
				if (busy) return;
				play();
			}}
			className={cn(
				tileClass,
				"group/play cursor-pointer outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
				status === "playing" && "bg-secondary",
			)}
		>
			{ipa}
			<span
				aria-hidden="true"
				className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground transition-transform group-hover/play:scale-110 motion-reduce:transition-none"
			>
				{status === "loading" ? (
					<Spinner className="size-3" />
				) : (
					<PlayIcon className="size-3 fill-current" />
				)}
			</span>
		</button>
	);
}
