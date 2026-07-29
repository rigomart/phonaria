"use client";

/**
 * PROTOTYPE ONLY — throwaway. The one atom all three variants share: a phoneme
 * already committed to an answer. `onRemove` makes it a delete button;
 * without it, it opens Lab's shared phoneme popover.
 */

import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { PhonemePopoverContent } from "@/components/phoneme-popover-content";
import { cn } from "@/lib/utils";
import { getPaletteKey } from "../_lib/palette";

const chipClass =
	"inline-flex h-10 min-w-9 items-center justify-center rounded-lg border bg-background px-2 font-display text-xl leading-none";

interface PhonemeChipProps {
	id: EnglishPhonemeSymbolId;
	onRemove?: () => void;
	className?: string;
}

export function PhonemeChip({ id, onRemove, className }: PhonemeChipProps) {
	const key = getPaletteKey(id);

	if (onRemove) {
		return (
			<button
				aria-label={`Remove ${key.ipa}`}
				className={cn(
					chipClass,
					"cursor-pointer transition-colors hover:border-destructive hover:text-destructive",
					className,
				)}
				onClick={onRemove}
				title={`${key.label} — click to remove`}
				type="button"
			>
				{key.ipa}
			</button>
		);
	}

	return (
		<Popover>
			<PopoverTrigger
				render={
					<button
						aria-label={`Details for ${key.ipa}`}
						className={cn(chipClass, "cursor-pointer data-popup-open:border-primary", className)}
						type="button"
					/>
				}
			>
				{key.ipa}
			</PopoverTrigger>
			<PopoverContent sideOffset={8}>
				<PhonemePopoverContent phonemeId={id} />
			</PopoverContent>
		</Popover>
	);
}
