"use client";

/**
 * PROTOTYPE ONLY — throwaway. One palette key. Variants lay these out; only the
 * key's own behaviour (insert, or explain, dimmed when it does not match the
 * search) is shared.
 */

import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { PhonemePopoverContent } from "@/components/phoneme-popover-content";
import { cn } from "@/lib/utils";
import { getPaletteKey, matchesQuery, SEARCH_INDEX } from "../_lib/palette";

const searchable = new Map(SEARCH_INDEX.map((key) => [key.id, key]));

interface PaletteKeyProps {
	id: EnglishPhonemeSymbolId;
	query: string;
	explain?: boolean;
	onInsert: (id: EnglishPhonemeSymbolId) => void;
	className?: string;
}

export function PaletteKey({ id, query, explain, onInsert, className }: PaletteKeyProps) {
	const key = getPaletteKey(id);
	const searchableKey = searchable.get(id);
	const dimmed = searchableKey ? !matchesQuery(searchableKey, query) : false;

	const buttonClass = cn(
		"cursor-pointer font-display leading-none transition-opacity",
		dimmed && "opacity-30",
		className,
	);

	if (explain) {
		return (
			<Popover>
				<PopoverTrigger render={<button className={buttonClass} type="button" />}>
					{key.ipa}
				</PopoverTrigger>
				<PopoverContent side="top" sideOffset={8}>
					<PhonemePopoverContent phonemeId={id} />
				</PopoverContent>
			</Popover>
		);
	}

	return (
		<button className={buttonClass} onClick={() => onInsert(id)} title={key.label} type="button">
			{key.ipa}
		</button>
	);
}
