"use client";

import {
	formatPhonemeLabel,
	type LanguagePhonemeId,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { Link as RouterLink } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
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
 * a diagram beside the sound, its audio, how common it is and an example. The
 * sound's name links to the chart, where everything else lives.
 */
export function PhonemeSummary<TLanguage extends TargetAccent>({
	targetAccent,
	phonemeId,
	showExamples = true,
	showChartLink = true,
}: PhonemeSummaryProps<TLanguage>) {
	const label = formatPhonemeLabel(targetAccent, phonemeId);
	const lastSpace = label.lastIndexOf(" ") + 1;
	const labelStart = label.slice(0, lastSpace);
	const labelEnd = label.slice(lastSpace);
	const frequency = summarizePhonemeFrequency(targetAccent, phonemeId);
	const spelling = showExamples ? getSpellingPattern(targetAccent, phonemeId) : undefined;

	return (
		<div className="flex w-80 items-start gap-3">
			<ArticulationThumbnail
				targetAccent={targetAccent}
				phonemeId={phonemeId}
				label={label}
				articulation={getPhonemeArticulation(targetAccent, phonemeId)}
			/>

			<div className="flex min-w-0 flex-col gap-1.5 text-sm">
				<PhonemeHeader phonemeId={phonemeId} />

				{showChartLink ? (
					<RouterLink
						to={getChartPathForPhoneme(phonemeId)}
						search={{ sound: phonemeId }}
						aria-label={`${label}, open in the IPA chart`}
						className="self-start rounded-sm leading-snug font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
					>
						{labelStart}
						{/* The icon wraps with the last word, never onto a line of its own. */}
						<span className="whitespace-nowrap">
							{labelEnd}
							<ExternalLink
								aria-hidden="true"
								className="ml-1 inline size-3.5 align-text-bottom text-muted-foreground"
							/>
						</span>
					</RouterLink>
				) : (
					<p className="leading-snug font-medium">{label}</p>
				)}

				{frequency && (
					<p className="text-xs text-muted-foreground">
						<span className="text-foreground">{frequency.band.label}</span> · {frequency.ranking}
					</p>
				)}
				{spelling && (
					<p className="text-xs text-muted-foreground">
						as in <SpellingExamples spelling={spelling} count={SUMMARY_EXAMPLE_COUNT} />
					</p>
				)}
			</div>
		</div>
	);
}
