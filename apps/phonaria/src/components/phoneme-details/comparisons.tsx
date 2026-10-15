import {
	formatPhonemeLabel,
	type LanguagePhonemeId,
	type TargetAccent,
} from "@phonaria/phonetics-data";
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
							{pairs.map(({ words: [own, partner] }) => `${own} – ${partner}`).join(", ")}
						</span>
					</li>
				))}
			</ul>
		</DetailsCard>
	);
}
