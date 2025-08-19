import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import type { VowelPhoneme } from "shared-data";
import { phonixUtils } from "shared-data";
import { BasePhonemeCellRenderer } from "@/routes/(charts)/-components/core/base-phoneme-cell";

const { toPhonemic } = phonixUtils;

interface VowelCellProps {
	vowels: VowelPhoneme[];
	onSelect: (v: VowelPhoneme) => void;
}

/**
 * Variant-powered styling for vowel phoneme buttons.
 */
const vowelButtonVariants = cva(
	"group relative inline-flex h-14 w-14 items-center justify-center rounded font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border",
	{
		variants: {
			shape: {
				plain: "",
				rounded: "rounded-full",
				rhotic:
					"before:pointer-events-none before:content-[''] before:absolute before:bottom-1 before:left-1/2 before:-translate-x-1/2 before:h-0.5 before:w-6 before:rounded-full before:bg-primary/60",
			},
		},
		defaultVariants: {
			shape: "plain",
		},
	},
);

type VowelButtonVariants = VariantProps<typeof vowelButtonVariants>;

function getVowelButtonClassName(phoneme: VowelPhoneme): string {
	const rounded = phoneme.articulation.roundness === "rounded";
	const rhotic = phoneme.articulation.rhoticity === "rhotic" || phoneme.type === "rhotic";

	const shape = rhotic ? "rhotic" : rounded ? "rounded" : "plain";

	return vowelButtonVariants({
		shape: shape as VowelButtonVariants["shape"],
	});
}

function getVowelAriaLabel(phoneme: VowelPhoneme): string {
	const rhotic = phoneme.articulation.rhoticity === "rhotic" || phoneme.type === "rhotic";
	let label = `${toPhonemic(phoneme.symbol)} ${phoneme.articulation.height} ${phoneme.articulation.frontness} ${phoneme.articulation.tenseness} ${phoneme.articulation.roundness}`;
	if (rhotic) label += " rhotic";
	label += ". Tap for details.";
	return label;
}

export const VowelCell: React.FC<VowelCellProps> = React.memo(function VowelCell({
	vowels,
	onSelect,
}) {
	return (
		<BasePhonemeCellRenderer
			phonemes={vowels}
			onSelect={onSelect}
			getButtonClassName={getVowelButtonClassName}
			getAriaLabel={getVowelAriaLabel}
		/>
	);
});
