import { Button } from "@phonaria/ui/components/button";
import {
	Menu,
	MenuGroup,
	MenuGroupLabel,
	MenuItem,
	MenuPopup,
	MenuTrigger,
} from "@phonaria/ui/components/menu";
import { ChevronDown } from "lucide-react";
import type { TranscribedSyllable } from "@/lib/types/g2p";

interface VariantSelectorProps {
	variants: TranscribedSyllable[][];
	wordIndex: number;
	onSelect: (wordIndex: number, variantIndex: number) => void;
}

export function VariantSelector({ variants, wordIndex, onSelect }: VariantSelectorProps) {
	if (variants.length <= 1) return null;

	return (
		<Menu>
			<MenuTrigger
				render={<Button size="icon" variant="ghost" aria-label="Select pronunciation variant" />}
			>
				<ChevronDown className="size-4 text-muted-foreground" />
			</MenuTrigger>
			<MenuPopup align="start">
				<MenuGroup>
					<MenuGroupLabel>Variants</MenuGroupLabel>

					{variants.map((variant, index) => {
						const displayString = variant
							.map((syllable) => {
								const stressMark =
									syllable.stress === "primary" ? "ˈ" : syllable.stress === "secondary" ? "ˌ" : "";

								const phonemesStr = syllable.phonemes.map((p) => p.symbol).join(" ");
								return `${stressMark}${phonemesStr}`;
							})
							.join(" · ");

						return (
							<MenuItem key={`${wordIndex}-${index}`} onClick={() => onSelect(wordIndex, index)}>
								{`/${displayString}/`}
							</MenuItem>
						);
					})}
				</MenuGroup>
			</MenuPopup>
		</Menu>
	);
}
