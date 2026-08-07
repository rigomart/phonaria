"use client";

/**
 * One placed sound, as a split control (#140): the symbol opens the shared
 * phoneme popover, the `×` removes it. Read-only without `onRemove`.
 */
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { X } from "lucide-react";
import { PhonemePopoverContent } from "@/components/phoneme-popover-content";
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
			<Popover>
				<PopoverTrigger
					render={
						<button
							aria-label={name}
							className={cn(
								"relative flex h-full cursor-pointer items-center px-2.5 font-display text-xl leading-none outline-none pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-background-strong",
								onRemove ? "rounded-l-lg" : "rounded-lg",
							)}
							type="button"
						/>
					}
				>
					{key.ipa}
				</PopoverTrigger>
				<PopoverContent sideOffset={8}>
					<PhonemePopoverContent phonemeId={key.id} />
				</PopoverContent>
			</Popover>

			{onRemove ? (
				<button
					aria-label={`Remove ${name}`}
					className="relative flex h-full cursor-pointer items-center rounded-r-lg border-border border-l px-2 text-muted-foreground outline-none pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 hover:bg-destructive hover:text-destructive-foreground focus-visible:ring-2 focus-visible:ring-ring"
					onClick={onRemove}
					type="button"
				>
					<X className="size-3.5" />
				</button>
			) : null}
		</span>
	);
}
