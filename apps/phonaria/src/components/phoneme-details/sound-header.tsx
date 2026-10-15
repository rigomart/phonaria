import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { AudioControls } from "@/components/audio-controls";
import { SpelledWord } from "@/components/spelled-word";
import { cn } from "@/lib/utils";
import { SoundFrequency } from "./frequency";
import type { SoundSummary } from "./sound";

/**
 * What the sound is and what it sounds like: symbol, name, type with an
 * example word, how common it is, and audio. Both levels open with it, so the
 * sound keeps its shape when the details expand.
 *
 * On the compact level `onExpand` turns the symbol and name into one button
 * that opens the full view, and `thumbnail` previews how the sound is made.
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
	const tile = (
		<span
			aria-hidden="true"
			className="flex h-16 min-w-16 shrink-0 items-center justify-center rounded-2xl bg-background px-3 font-display text-4xl leading-none text-foreground"
		>
			{sound.ipa}
		</span>
	);
	const subtitle = (
		<span className="text-sm text-muted-foreground">
			{sound.typeLabel}
			{showExample && sound.example ? (
				<>
					{" · as in "}
					<SpelledWord spelled={sound.example} />
				</>
			) : null}
		</span>
	);
	const titleClass = "font-display text-lg leading-snug font-semibold tracking-tight text-balance";
	const frequency = sound.frequency ? (
		<SoundFrequency frequency={sound.frequency} showLink={sound.showFrequencyLink} />
	) : null;
	const audio = sound.audioPath ? <AudioControls path={sound.audioPath} label={sound.ipa} /> : null;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-start gap-2">
				{onExpand ? (
					// A button holds no heading, so the name is a plain label here; the dialog
					// still takes it as its title through `titleId`.
					<button
						type="button"
						onClick={onExpand}
						aria-label={`More about /${sound.ipa}/: ${sound.name}`}
						className="group/expand -m-2 flex min-w-0 flex-1 cursor-pointer items-center gap-4 rounded-2xl p-2 text-left outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
					>
						{tile}
						<span className="flex min-w-0 flex-1 flex-col gap-1">
							<span id={titleId} className={titleClass}>
								{sound.name}
							</span>
							{subtitle}
						</span>
						<ChevronRight
							aria-hidden="true"
							className="size-4 shrink-0 text-muted-foreground transition-transform group-hover/expand:translate-x-0.5 motion-reduce:transition-none"
						/>
					</button>
				) : (
					<div className="flex min-w-0 flex-1 items-start gap-4">
						{tile}
						<div className="flex min-w-0 flex-1 flex-col gap-1">
							<h2
								id={titleId}
								// Focus lands here when a container opens on the full view.
								tabIndex={-1}
								className={cn(titleClass, "outline-none")}
							>
								<span className="sr-only">/{sound.ipa}/, </span>
								{sound.name}
							</h2>
							<p>{subtitle}</p>
						</div>
					</div>
				)}
				{action}
			</div>
			{thumbnail ? (
				<div className="flex items-stretch gap-4">
					<div className="w-28 shrink-0">{thumbnail}</div>
					<div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
						{frequency}
						{audio}
					</div>
				</div>
			) : (
				<>
					{frequency}
					{audio}
				</>
			)}
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
