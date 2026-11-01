import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { type ReactNode, useId } from "react";
import { Link } from "@/components/link";
import { DetailsCard } from "@/components/phoneme-details/details-section";
import { MergerNote } from "@/components/phoneme-details/merger-note";
import { PlayableWord, PlayableWordCell } from "@/components/phoneme-details/playable-word";
import { getMergerNotes, getSpellingPattern } from "@/components/phoneme-details/sound";
import { SpellingPatterns } from "@/components/phoneme-details/spelling";
import { SpelledWord } from "@/components/spelled-word";
import { IPA_CHART_FREQUENCY_PATH } from "@/lib/ipa-chart-metadata";
import { formatPercentage, summarizePhonemeFrequency } from "@/lib/phoneme-frequency";
import {
	getCommonWords,
	getNeighbourPages,
	getSharedSpellings,
	getSoundFamilies,
	getSoundFeatures,
	getSoundVariants,
	type SoundRef,
	type SoundVariant,
} from "@/lib/sound-page-content";
import { getSoundExamples } from "@/lib/sound-pages";
import { cn } from "@/lib/utils";

const ACCENT = "en-us" as const;

/** A titled block of the page, its title an h2 under the sound's h1. */
export function PageSection({ title, children }: { title: string; children: ReactNode }) {
	const headingId = useId();
	return (
		<section aria-labelledby={headingId} className="flex flex-col gap-3">
			<h2
				id={headingId}
				className="font-display text-xl font-semibold tracking-tight text-foreground"
			>
				{title}
			</h2>
			{children}
		</section>
	);
}

/** The key words, the letters that spell the sound marked, each playable. */
export function KeyWords({ phonemeId }: { phonemeId: EnglishPhonemeSymbolId }) {
	return (
		<p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
			<span className="text-sm text-muted-foreground">as in</span>
			{getSoundExamples(phonemeId).map(({ word, spelled }) => (
				<PlayableWord key={word} targetAccent={ACCENT} word={word}>
					<SpelledWord spelled={spelled} />
				</PlayableWord>
			))}
		</p>
	);
}

function ordinal(n: number): string {
	const tens = n % 100;
	if (tens >= 11 && tens <= 13) return `${n}th`;
	return `${n}${{ 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th"}`;
}

/** How common the sound is, as one line that links to the ranking. */
export function FrequencyFact({ phonemeId }: { phonemeId: EnglishPhonemeSymbolId }) {
	const frequency = summarizePhonemeFrequency(ACCENT, phonemeId);
	if (!frequency) return null;
	return (
		<Link
			href={IPA_CHART_FREQUENCY_PATH}
			className="group inline-flex w-fit flex-wrap items-baseline gap-x-1.5 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
		>
			<span>
				<span className="font-semibold text-foreground">{ordinal(frequency.rank)}</span>
				{` most common of ${frequency.count} sounds`}
			</span>
			<span className="inline-flex items-center gap-1.5 whitespace-nowrap">
				{`· about ${formatPercentage(frequency.percentage)} of speech`}
				<ArrowRight
					aria-hidden="true"
					className="size-3 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
				/>
			</span>
		</Link>
	);
}

/** The articulation features as labelled values: data, not instructions. */
export function FeatureList({ phonemeId }: { phonemeId: EnglishPhonemeSymbolId }) {
	return (
		<dl className="flex flex-wrap gap-2">
			{getSoundFeatures(phonemeId).map(({ label, value }) => (
				<div
					key={label}
					className="flex items-baseline gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-sm"
				>
					<dt className="text-xs text-muted-foreground">{label}</dt>
					<dd className="text-foreground">{value}</dd>
				</div>
			))}
		</dl>
	);
}

/** The spellings, then the other sounds the same letters spell. */
export function Spelling({ phonemeId }: { phonemeId: EnglishPhonemeSymbolId }) {
	const spelling = getSpellingPattern(ACCENT, phonemeId);
	const shared = getSharedSpellings(phonemeId);
	if (!spelling) return null;
	return (
		<div className="flex flex-col gap-2">
			<SpellingPatterns targetAccent={ACCENT} spelling={spelling} />
			{shared.length > 0 ? (
				<DetailsCard className="flex flex-col gap-1.5 p-3">
					<h3 className="px-1 text-xs font-medium text-muted-foreground">
						The same letters also spell
					</h3>
					<ul className="flex flex-col gap-1">
						{shared.map(({ pattern, others }) => (
							<li
								key={pattern}
								className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-1 text-sm"
							>
								<span className="w-10 font-display font-semibold text-foreground">{pattern}</span>
								{others.map((other) => (
									<SoundLink key={other.id} sound={other} />
								))}
							</li>
						))}
					</ul>
				</DetailsCard>
			) : null}
		</div>
	);
}

function SoundLink({ sound }: { sound: SoundRef }) {
	return (
		<Link
			href={sound.path}
			className="inline-flex items-baseline gap-1.5 rounded-lg px-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
		>
			<span className="font-display text-base text-foreground">/{sound.ipa}/</span>
			{sound.word}
		</Link>
	);
}

export function commonWordGroups(phonemeId: EnglishPhonemeSymbolId) {
	const common = getCommonWords(phonemeId);
	return [
		{ label: "At the start", words: common.start },
		{ label: "Inside", words: common.inside },
		{ label: "At the end", words: common.end },
	].filter(({ words }) => words.length > 0);
}

