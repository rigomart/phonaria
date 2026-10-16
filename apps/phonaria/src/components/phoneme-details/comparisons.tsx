import {
	formatPhonemeLabel,
	type LanguagePhonemeId,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { Fragment } from "react";
import { WordAudioButton } from "@/components/word-audio-button";
import type { PhonemeComparison } from "@/lib/phoneme-comparisons";
import { DetailsCard } from "./details-section";

/** Similar sounds, each with the minimal pairs that tell them apart. */
export function ComparisonList({
	targetAccent,
	comparisons,
}: {
	targetAccent: TargetAccent;
	comparisons: readonly PhonemeComparison[];
}) {
	return (
		<DetailsCard>
			<ul className="flex flex-col gap-3">
				{comparisons.map(({ contrastId, partnerId, partnerIpa, pairs }) => (
					<li key={contrastId} className="flex items-baseline gap-3">
						<span
							aria-hidden="true"
							className="min-w-10 shrink-0 font-display text-lg leading-none"
						>
							/{partnerIpa}/
						</span>
						<span className="sr-only">
							{formatPhonemeLabel(targetAccent, partnerId as LanguagePhonemeId<TargetAccent>)}:
						</span>
						<span className="text-sm text-muted-foreground">
							{pairs.map(({ words: [own, partner] }, index) => (
								<Fragment key={`${own}-${partner}`}>
									{index > 0 ? ", " : null}
									<span className="whitespace-nowrap">
										<ComparisonWord targetAccent={targetAccent} word={own} />
										{" – "}
										<ComparisonWord targetAccent={targetAccent} word={partner} />
									</span>
								</Fragment>
							))}
						</span>
					</li>
				))}
			</ul>
		</DetailsCard>
	);
}

/** The word is its own play button: a dotted underline marks it, and playback firms it up. */
function ComparisonWord({ targetAccent, word }: { targetAccent: TargetAccent; word: string }) {
	return (
		<WordAudioButton
			targetAccent={targetAccent}
			word={word}
			fallback={word}
			className="rounded-sm underline decoration-dotted decoration-1 underline-offset-4 outline-none transition-colors hover:text-foreground hover:decoration-solid focus-visible:ring-2 focus-visible:ring-ring data-[status=loading]:animate-pulse data-[status=playing]:text-foreground data-[status=playing]:decoration-solid motion-reduce:transition-none motion-reduce:data-[status=loading]:animate-none"
		/>
	);
}
