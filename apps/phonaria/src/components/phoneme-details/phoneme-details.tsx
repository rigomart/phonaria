"use client";

import {
	formatPhonemeLabel,
	getIpaForPhonemeId,
	getPhonemeArticulationRegistryForLanguage,
	getPhonemeType,
	getSpellingPatternRegistryForLanguage,
	type LanguagePhonemeId,
	type PhonemeArticulation,
	type SpellingPattern,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { ArrowRight } from "lucide-react";
import { Fragment, type ReactNode, useId } from "react";
import { AudioControls } from "@/components/audio-controls";
import { Link } from "@/components/link";
import { SpelledWord } from "@/components/spelled-word";
import { IPA_CHART_FREQUENCY_PATH } from "@/lib/ipa-chart-metadata";
import { getPhonemeComparisons } from "@/lib/phoneme-comparisons";
import { summarizePhonemeFrequency } from "@/lib/phoneme-frequency";
import { cn } from "@/lib/utils";
import { ArticulationDiagram } from "./articulation";

export type PhonemeDetailsProps<TLanguage extends TargetAccent> = {
	targetAccent: TLanguage;
	phonemeId: LanguagePhonemeId<TLanguage>;
	/** Id for the sound's heading, so a sheet or drawer can be labelled by it. */
	headingId?: string;
	/** Off on the Frequency page itself. */
	showFrequencyLink?: boolean;
	/** Shown at the end of the header row, e.g. a close button. */
	action?: ReactNode;
	className?: string;
};

export function getPhonemeArticulation<TLanguage extends TargetAccent>(
	targetAccent: TLanguage,
	phonemeId: LanguagePhonemeId<TLanguage>,
): PhonemeArticulation {
	const registry = getPhonemeArticulationRegistryForLanguage(targetAccent) as Record<
		LanguagePhonemeId<TLanguage>,
		PhonemeArticulation
	>;
	return registry[phonemeId];
}

/** Everything about one sound. Shown in the IPA chart's side sheet and drawer. */
export function PhonemeDetails<TLanguage extends TargetAccent>({
	targetAccent,
	phonemeId,
	headingId,
	showFrequencyLink = true,
	action,
	className,
}: PhonemeDetailsProps<TLanguage>) {
	const label = formatPhonemeLabel(targetAccent, phonemeId);
	const isDiphthong = getPhonemeType(phonemeId) === "diphthong";

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<div className="flex items-start justify-between gap-2">
				<PhonemeHeader phonemeId={phonemeId} headingId={headingId} as="h2" />
				{action}
			</div>

			{!isDiphthong && <p className="text-xs text-muted-foreground leading-snug">{label}</p>}

			<ArticulationDiagram
				targetAccent={targetAccent}
				phonemeId={phonemeId}
				label={label}
				articulation={getPhonemeArticulation(targetAccent, phonemeId)}
			/>

			<PhonemeFrequency
				targetAccent={targetAccent}
				phonemeId={phonemeId}
				showLink={showFrequencyLink}
			/>

			<PhonemeSpelling targetAccent={targetAccent} phonemeId={phonemeId} />

			<PhonemeComparisons targetAccent={targetAccent} phonemeId={phonemeId} />
		</div>
	);
}

/** `/t/` and its audio buttons. */
export function PhonemeHeader({
	phonemeId,
	headingId,
	as: Heading = "div",
}: {
	phonemeId: LanguagePhonemeId<TargetAccent>;
	headingId?: string;
	as?: "h2" | "div";
}) {
	const ipa = getIpaForPhonemeId(phonemeId);
	const phonemeType = getPhonemeType(phonemeId);
	const showAudio = phonemeType === "consonant" || phonemeType === "monophthong";

	return (
		<div className="flex items-center gap-3">
			<Heading id={headingId} className="flex items-baseline gap-0.5 text-2xl font-medium">
				<span aria-hidden="true" className="text-muted-foreground/50">
					/
				</span>
				<span>{ipa}</span>
				<span aria-hidden="true" className="text-muted-foreground/50">
					/
				</span>
			</Heading>
			{showAudio && <AudioControls path={`/audio/phonemes/${phonemeId}.ogg`} label={ipa} />}
		</div>
	);
}

