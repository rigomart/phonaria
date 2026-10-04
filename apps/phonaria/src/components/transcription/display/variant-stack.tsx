import type { TargetAccent } from "@phonaria/phonetics-data";
import { useState } from "react";
import { useSwapAnimation } from "@/hooks/use-swap-animation";
import { extractWordIpa } from "@/lib/ipa-copy";
import { orderVariants } from "@/lib/transcription/variant-order";
import type { TranscribedSyllable, TranscribedWord } from "@/lib/types/g2p";
import { cn } from "@/lib/utils";
import { IpaSequence } from "./ipa-sequence";

interface VariantStackProps {
	targetAccent: TargetAccent;
	word: TranscribedWord;
	selected: number;
	onSelect: (wordIndex: number, variantIndex: number) => void;
}

/**
 * The active variant at full size, with the word's other variants stacked
 * underneath, smaller and faded. Choosing a faded variant swaps it with the
 * active one and animates both into place. Faded slots are keyed by position,
 * so focus stays on the slot that was clicked.
 */
export function VariantStack({ targetAccent, word, selected, onSelect }: VariantStackProps) {
	const count = word.variants.length;
	const [previousOrder, setPreviousOrder] = useState<number[]>([]);
	const order = orderVariants(previousOrder, selected, count);
	const [active, ...faded] = order;
	const { track, swap } = useSwapAnimation<number>();

	function choose(variantIndex: number) {
		swap(() => {
			setPreviousOrder(orderVariants(order, variantIndex, count));
			onSelect(word.wordIndex, variantIndex);
		});
	}

	return (
		<div className="flex flex-col items-center">
			<div ref={track(active ?? 0)}>
				<IpaSequence
					targetAccent={targetAccent}
					syllables={word.variants[active ?? 0] ?? []}
					wordIndex={word.wordIndex}
				/>
			</div>

			{faded.length > 0 ? (
				<ul
					aria-label={`Other pronunciations of ${word.word}`}
					className="flex flex-col items-center"
				>
					{faded.map((variantIndex, slot) => (
						<li key={slot}>
							<button
								type="button"
								onClick={() => choose(variantIndex)}
								aria-label={`Use pronunciation /${extractWordIpa(word, variantIndex)}/`}
								className={cn(
									"rounded-md px-2 py-0.5 leading-snug text-muted-foreground cursor-pointer",
									"transition-colors duration-150 hover:bg-accent hover:text-foreground",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:text-foreground",
									"pointer-coarse:min-h-11",
									slot === 0 ? "text-base md:text-xl" : "text-sm md:text-base",
								)}
							>
								<span ref={track(variantIndex)} className="inline-block whitespace-nowrap">
									<FadedVariant syllables={word.variants[variantIndex] ?? []} />
								</span>
							</button>
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}

function FadedVariant({ syllables }: { syllables: TranscribedSyllable[] }) {
	return syllables.map((syllable, syllableIndex) => {
		const stress = syllable.stress === "primary" ? "ˈ" : syllable.stress === "secondary" ? "ˌ" : "";
		const key = `${syllableIndex}-${syllable.phonemes.map((p) => p.symbol).join("")}`;
		return (
			<span key={key}>
				{stress}
				{syllable.phonemes.map((p) => p.symbol).join("")}
				{syllableIndex < syllables.length - 1 ? <span className="mx-0.5">·</span> : null}
			</span>
		);
	});
}
