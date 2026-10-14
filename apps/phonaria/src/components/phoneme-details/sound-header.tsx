import type { ReactNode } from "react";
import { AudioControls } from "@/components/audio-controls";
import { SpelledWord } from "@/components/spelled-word";
import type { SoundSummary } from "./sound";

/**
 * What the sound is and what it sounds like: symbol, type, name, an example
 * word, and audio. Both levels open with it, so the sound keeps its shape when
 * the details expand. `action` is the corner control (close); `titleId` labels
 * the surrounding dialog.
 */
export function SoundHeader({
	sound,
	titleId,
	action,
}: {
	sound: SoundSummary;
	titleId: string;
	action?: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-start gap-4">
				<span
					aria-hidden="true"
					className="flex h-16 min-w-16 shrink-0 items-center justify-center rounded-2xl bg-background px-3 font-display text-4xl leading-none text-foreground"
				>
					{sound.ipa}
				</span>
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<p className="text-xs font-medium text-muted-foreground">{sound.typeLabel}</p>
					<h2
						id={titleId}
						className="font-display text-lg leading-snug font-semibold tracking-tight text-balance"
					>
						<span className="sr-only">/{sound.ipa}/, </span>
						{sound.name}
					</h2>
					{sound.example ? (
						<p className="text-sm text-muted-foreground">
							as in <SpelledWord spelled={sound.example} />
						</p>
					) : null}
				</div>
				{action}
			</div>
			{sound.audioPath ? <AudioControls path={sound.audioPath} label={sound.ipa} /> : null}
		</div>
	);
}
