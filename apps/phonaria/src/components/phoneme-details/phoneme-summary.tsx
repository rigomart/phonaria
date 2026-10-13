"use client";

import {
	formatPhonemeLabel,
	type LanguagePhonemeId,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { Link as RouterLink } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { getChartPathForPhoneme } from "@/lib/ipa-chart/sound-search";
import { summarizePhonemeFrequency } from "@/lib/phoneme-frequency";
import { ArticulationThumbnail } from "./articulation";
import {
	getPhonemeArticulation,
	getSpellingPattern,
	PhonemeHeader,
	SpellingExamples,
} from "./phoneme-details";

const SUMMARY_EXAMPLE_COUNT = 2;

export type PhonemeSummaryProps<TLanguage extends TargetAccent> = {
	targetAccent: TLanguage;
	phonemeId: LanguagePhonemeId<TLanguage>;
	/** Off in Practice: an example word could be the answer. */
	showExamples?: boolean;
	/** Off in Practice, so following it doesn't end the session. */
	showChartLink?: boolean;
};

/**
 * The short version of a sound's details, for popovers outside the IPA chart:
 * the sound, its audio, a small diagram, how common it is and an example, with
 * a link to the chart where everything else lives.
 */
export function PhonemeSummary<TLanguage extends TargetAccent>({
	targetAccent,
	phonemeId,
	showExamples = true,
	showChartLink = true,
}: PhonemeSummaryProps<TLanguage>) {
	const label = formatPhonemeLabel(targetAccent, phonemeId);
	const frequency = summarizePhonemeFrequency(targetAccent, phonemeId);
	const spelling = showExamples ? getSpellingPattern(targetAccent, phonemeId) : undefined;

	return (
		<div className="flex w-72 flex-col gap-3">
			<PhonemeHeader phonemeId={phonemeId} />

			<div className="flex items-start gap-3">
				<ArticulationThumbnail
					targetAccent={targetAccent}
					phonemeId={phonemeId}
					label={label}
					articulation={getPhonemeArticulation(targetAccent, phonemeId)}
				/>
				<div className="flex min-w-0 flex-col gap-1.5 text-sm">
					<p className="leading-snug">{label}</p>
					{frequency && (
						<p className="text-xs text-muted-foreground">
							<span className="font-medium text-foreground">{frequency.band.label}</span> ·{" "}
							{frequency.ranking}
						</p>
					)}
					{spelling && (
						<p className="text-xs text-muted-foreground">
							as in <SpellingExamples spelling={spelling} count={SUMMARY_EXAMPLE_COUNT} />
						</p>
					)}
				</div>
			</div>

			{showChartLink && (
				<RouterLink
					to={getChartPathForPhoneme(phonemeId)}
					search={{ sound: phonemeId }}
					className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
				>
					Open in IPA chart
					<ArrowRight aria-hidden="true" className="size-4 text-muted-foreground" />
				</RouterLink>
			)}
		</div>
	);
}
