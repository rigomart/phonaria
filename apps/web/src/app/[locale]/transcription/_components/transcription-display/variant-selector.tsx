import { Button } from "@phonaria/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@phonaria/ui/components/menu";
import { ChevronDown } from "lucide-react";
import type { TranscribedSyllable } from "../../_types/g2p";

interface VariantSelectorProps {
	variants: TranscribedSyllable[][];
	wordIndex: number;
	onSelect: (wordIndex: number, variantIndex: number) => void;
}

export function VariantSelector({ variants, wordIndex, onSelect }: VariantSelectorProps) {
	if (variants.length <= 1) return null;

	return (
		<DropdownMenu>
			<Button
				size="icon"
				variant="ghost"
				className="h-8 w-8 rounded-full border border-border/70 bg-background hover:border-border hover:bg-muted/40"
				aria-label="Select pronunciation variant"
				render={
					<DropdownMenuTrigger>
						<ChevronDown className="h-4 w-4 text-muted-foreground" />
					</DropdownMenuTrigger>
				}
			/>
			<DropdownMenuContent align="start">
				<DropdownMenuGroup>
					<DropdownMenuLabel>Variants</DropdownMenuLabel>
					<DropdownMenuSeparator />
				</DropdownMenuGroup>
				{variants.map((variant, index) => {
					// Format the display string with stress markers and syllable separators
					const displayString = variant
						.map((syllable) => {
							const stressMark =
								syllable.stress === "primary" ? "ˈ" : syllable.stress === "secondary" ? "ˌ" : "";

							const phonemesStr = syllable.phonemes.map((p) => p.symbol).join(" ");
							return `${stressMark}${phonemesStr}`;
						})
						.join(" · ");

					return (
						<DropdownMenuItem
							key={`${wordIndex}-${index}`}
							onClick={() => onSelect(wordIndex, index)}
						>
							{`/${displayString}/`}
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
