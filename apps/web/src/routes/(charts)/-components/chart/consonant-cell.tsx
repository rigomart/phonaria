import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import type { ConsonantPhoneme } from "shared-data";
import { phonixUtils } from "shared-data";
import { BasePhonemeCellRenderer } from "@/routes/(charts)/-components/core/base-phoneme-cell";

const { toPhonemic } = phonixUtils;

interface ConsonantCellProps {
	phonemes: ConsonantPhoneme[];
	onSelect: (p: ConsonantPhoneme) => void;
}

/**
 * Variant-powered styling for consonant phoneme buttons.
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

function getConsonantButtonClassName(phoneme: ConsonantPhoneme): string {
	return consonantButtonVariants({
		voicing: phoneme.articulation.voicing as ConsonantButtonVariants["voicing"],
	});
}

function getConsonantAriaLabel(phoneme: ConsonantPhoneme): string {
	return `${toPhonemic(phoneme.symbol)} ${phoneme.articulation.voicing} ${phoneme.articulation.place} ${phoneme.articulation.manner}. Tap for details.`;
}

export const ConsonantCell: React.FC<ConsonantCellProps> = React.memo(function ConsonantCell({
	phonemes,
	onSelect,
}) {
	return (
		<BasePhonemeCellRenderer
			phonemes={phonemes}
			onSelect={onSelect}
			getButtonClassName={getConsonantButtonClassName}
			getAriaLabel={getConsonantAriaLabel}
		/>
	);
});
