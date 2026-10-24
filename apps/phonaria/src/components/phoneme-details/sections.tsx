import { getIpaForPhonemeId, getPhonemeType } from "@phonaria/phonetics-data";
import type { ReactNode } from "react";
import { IPA_CHART_CONSONANTS_PATH, IPA_CHART_VOWELS_PATH } from "@/lib/ipa-chart-metadata";
import { getPhonemeComparisons } from "@/lib/phoneme-comparisons";
import { Articulation } from "./articulation";
import { ComparisonList } from "./comparisons";
import { DetailsLink, DetailsSection } from "./details-section";
import { MergerNote } from "./merger-note";
import { getMergerNotes, getSpellingPattern, type PhonemeDetailsOptions } from "./sound";
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
 * it gets confused with, how it is spelled, and any vowel merger it is part of
 * (how common it is sits in the header). Sections without
 * data, or switched off by the host, are left out here, at the source, so the
 * "More about" summary and the full view always list the same things.
 */
export function getDetailSections({
	targetAccent,
	phonemeId,
	showComparisons = true,
	showSpellings = true,
	showChartLink = true,
}: PhonemeDetailsOptions): DetailSection[] {
	const isConsonant = getPhonemeType(phonemeId) === "consonant";
	const sections: DetailSection[] = [
		{
			id: "articulation",
			title: "How it's made",
			action: showChartLink ? (
				<DetailsLink href={isConsonant ? IPA_CHART_CONSONANTS_PATH : IPA_CHART_VOWELS_PATH}>
					{isConsonant ? "Consonant chart" : "Vowel chart"}
				</DetailsLink>
			) : undefined,
			content: <Articulation targetAccent={targetAccent} phonemeId={phonemeId} />,
		},
	];

	const comparisons = showComparisons ? getPhonemeComparisons(targetAccent, phonemeId) : [];
	if (comparisons.length > 0) {
		sections.push({
			id: "comparisons",
			title: "Compare with",
			content: (
				<ComparisonList
					targetAccent={targetAccent}
					ipa={getIpaForPhonemeId(phonemeId)}
					comparisons={comparisons}
				/>
			),
		});
	}

	const spelling = showSpellings ? getSpellingPattern(targetAccent, phonemeId) : undefined;
	if (spelling) {
		sections.push({
			id: "spelling",
			title: "Spelling",
			content: <SpellingPatterns targetAccent={targetAccent} spelling={spelling} />,
		});
	}

	for (const note of getMergerNotes(targetAccent, phonemeId)) {
		sections.push({
			id: `merger-${note.id}`,
			title: note.title,
			content: <MergerNote note={note} />,
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
