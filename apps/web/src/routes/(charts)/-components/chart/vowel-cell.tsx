import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import type { VowelPhoneme } from "shared-data";
import { phonixUtils } from "shared-data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PhonemeButton } from "./phoneme-button";

const { toPhonemic } = phonixUtils;

interface VowelCellProps {
	vowels: VowelPhoneme[];
	onSelect: (v: VowelPhoneme) => void;
}

/**
 * Variant-powered styling for vowel phoneme buttons.
 *
 * Variants:
 * - shape: rounded / rhotic / plain
 * (Tenseness removed from visual encoding to reduce cognitive load.)
 *
 * Pseudo elements are used so we don't need extra DOM nodes (keeps markup simpler and
 * avoids interfering with the focus-visible ring).
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

function vowelButtonClass(props: VowelButtonVariants) {
	return vowelButtonVariants(props);
}

export const VowelCell: React.FC<VowelCellProps> = React.memo(function VowelCell({
	vowels,
	onSelect,
}) {
	if (!vowels.length) {
		return (
			<div className="flex h-14 items-center justify-center">
				<div className="h-2.5 w-2.5 rounded-full bg-border" aria-hidden="true" />
			</div>
		);
	}
	return (
		<div className="flex h-14 items-center justify-center gap-1">
			{vowels.map((v) => {
				const rounded = v.articulation.roundness === "rounded";
				const rhotic = v.articulation.rhoticity === "rhotic" || v.type === "rhotic";
				return (
					<Tooltip key={v.symbol}>
						<TooltipTrigger asChild>
							<PhonemeButton
								type="button"
								onClick={() => onSelect(v)}
								aria-label={`${toPhonemic(v.symbol)} ${v.articulation.height} ${v.articulation.frontness} ${v.articulation.tenseness} ${v.articulation.roundness}${rhotic ? " rhotic" : ""}. Tap for details.`}
								className={cn(
									vowelButtonClass({ shape: rhotic ? "rhotic" : rounded ? "rounded" : "plain" }),
								)}
							>
								<span className="pointer-events-none select-none text-xl sm:text-2xl leading-none">
									{v.symbol}
								</span>
							</PhonemeButton>
						</TooltipTrigger>
						<TooltipContent side="top" align="center">
							<div className="max-w-[14rem] text-pretty text-xs leading-snug">
								<div className="font-medium">
									{toPhonemic(v.symbol)} {v.description}
								</div>
								<div className="text-[10px] text-muted-foreground">Tap for details</div>
							</div>
						</TooltipContent>
					</Tooltip>
				);
			})}
		</div>
	);
});
