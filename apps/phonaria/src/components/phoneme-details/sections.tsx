import type { ReactNode } from "react";
import { getPhonemeComparisons } from "@/lib/phoneme-comparisons";
import { summarizePhonemeFrequency } from "@/lib/phoneme-frequency";
import { Articulation } from "./articulation";
import { ComparisonList } from "./comparisons";
import { DetailsSection } from "./details-section";
import { AllSoundsLink, FrequencyMeter } from "./frequency";
import { getSpellingPattern, type PhonemeDetailsOptions } from "./sound";
import { SpellingPatterns } from "./spelling";

export interface DetailSection {
	id: string;
	title: string;
	/** Sits opposite the title, e.g. a link to a fuller page. */
	action?: ReactNode;
	content: ReactNode;
}

/**
 * The full view's sections, most hands-on first: how the sound is made, what
 * it gets confused with, how it is spelled, how common it is. Sections without
 * data, or switched off by the host, are left out here, at the source, so the
 * "More about" summary and the full view always list the same things.
 *
 * Planned sections slot in without touching the containers: allophones after
 * `articulation`, all spellings and word audio inside `spelling` and
 * `comparisons`.
 */
export function getDetailSections({
	targetAccent,
	phonemeId,
	showComparisons = true,
	showSpellings = true,
	showFrequencyLink = true,
}: PhonemeDetailsOptions): DetailSection[] {
	const sections: DetailSection[] = [
		{
			id: "articulation",
			title: "How it's made",
			content: <Articulation targetAccent={targetAccent} phonemeId={phonemeId} />,
		},
	];

	const comparisons = showComparisons ? getPhonemeComparisons(targetAccent, phonemeId) : [];
	if (comparisons.length > 0) {
		sections.push({
			id: "comparisons",
			title: "Compare with",
			content: <ComparisonList targetAccent={targetAccent} comparisons={comparisons} />,
		});
	}

	const spelling = showSpellings ? getSpellingPattern(targetAccent, phonemeId) : undefined;
	if (spelling) {
		sections.push({
			id: "spelling",
			title: "Spelling",
			content: <SpellingPatterns spelling={spelling} />,
		});
	}

	const frequency = summarizePhonemeFrequency(targetAccent, phonemeId);
	if (frequency) {
		sections.push({
			id: "frequency",
			title: "How common",
			action: showFrequencyLink ? <AllSoundsLink /> : undefined,
			content: <FrequencyMeter frequency={frequency} />,
		});
	}

	return sections;
}

/** The sections stacked, separated by space rather than lines. */
export function DetailSections({ sections }: { sections: readonly DetailSection[] }) {
	return (
		<div className="flex flex-col gap-6">
			{sections.map(({ id, title, action, content }) => (
				<DetailsSection key={id} title={title} action={action}>
					{content}
				</DetailsSection>
			))}
		</div>
	);
}
