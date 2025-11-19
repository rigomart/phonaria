import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
			<DropdownMenuTrigger asChild>
				<Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-muted/50">
					<ChevronDown className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuLabel>Variants</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{variants.map((v, i) => {
					const flatPhonemes = v.flatMap((s) => s.phonemes);
					const key = flatPhonemes.map((p) => p.symbol).join("");
					return (
						<DropdownMenuItem key={key} onClick={() => onSelect(wordIndex, i)}>
							{`/${flatPhonemes.map((p) => p.symbol).join(" ")}/`}
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
