import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { SpelledWord } from "@/components/spelled-word";
import { SyntheticVoiceNote } from "@/components/synthetic-voice-note";
import { cn } from "@/lib/utils";
import { SoundFrequency } from "./frequency";
import { PlayableWord } from "./playable-word";
import type { SoundSummary } from "./sound";
import { SoundTile } from "./sound-tile";

/**
 * What the sound is and what it sounds like: symbol, name, type with an
 * example word, and how common it is. The symbol plays the sound, the example
 * word plays the word. Both levels
 * open with it, so the sound keeps its shape when the details expand.
 *
 * Where it shows the example word, the synthetic-voice note closes it.
 *
 * On the compact level `onExpand` turns the name into a button that opens the
 * full view, and `thumbnail` previews how the sound is made.
 * `action` is the corner control (close); `titleId` labels the surrounding dialog.
 */
export function SoundHeader({
	sound,
	titleId,
	action,
	showExample = true,
	onExpand,
	thumbnail,
}: {
	sound: SoundSummary;
	titleId: string;
	action?: ReactNode;
	/** Off in the full view: its Spelling section pairs every example word with its spelling. */
	showExample?: boolean;
	onExpand?: () => void;
	thumbnail?: ReactNode;
}) {
	const subtitle = (
		<span className="text-sm text-muted-foreground">
			{sound.typeLabel}
			{showExample && sound.example ? (
				<>
					{" · as in "}
					<PlayableWord targetAccent={sound.targetAccent} word={sound.example.word}>
						<SpelledWord spelled={sound.example.spelled} />
					</PlayableWord>
				</>
			) : null}
		</span>
	);
	const titleClass = "font-display text-lg leading-snug font-semibold tracking-tight text-balance";
	const compact = Boolean(thumbnail);
	const frequency = sound.frequency ? (
		<SoundFrequency
			frequency={sound.frequency}
			showLink={sound.showFrequencyLink}
			stacked={compact}
		/>
	) : null;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-start gap-2">
				<div className="flex min-w-0 flex-1 items-start gap-4">
					<SoundTile ipa={sound.ipa} audioPath={sound.audioPath} />
					<div className="flex min-w-0 flex-1 flex-col gap-1">
						{onExpand ? (
							// A button holds no heading, so the name is a plain label here; the dialog
							// still takes it as its title through `titleId`.
							<button
								type="button"
								onClick={onExpand}
								aria-label={`More about /${sound.ipa}/: ${sound.name}`}
								className="group/expand -mx-2 -my-1 flex cursor-pointer items-center gap-1 self-start rounded-lg px-2 py-1 text-left outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
							>
								<span id={titleId} className={titleClass}>
									{sound.name}
								</span>
								<ChevronRight
									aria-hidden="true"
									className="size-4 shrink-0 text-muted-foreground transition-transform group-hover/expand:translate-x-0.5 motion-reduce:transition-none"
								/>
							</button>
						) : (
							<h2
								id={titleId}
								// Focus lands here when a container opens on the full view.
								tabIndex={-1}
								className={cn(titleClass, "outline-none")}
							>
								<span className="sr-only">/{sound.ipa}/, </span>
								{sound.name}
							</h2>
						)}
						<p>{subtitle}</p>
					</div>
				</div>
				{action}
			</div>
			{thumbnail ? (
				<div className="flex items-stretch gap-4">
					<div className="w-44 shrink-0">{thumbnail}</div>
					<div className="min-w-0 flex-1">{frequency}</div>
				</div>
			) : (
				frequency
			)}
			{showExample && sound.example ? (
				<SyntheticVoiceNote targetAccent={sound.targetAccent} words={[sound.example.word]} />
			) : null}
		</div>
	);
}

/**
 * Where focus goes to name the sound: the compact level's expand button, which
 * holds the title, or the full view's heading.
 */
export function soundTitleTarget(titleId: string): HTMLElement | null {
	const title = document.getElementById(titleId);
	return title?.closest("button") ?? title;
}
