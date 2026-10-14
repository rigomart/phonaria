import type { ReactNode } from "react";
import { AudioControls } from "@/components/audio-controls";
import { SpelledWord } from "@/components/spelled-word";
import { SoundFrequency } from "./frequency";
import type { SoundSummary } from "./sound";

/**
 * What the sound is and what it sounds like: symbol, name, type with an
 * example word, how common it is, and audio. Both levels open with it, so the sound keeps its shape when
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
					<h2
						id={titleId}
						// Focus lands here when the card opens or the drawer is dragged back to compact.
						tabIndex={-1}
						className="font-display text-lg leading-snug font-semibold tracking-tight text-balance outline-none"
					>
						<span className="sr-only">/{sound.ipa}/, </span>
						{sound.name}
					</h2>
					<p className="text-sm text-muted-foreground">
						{sound.typeLabel}
						{sound.example ? (
							<>
								{" · as in "}
								<SpelledWord spelled={sound.example} />
							</>
						) : null}
					</p>
				</div>
				{action}
			</div>
			{sound.frequency ? (
				<SoundFrequency frequency={sound.frequency} showLink={sound.showFrequencyLink} />
			) : null}
			{sound.audioPath ? <AudioControls path={sound.audioPath} label={sound.ipa} /> : null}
		</div>
	);
}
