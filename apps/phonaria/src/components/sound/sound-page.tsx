"use client";

import {
	formatPhonemeLabel,
	getIpaForPhonemeId,
	getPhonemeType,
	type LanguagePhonemeId,
	type PhonemeType,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { ArrowRight } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { AudioControls } from "@/components/audio-controls";
import { Link } from "@/components/link";
import { IPA_CHART_FREQUENCY_PATH } from "@/lib/ipa-chart-metadata";
import {
	type ChartSection,
	getChartSectionSounds,
	getSoundPath,
} from "@/lib/ipa-chart/sound-route";
import { getPhonemeComparisons, type PhonemeComparison } from "@/lib/phoneme-comparisons";
import { summarizePhonemeFrequency } from "@/lib/phoneme-frequency";
import { cn } from "@/lib/utils";
import { ArticulationDiagram } from "./articulation";
import {
	getPhonemeArticulation,
	getSpellingPattern,
	SoundSymbol,
	SpellingExamples,
} from "./sound-parts";

const TYPE_LABELS: Record<PhonemeType, string> = {
	consonant: "Consonant",
	monophthong: "Vowel",
	diphthong: "Diphthong",
};

const COMPARISON_PAIR_LIMIT = 4;

type SoundPageProps<TLanguage extends TargetAccent> = {
	targetAccent: TLanguage;
	phonemeId: LanguagePhonemeId<TLanguage>;
	section: ChartSection;
};

/**
 * One sound's page: how it sounds and how it's made first, then how common it
 * is and how it's spelled, then the sounds it's easily confused with.
 */
export function SoundPage<TLanguage extends TargetAccent>({
	targetAccent,
	phonemeId,
	section,
}: SoundPageProps<TLanguage>) {
	const headingId = useId();
	const label = formatPhonemeLabel(targetAccent, phonemeId);
	const phonemeType = getPhonemeType(phonemeId);
	const hasAudio = phonemeType !== "diphthong";

	return (
		<div className="flex flex-1 flex-col items-center bg-background">
			<div className="w-full max-w-5xl space-y-8 p-4 sm:p-6 animate-in fade-in duration-300">
				<SoundStrip targetAccent={targetAccent} section={section} currentId={phonemeId} />

				<article aria-labelledby={headingId} className="grid gap-8 lg:grid-cols-2 lg:gap-x-12">
					<header className="flex flex-col items-start gap-3 lg:pt-4">
						<p className="text-sm text-muted-foreground">{TYPE_LABELS[phonemeType]}</p>
						<h1 id={headingId} className="font-display text-7xl leading-none sm:text-8xl">
							<SoundSymbol phonemeId={phonemeId} />
						</h1>
						<p className="text-lg text-balance">{label}</p>
						{hasAudio && (
							<div className="pt-2">
								<AudioControls
									path={`/audio/phonemes/${phonemeId}.ogg`}
									label={getIpaForPhonemeId(phonemeId)}
									variant="labeled"
								/>
							</div>
						)}
					</header>

					<figure className="w-full max-w-md justify-self-center lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:max-w-none">
						<ArticulationDiagram
							targetAccent={targetAccent}
							phonemeId={phonemeId}
							label={label}
							articulation={getPhonemeArticulation(targetAccent, phonemeId)}
						/>
					</figure>

					<FrequencyFact targetAccent={targetAccent} phonemeId={phonemeId} />
					<SpellingFact targetAccent={targetAccent} phonemeId={phonemeId} />
				</article>

				<Comparisons targetAccent={targetAccent} phonemeId={phonemeId} />
			</div>
		</div>
	);
}

function SoundStrip<TLanguage extends TargetAccent>({
	targetAccent,
	section,
	currentId,
}: {
	targetAccent: TLanguage;
	section: ChartSection;
	currentId: LanguagePhonemeId<TLanguage>;
}) {
	const currentRef = useRef<HTMLAnchorElement>(null);
	const sounds = getChartSectionSounds(targetAccent, section);

	// Keep the current sound in view when the strip scrolls sideways.
	useEffect(() => {
		currentRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
	}, [currentId]);

	return (
		<nav aria-label={section === "consonants" ? "Consonant sounds" : "Vowel sounds"}>
			{/* Scrolls sideways on phones; wraps where there's room. */}
			<ul className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
				{sounds.map((id) => {
					const current = id === currentId;
					return (
						<li key={id}>
							<Link
								ref={current ? currentRef : undefined}
								href={getSoundPath(id)}
								aria-current={current ? "page" : undefined}
								aria-label={formatPhonemeLabel(targetAccent, id)}
								className={cn(
									"grid h-10 min-w-10 shrink-0 place-items-center rounded-md border px-2 font-display text-lg leading-none transition-colors motion-reduce:transition-none",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
									current
										? "border-primary bg-primary text-primary-foreground"
										: "bg-background-strong hover:border-primary hover:bg-muted",
								)}
							>
								{getIpaForPhonemeId(id)}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}

function FactHeading({ id, children }: { id: string; children: string }) {
	return (
		<h2 id={id} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
			{children}
		</h2>
	);
}

function FrequencyFact({
	targetAccent,
	phonemeId,
}: {
	targetAccent: TargetAccent;
	phonemeId: LanguagePhonemeId<TargetAccent>;
}) {
	const headingId = useId();
	const frequency = summarizePhonemeFrequency(targetAccent, phonemeId);
	if (!frequency) return null;

	return (
		<section aria-labelledby={headingId} className="flex flex-col gap-2 border-t pt-5">
			<div className="flex items-baseline justify-between gap-2">
				<FactHeading id={headingId}>Frequency</FactHeading>
				<Link
					href={IPA_CHART_FREQUENCY_PATH}
					className="inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
				>
					All sounds
					<ArrowRight aria-hidden="true" className="size-3.5" />
				</Link>
			</div>
			<p className="flex items-baseline gap-2">
				<span className="text-xl font-medium">{frequency.band.label}</span>
				<span className="text-sm text-muted-foreground">{frequency.ranking}</span>
			</p>
			<span aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-accent">
				<span
					className={cn("block h-full rounded-full", frequency.band.barClass)}
					style={{ width: `${frequency.position * 100}%` }}
				/>
			</span>
		</section>
	);
}

function SpellingFact({
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
		<section aria-labelledby={headingId} className="flex flex-col gap-3 border-t pt-5">
			<FactHeading id={headingId}>Spelling</FactHeading>
			<ul aria-label="Spellings" className="flex flex-wrap gap-2">
				{spelling.patterns.map((pattern) => (
					<li
						key={pattern}
						className="rounded-md border bg-background-strong px-2.5 py-1 font-medium"
					>
						{pattern}
					</li>
				))}
			</ul>
			<p className="text-muted-foreground">
				as in <SpellingExamples spelling={spelling} />
			</p>
		</section>
	);
}

function Comparisons({
	targetAccent,
	phonemeId,
}: {
	targetAccent: TargetAccent;
	phonemeId: LanguagePhonemeId<TargetAccent>;
}) {
	const headingId = useId();
	const comparisons = getPhonemeComparisons(targetAccent, phonemeId, COMPARISON_PAIR_LIMIT);
	if (comparisons.length === 0) return null;

	return (
		<section aria-labelledby={headingId} className="flex flex-col gap-4 border-t pt-6">
			<h2 id={headingId} className="font-display text-xl font-bold tracking-tight">
				Compare with
			</h2>
			<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{comparisons.map((comparison) => (
					<li key={comparison.contrastId}>
						<ComparisonCard
							targetAccent={targetAccent}
							phonemeId={phonemeId}
							comparison={comparison}
						/>
					</li>
				))}
			</ul>
		</section>
	);
}

/** Minimal pairs as two columns: this sound's words, then the other sound's. */
function ComparisonCard({
	targetAccent,
	phonemeId,
	comparison,
}: {
	targetAccent: TargetAccent;
	phonemeId: LanguagePhonemeId<TargetAccent>;
	comparison: PhonemeComparison;
}) {
	const partnerLabel = formatPhonemeLabel(targetAccent, comparison.partnerId);

	return (
		<table className="w-full table-fixed overflow-hidden rounded-2xl border bg-background-strong text-left">
			<caption className="sr-only">
				Minimal pairs: /{getIpaForPhonemeId(phonemeId)}/ and /{comparison.partnerIpa}/,{" "}
				{partnerLabel}
			</caption>
			<thead>
				<tr className="border-b">
					<th scope="col" className="px-4 py-3 align-top text-2xl font-normal">
						<SoundSymbol phonemeId={phonemeId} />
					</th>
					<th
						scope="col"
						aria-label={`/${comparison.partnerIpa}/, ${partnerLabel}`}
						className="px-4 py-3 align-top font-normal"
					>
						<Link
							href={getSoundPath(comparison.partnerId)}
							className="group inline-flex flex-col rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							<span className="inline-flex items-center gap-1 text-2xl">
								<SoundSymbol phonemeId={comparison.partnerId} />
								<ArrowRight
									aria-hidden="true"
									className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
								/>
							</span>
							<span className="text-xs text-muted-foreground group-hover:text-foreground">
								{partnerLabel}
							</span>
						</Link>
					</th>
				</tr>
			</thead>
			<tbody>
				{comparison.pairs.map(({ words: [own, partner] }) => (
					<tr key={`${own}-${partner}`} className="border-b last:border-b-0">
						<td className="px-4 py-2">{own}</td>
						<td className="px-4 py-2 text-muted-foreground">{partner}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