/** Common words from the top-1k list, grouped by where the sound falls. */
export function CommonWords({
	groups,
}: {
	groups: readonly { label: string; words: readonly string[] }[];
}) {
	return (
		<DetailsCard className="flex flex-col gap-3 p-3">
			{groups.map(({ label, words }) => (
				<WordGroup key={label} label={label} words={words} />
			))}
		</DetailsCard>
	);
}

function WordGroup({ label, words }: { label: string; words: readonly string[] }) {
	const labelId = useId();
	return (
		<div className="flex flex-col gap-1.5">
			<h3 id={labelId} className="px-1 text-xs font-medium text-muted-foreground">
				{label}
			</h3>
			<ul
				aria-labelledby={labelId}
				className="flex flex-wrap overflow-hidden rounded-xl bg-background-strong shadow-xs"
			>
				{words.map((word) => (
					<li key={word}>
						<PlayableWordCell
							targetAccent={ACCENT}
							word={word}
							className="h-full px-3 py-1.5 text-foreground"
						/>
					</li>
				))}
			</ul>
		</div>
	);
}

export function hasChanges(phonemeId: EnglishPhonemeSymbolId): boolean {
	return getSoundVariants(phonemeId).length > 0 || getMergerNotes(ACCENT, phonemeId).length > 0;
}

/** How the sound shifts with its neighbours, and any vowel merger it is part of. */
export function Changes({ phonemeId }: { phonemeId: EnglishPhonemeSymbolId }) {
	const variants = getSoundVariants(phonemeId);
	const notes = getMergerNotes(ACCENT, phonemeId);
	return (
		<div className="flex flex-col gap-3">
			{variants.length > 0 ? <SoundVariants variants={variants} /> : null}
			{notes.map((note) => (
				<div key={note.id} className="flex flex-col gap-1.5">
					<h3 className="px-1 text-sm font-semibold text-foreground">{note.title}</h3>
					<MergerNote note={note} />
				</div>
			))}
		</div>
	);
}

function SoundVariants({ variants }: { variants: readonly SoundVariant[] }) {
	return (
		<DetailsCard className="p-3">
			<ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl bg-background-strong shadow-xs">
				{variants.map(({ ipa, label, words }) => (
					<li key={ipa} className="flex items-stretch">
						<span className="flex w-16 shrink-0 items-center justify-center border-r border-border font-display text-lg text-foreground">
							/{ipa}/
						</span>
						<div className="flex min-w-0 flex-1 flex-col gap-0.5 py-2">
							<p className="px-3 text-pretty text-sm text-foreground">{label}</p>
							<ul className="flex flex-wrap">
								{words.map((word) => (
									<li key={word}>
										<PlayableWordCell targetAccent={ACCENT} word={word} className="px-3 py-1" />
									</li>
								))}
							</ul>
						</div>
					</li>
				))}
			</ul>
		</DetailsCard>
	);
}

/** The sounds sharing a row or column with this one on the chart, each a link to its page. */
export function SoundFamilies({ phonemeId }: { phonemeId: EnglishPhonemeSymbolId }) {
	const families = getSoundFamilies(phonemeId);
	return (
		<DetailsCard className="flex flex-col gap-3 p-3">
			{families.map(({ label, sounds }) => (
				<FamilyGroup key={label} label={label} sounds={sounds} />
			))}
		</DetailsCard>
	);
}

function FamilyGroup({ label, sounds }: { label: string; sounds: readonly SoundRef[] }) {
	const labelId = useId();
	return (
		<div className="flex flex-col gap-1.5">
			<h3 id={labelId} className="px-1 text-xs font-medium text-muted-foreground">
				{label}
			</h3>
			<ul aria-labelledby={labelId} className="flex flex-wrap gap-1.5">
				{sounds.map((sound) => (
					<li key={sound.id}>
						<Link
							href={sound.path}
							aria-label={`/${sound.ipa}/ ${sound.name}, as in ${sound.word}`}
							className="flex items-baseline gap-1.5 rounded-xl bg-background-strong px-3 py-1.5 text-sm text-muted-foreground shadow-xs transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
						>
							<span className="font-display text-base text-foreground">/{sound.ipa}/</span>
							{sound.word}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}

/** Links to the sounds before and after this one, to walk the list. */
export function PreviousNext({ phonemeId }: { phonemeId: EnglishPhonemeSymbolId }) {
	const { previous, next } = getNeighbourPages(phonemeId);
	return (
		<nav aria-label="Other sounds" className="flex gap-3">
			{previous ? (
				<NeighbourLink sound={previous} direction="previous" />
			) : (
				<span className="flex-1" />
			)}
			{next ? <NeighbourLink sound={next} direction="next" /> : <span className="flex-1" />}
		</nav>
	);
}

function NeighbourLink({ sound, direction }: { sound: SoundRef; direction: "previous" | "next" }) {
	const Arrow = direction === "previous" ? ArrowLeft : ArrowRight;
	return (
		<Link
			href={sound.path}
			rel={direction === "previous" ? "prev" : "next"}
			className={cn(
				"flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-background px-4 py-3 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
				direction === "next" && "flex-row-reverse text-right",
			)}
		>
			<Arrow aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
			<span className="flex min-w-0 flex-col">
				<span className="text-xs text-muted-foreground">
					{direction === "previous" ? "Previous sound" : "Next sound"}
				</span>
				<span className="truncate text-sm text-foreground">
					<span className="font-display">/{sound.ipa}/</span> {sound.name}
				</span>
			</span>
		</Link>
	);
}