const SPELLING_EXAMPLE_COUNT = 2;

function PhonemeFrequency({
	targetAccent,
	phonemeId,
	showLink,
}: {
	targetAccent: TargetAccent;
	phonemeId: LanguagePhonemeId<TargetAccent>;
	showLink: boolean;
}) {
	const headingId = useId();
	const frequency = summarizePhonemeFrequency(targetAccent, phonemeId);
	if (!frequency) return null;

	return (
		<section aria-labelledby={headingId} className="flex flex-col gap-1.5 border-t pt-2">
			<div className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
				<h3 id={headingId}>Frequency</h3>
				{showLink && (
					<Link
						href={IPA_CHART_FREQUENCY_PATH}
						className="inline-flex items-center gap-0.5 rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
					>
						All sounds
						<ArrowRight aria-hidden="true" className="size-3" />
					</Link>
				)}
			</div>
			<p className="text-sm">
				<span className="font-medium">{frequency.band.label}</span>
				<span className="text-muted-foreground"> · {frequency.ranking}</span>
			</p>
			<span aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-accent">
				<span
					className={cn("block h-full rounded-full", frequency.band.barClass)}
					style={{ width: `${frequency.position * 100}%` }}
				/>
			</span>
		</section>
	);
}

export function getSpellingPattern(
	targetAccent: TargetAccent,
	phonemeId: LanguagePhonemeId<TargetAccent>,
): SpellingPattern | undefined {
	const registry = getSpellingPatternRegistryForLanguage(targetAccent) as Partial<
		Record<LanguagePhonemeId<TargetAccent>, SpellingPattern>
	> | null;
	return registry?.[phonemeId];
}

function PhonemeSpelling({
	targetAccent,
	phonemeId,
}: {
	targetAccent: TargetAccent;
	phonemeId: LanguagePhonemeId<TargetAccent>;
}) {
	const headingId = useId();
	const spelling = getSpellingPattern(targetAccent, phonemeId);
	if (!spelling) return null;

	return (
		<section aria-labelledby={headingId} className="flex flex-col gap-1.5 border-t pt-2">
			<h3 id={headingId} className="text-xs text-muted-foreground">
				Spelling
			</h3>
			<p className="flex items-baseline gap-2 text-sm">
				<span className="min-w-10 shrink-0 font-medium">{spelling.patterns.join(", ")}</span>
				<span className="text-muted-foreground">
					<SpellingExamples spelling={spelling} count={SPELLING_EXAMPLE_COUNT} />
				</span>
			</p>
		</section>
	);
}

/** The first few example words, with the letters that spell the sound emphasized. */
export function SpellingExamples({
	spelling,
	count,
}: {
	spelling: SpellingPattern;
	count: number;
}) {
	return spelling.examples.slice(0, count).map((example, index) => (
		<Fragment key={example.word}>
			{index > 0 && ", "}
			<SpelledWord spelled={example.spelled} />
		</Fragment>
	));
}

function PhonemeComparisons({
	targetAccent,
	phonemeId,
}: {
	targetAccent: TargetAccent;
	phonemeId: LanguagePhonemeId<TargetAccent>;
}) {
	const headingId = useId();
	const comparisons = getPhonemeComparisons(targetAccent, phonemeId);
	if (comparisons.length === 0) return null;

	return (
		<section aria-labelledby={headingId} className="flex flex-col gap-1.5 border-t pt-2">
			<h3 id={headingId} className="text-xs text-muted-foreground">
				Compare with
			</h3>
			<ul className="flex flex-col gap-1">
				{comparisons.map(({ contrastId, partnerId, partnerIpa, pairs }) => (
					<li key={contrastId} className="flex items-baseline gap-2 text-sm">
						<span aria-hidden="true" className="min-w-10 shrink-0 font-medium">
							/{partnerIpa}/
						</span>
						<span className="sr-only">{formatPhonemeLabel(targetAccent, partnerId)}:</span>
						<span className="text-muted-foreground">
							{pairs.map(({ words: [own, partner] }) => `${own} – ${partner}`).join(", ")}
						</span>
					</li>
				))}
			</ul>
		</section>
	);
}
