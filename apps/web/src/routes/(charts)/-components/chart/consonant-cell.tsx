import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import type { ConsonantPhoneme } from "shared-data";
import { phonixUtils } from "shared-data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PhonemeButton } from "./phoneme-button";

const { toPhonemic } = phonixUtils;

interface ConsonantCellProps {
	phonemes: ConsonantPhoneme[];
	onSelect: (p: ConsonantPhoneme) => void;
}

/**
 * Variant-powered styling for consonant phoneme buttons.
 *
 * Variants:
 * - voicing: visual distinction between voiceless (outlined) and voiced (filled subtle bg)
 */
const consonantButtonVariants = cva(
	"group relative inline-flex h-14 w-14 items-center justify-center rounded font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
	{
		variants: {
			voicing: {
				voiceless: "border",
				voiced: "bg-primary/10",
			},
		},
		defaultVariants: {
			voicing: "voiceless",
		},
	},
);

type ConsonantButtonVariants = VariantProps<typeof consonantButtonVariants>;

function consonantButtonClass(props: ConsonantButtonVariants) {
	return consonantButtonVariants(props);
}

export const ConsonantCell: React.FC<ConsonantCellProps> = React.memo(function ConsonantCell({
	phonemes,
	onSelect,
}) {
	if (!phonemes.length) {
		return (
			<div className="flex h-14 items-center justify-center">
				<div className="h-2.5 w-2.5 rounded-full bg-border" aria-hidden="true" />
			</div>
		);
	}
	return (
		<div className="flex h-14 items-center justify-center gap-1">
			{phonemes.map((p) => (
				<Tooltip key={p.symbol}>
					<TooltipTrigger asChild>
						<PhonemeButton
							type="button"
							onClick={() => onSelect(p)}
							aria-label={`${toPhonemic(p.symbol)} ${p.articulation.voicing} ${p.articulation.place} ${p.articulation.manner}. Tap for details.`}
							className={cn(
								consonantButtonClass({
									voicing: p.articulation.voicing as ConsonantButtonVariants["voicing"],
								}),
							)}
						>
							<span className="pointer-events-none select-none text-xl sm:text-2xl leading-none">
								{p.symbol}
							</span>
						</PhonemeButton>
					</TooltipTrigger>
					<TooltipContent side="top" align="center">
						<div className="max-w-[14rem] text-pretty text-xs leading-snug">
							<div className="font-medium">
								{toPhonemic(p.symbol)} {p.description}
							</div>
							<div className="text-[10px] text-muted-foreground">Tap for details</div>
						</div>
					</TooltipContent>
				</Tooltip>
			))}
		</div>
	);
});
