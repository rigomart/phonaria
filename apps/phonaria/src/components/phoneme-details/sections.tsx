import { getIpaForPhonemeId, getPhonemeType, type TargetAccent } from "@phonaria/phonetics-data";
import type { ReactNode } from "react";
import { SyntheticVoiceNote } from "@/components/synthetic-voice-note";
import { IPA_CHART_CONSONANTS_PATH, IPA_CHART_VOWELS_PATH } from "@/lib/ipa-chart-metadata";
import { getPhonemeComparisons } from "@/lib/phoneme-comparisons";
import { pairSpellings } from "@/lib/spelling-pairs";
import { Articulation } from "./articulation";
import { ComparisonList } from "./comparisons";
import { type DetailsLayout, DetailsLink, DetailsSection } from "./details-section";
import { MergerNote } from "./merger-note";
import { getMergerNotes, getSpellingPattern, type PhonemeDetailsOptions } from "./sound";
import { SpellingPatterns } from "./spelling";

export interface DetailSection {
	id: string;
	title: string;
	/** Sits opposite the title, e.g. a link to a fuller page. */
	action?: ReactNode;
	content: ReactNode;
	/** The words its content can play. */
	words?: readonly string[];
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
			words: comparisons.flatMap(({ pairs }) => pairs.flatMap(({ words }) => words)),
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
			words: pairSpellings(spelling).rows.flatMap(({ examples }) =>
				examples.map(({ word }) => word),
			),
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

/**
 * The sections separated by space rather than lines: stacked in a drawer, in
 * two columns on a wide page. With `voiceNote`, the synthetic-voice note
 * closes them when a section plays a word; the drawer leaves it off while its
 * sections are out of view.
 */
export function DetailSections({
	targetAccent,
	sections,
	voiceNote = true,
	layout = "drawer",
}: {
	targetAccent: TargetAccent;
	sections: readonly DetailSection[];
	voiceNote?: boolean;
	layout?: DetailsLayout;
}) {
	return (
		<div
			className={
				layout === "page"
					? "grid items-start gap-x-12 gap-y-10 lg:grid-cols-2"
					: "flex flex-col gap-6"
			}
		>
			{sections.map(({ id, title, action, content }) => (
				<DetailsSection key={id} title={title} action={action} layout={layout}>
					{content}
				</DetailsSection>
			))}
			{voiceNote ? (
				<SyntheticVoiceNote
					targetAccent={targetAccent}
					words={sections.flatMap(({ words = [] }) => words)}
					className={layout === "page" ? "lg:col-span-2" : undefined}
				/>
			) : null}
		</div>
	);
}
