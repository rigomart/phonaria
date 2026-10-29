/**
 * One placed sound, as a split control (#140): the symbol opens the shared
 * phoneme details, the `×` removes it. Read-only without `onRemove`.
 */
import { X } from "lucide-react";
import { PhonemeDetailsTrigger } from "@/components/phoneme-details/phoneme-details";
import { cn } from "@/lib/utils";
import { describeSound, findSound } from "../_lib/sound-palette";

interface SoundChipProps {
	/** Phoneme ID; sequences are plain strings by the time they reach here. */
	sound: string;
	onRemove?: () => void;
	className?: string;
}

export function SoundChip({ sound, onRemove, className }: SoundChipProps) {
	const key = findSound(sound);

	if (!key) {
		return (
			<span
				className={cn(
					"inline-flex h-10 items-center rounded-lg border bg-background-soft px-2.5 font-display text-xl",
					className,
				)}
			>
				{sound}
			</span>
		);
	}

	const name = describeSound(key);

	return (
		// No `overflow-hidden`: it would clip the inner buttons' focus rings and
		// the coarse-pointer hit-area overlays, so each half rounds its own edge.
		<span
			className={cn(
				"inline-flex h-10 items-center rounded-lg border bg-background-soft",
				className,
			)}
		>
			<PhonemeDetailsTrigger
				details={{
					targetAccent: "en-us",
					phonemeId: key.id,
					showComparisons: false,
					showSpellings: false,
					showFrequencyLink: false,
					showChartLink: false,
				}}
				render={
					<button
						aria-label={name}
						className={cn(
							// Centered coarse-pointer overlay: 44px tall, but no width
							// minimum — the chip's two halves sit flush, so a widened
							// overlay on either would cover the other and hijack its taps.
							"relative flex h-full cursor-pointer items-center px-2.5 font-display text-xl leading-none outline-none pointer-coarse:after:-translate-x-1/2 pointer-coarse:after:-translate-y-1/2 pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:left-1/2 pointer-coarse:after:size-full pointer-coarse:after:min-h-11 focus-visible:ring-2 focus-visible:ring-ring data-details-open:bg-background-strong",
							onRemove ? "rounded-l-lg" : "rounded-lg",
						)}
						type="button"
					/>
				}
			>
				{key.ipa}
			</PhonemeDetailsTrigger>

			{onRemove ? (
				<button
					aria-label={`Remove ${name}`}
					// Centered coarse-pointer overlay: 44px tall, no width minimum —
					// see the trigger half above.
					className="relative flex h-full cursor-pointer items-center rounded-r-lg border-border border-l px-2 text-muted-foreground outline-none pointer-coarse:after:-translate-x-1/2 pointer-coarse:after:-translate-y-1/2 pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:left-1/2 pointer-coarse:after:size-full pointer-coarse:after:min-h-11 hover:bg-destructive hover:text-destructive-foreground focus-visible:ring-2 focus-visible:ring-ring"
					onClick={onRemove}
					type="button"
				>
					<X className="size-3.5" />
				</button>
			) : null}
		</span>
	);
}
