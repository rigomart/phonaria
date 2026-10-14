"use client";

import type { LanguagePhonemeId, TargetAccent } from "@phonaria/phonetics-data";
import { ArticulationSection } from "./articulation-section";
import { ComparisonsSection } from "./comparisons-section";
import { FrequencySection } from "./frequency-section";
import { SpellingSection } from "./spelling-section";

export interface PhonemeDetailsProps<TLanguage extends TargetAccent> {
	targetAccent: TLanguage;
	phonemeId: LanguagePhonemeId<TLanguage>;
	/**
	 * Minimal pairs against similar sounds. Off where the details are Practice
	 * assistance, since a pair could spell out the word being answered.
	 */
	showComparisons?: boolean;
	/** Off for Practice assistance too: an example word could be the answer. */
	showSpellings?: boolean;
	/** Off on the frequency page itself, and in Practice so following it doesn't end the session. */
	showFrequencyLink?: boolean;
}

/**
 * The sections below the sound header, most hands-on first: how the sound is
 * made, what it gets confused with, how it is spelled, how common it is.
 * Each section hides itself when the accent has no data for it.
 */
export function PhonemeDetails<TLanguage extends TargetAccent>({
	targetAccent,
	phonemeId,
	showComparisons = true,
	showSpellings = true,
	showFrequencyLink = true,
}: PhonemeDetailsProps<TLanguage>) {
	return (
		<div className="flex flex-col gap-6 px-5 pb-6">
			<ArticulationSection targetAccent={targetAccent} phonemeId={phonemeId} />
			{showComparisons ? (
				<ComparisonsSection targetAccent={targetAccent} phonemeId={phonemeId} />
			) : null}
			{showSpellings ? <SpellingSection targetAccent={targetAccent} phonemeId={phonemeId} /> : null}
			<FrequencySection
				targetAccent={targetAccent}
				phonemeId={phonemeId}
				showLink={showFrequencyLink}
			/>
		</div>
	);
}
