"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@phonaria/ui/components/tooltip";
import { usePhonemeDetailsCopy } from "@/data/phoneme-details/client";
import { cn } from "@/lib/utils";
import type { KeyboardPhoneme } from "../../_lib/keyboard-layout";

interface PhonemeKeyProps {
	phoneme: KeyboardPhoneme;
	onSelect: (phoneme: KeyboardPhoneme) => void;
}

export function PhonemeKey({ phoneme, onSelect }: PhonemeKeyProps) {
	const { phonemeDetailsById } = usePhonemeDetailsCopy();
	const label = phonemeDetailsById[phoneme.id]?.label ?? phoneme.id;

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<button
						type="button"
						onClick={() => onSelect(phoneme)}
						aria-label={`${label} (${phoneme.ipa})`}
						className={cn(
							"grid place-items-center text-center",
							"min-w-9 min-h-9 px-1.5 py-1 rounded-md border",
							"bg-background border-border",
							"hover:border-primary hover:bg-primary/5 transition-all duration-150",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							"active:scale-[0.96]",
						)}
					/>
				}
			>
				<span className="text-sm font-medium leading-none">{phoneme.ipa}</span>
			</TooltipTrigger>
			<TooltipContent side="top" align="center">
				<div className="text-xs">
					<span className="font-medium">/{phoneme.ipa}/</span>
					<span className="text-muted-foreground ml-1.5">{label}</span>
				</div>
			</TooltipContent>
		</Tooltip>
	);
}
