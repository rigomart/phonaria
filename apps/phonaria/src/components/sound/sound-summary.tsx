"use client";

import {
	formatPhonemeLabel,
	getIpaForPhonemeId,
	getPhonemeType,
	type LanguagePhonemeId,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { ExternalLink } from "lucide-react";
import { AudioControls } from "@/components/audio-controls";
import { Link } from "@/components/link";
import { getSoundPath } from "@/lib/ipa-chart/sound-route";
import { summarizePhonemeFrequency } from "@/lib/phoneme-frequency";
import { ArticulationThumbnail } from "./articulation";
import {
	getPhonemeArticulation,
	getSpellingPattern,
	SoundSymbol,
	SpellingExamples,
} from "./sound-parts";

const SUMMARY_EXAMPLE_COUNT = 2;

export type SoundSummaryProps<TLanguage extends TargetAccent> = {
	targetAccent: TLanguage;
	phonemeId: LanguagePhonemeId<TLanguage>;
	/** Off in Practice: an example word could be the answer. */
	showExamples?: boolean;
	/** Off in Practice, so following it doesn't end the session. */
	showPageLink?: boolean;
};

/**
 * The short version of a sound, for popovers outside the IPA chart: a diagram
 * beside the sound, its audio, how common it is and an example. The sound's
 * name links to its page, where everything else lives.
 */
export function SoundSummary<TLanguage extends TargetAccent>({
	targetAccent,
	phonemeId,
	showExamples = true,
	showPageLink = true,
}: SoundSummaryProps<TLanguage>) {
	const ipa = getIpaForPhonemeId(phonemeId);
	const label = formatPhonemeLabel(targetAccent, phonemeId);
	const lastSpace = label.lastIndexOf(" ") + 1;
	const frequency = summarizePhonemeFrequency(targetAccent, phonemeId);
	const spelling = showExamples ? getSpellingPattern(targetAccent, phonemeId) : undefined;
	const hasAudio = getPhonemeType(phonemeId) !== "diphthong";

	return (
		<div className="flex w-80 items-start gap-3">
			<ArticulationThumbnail
				targetAccent={targetAccent}
				phonemeId={phonemeId}
				label={label}
				articulation={getPhonemeArticulation(targetAccent, phonemeId)}
			/>

			<div className="flex min-w-0 flex-col gap-1.5 text-sm">
				<div className="flex items-center gap-3">
					<SoundSymbol phonemeId={phonemeId} className="text-2xl" />
					{hasAudio && <AudioControls path={`/audio/phonemes/${phonemeId}.ogg`} label={ipa} />}
				</div>

				{showPageLink ? (
					<Link
						href={getSoundPath(phonemeId)}
						aria-label={`${label}, open its page`}
						className="self-start rounded-sm leading-snug font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
					>
						{label.slice(0, lastSpace)}
						{/* The icon wraps with the last word, never onto a line of its own. */}
						<span className="whitespace-nowrap">
							{label.slice(lastSpace)}
							<ExternalLink
								aria-hidden="true"
								className="ml-1 inline size-3.5 align-text-bottom text-muted-foreground"
							/>
						</span>
					</Link>
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
