import {
	formatPhonemeLabel,
	type LanguagePhonemeId,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { getPhonemeComparisons } from "@/lib/phoneme-comparisons";
import { DetailsSection } from "./details-section";

export function ComparisonsSection({
	targetAccent,
	phonemeId,
}: {
	targetAccent: TargetAccent;
	phonemeId: LanguagePhonemeId<TargetAccent>;
}) {
	const comparisons = getPhonemeComparisons(targetAccent, phonemeId);
	if (comparisons.length === 0) return null;

	return (
		<DetailsSection title="Compare with">
			<ul className="flex flex-col gap-1">
				{comparisons.map(({ contrastId, partnerId, partnerIpa, pairs }) => (
					<li
						key={contrastId}
						className="flex items-baseline gap-3 rounded-2xl bg-background px-4 py-3"
					>
						<span
							aria-hidden="true"
							className="min-w-10 shrink-0 font-display text-lg leading-none"
						>
							/{partnerIpa}/
						</span>
						<span className="sr-only">{formatPhonemeLabel(targetAccent, partnerId)}:</span>
						<span className="text-sm text-muted-foreground">
							{pairs.map(({ words: [own, partner] }) => `${own} – ${partner}`).join(", ")}
						</span>
					</li>
				))}
			</ul>
		</DetailsSection>
	);
}
