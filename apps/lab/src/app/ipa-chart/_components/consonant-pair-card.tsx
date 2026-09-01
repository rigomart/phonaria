"use client";

import {
	type ConsonantSymbolId,
	formatPhonemeLabel,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@phonaria/ui/components/tooltip";
import { PhonemePopoverContent } from "@/components/phoneme-popover-content";
import { cn } from "@/lib/utils";
import type { MannerOfArticulation, PlaceOfArticulation, Voicing } from "../_lib/consonant-grid";

export interface ConsonantPhoneme {
	id: ConsonantSymbolId;
	symbol: string;
	voicing: Voicing;
	manner: MannerOfArticulation;
	place: PlaceOfArticulation;
}

interface ConsonantPairCardProps {
	targetAccent: TargetAccent;
	voiceless?: ConsonantPhoneme;
	voiced?: ConsonantPhoneme;
}

export function ConsonantPairCard({ targetAccent, voiceless, voiced }: ConsonantPairCardProps) {
	if (!voiceless && !voiced) return null;

	if (!voiceless || !voiced) {
		const phoneme = voiceless ?? voiced;
		if (!phoneme) return null;
		return (
			<div className="flex items-center justify-center">
				<ConsonantButton targetAccent={targetAccent} phoneme={phoneme} />
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center gap-1">
			<ConsonantButton targetAccent={targetAccent} phoneme={voiceless} />
			<ConsonantButton targetAccent={targetAccent} phoneme={voiced} />
		</div>
	);
}

function ConsonantButton({
	targetAccent,
	phoneme,
}: {
	targetAccent: TargetAccent;
	phoneme: ConsonantPhoneme;
}) {
	const isVoiceless = phoneme.voicing === "voiceless";
	const label = formatPhonemeLabel(targetAccent, phoneme.id);
	const ariaLabel = `${label} (${phoneme.symbol})`;

	return (
		<Popover>
			<Tooltip>
				<TooltipTrigger
					render={
						<PopoverTrigger
							render={
								<button
									type="button"
									aria-label={ariaLabel}
									className={cn(
										"group relative grid place-items-center text-center",
										"min-w-10 min-h-10 px-2 py-1.5 rounded-md border",
										"hover:border-primary hover:bg-muted transition-all duration-150",
										"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
										"active:scale-[0.98]",
										isVoiceless
											? "bg-background border-border"
											: "bg-primary/15 border-primary/20 font-semibold",
									)}
								/>
							}
						>
							<div className="text-base sm:text-lg font-medium leading-none tracking-tight">
								{phoneme.symbol}
							</div>
						</PopoverTrigger>
					}
				>
					{phoneme.symbol}
				</TooltipTrigger>
				<TooltipContent side="top" align="center">
					<div className="max-w-56 text-pretty text-xs leading-snug font-medium">
						/{phoneme.symbol}/ - {label}
					</div>
				</TooltipContent>
			</Tooltip>
			<PopoverContent sideOffset={8}>
				<PhonemePopoverContent targetAccent={targetAccent} phonemeId={phoneme.id} />
			</PopoverContent>
		</Popover>
	);
}
