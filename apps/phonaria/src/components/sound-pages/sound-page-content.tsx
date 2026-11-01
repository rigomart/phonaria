import { type EnglishPhonemeSymbolId, getIpaForPhonemeId } from "@phonaria/phonetics-data";
import { buttonVariants } from "@phonaria/ui/components/button";
import { ArrowLeft } from "lucide-react";
import { type ReactNode, useId } from "react";
import { Link } from "@/components/link";
import { Articulation } from "@/components/phoneme-details/articulation";
import { describeSound, getSpellingPattern } from "@/components/phoneme-details/sound";
import { SoundHeading } from "@/components/phoneme-details/sound-header";
import { SoundTile } from "@/components/phoneme-details/sound-tile";
import { SyntheticVoiceNote } from "@/components/synthetic-voice-note";
import { getAllComparisons, getSoundFamilies, getSoundVariants } from "@/lib/sound-page-content";
import { getSoundExamples, SOUNDS_PATH } from "@/lib/sound-pages";
import { pairSpellings } from "@/lib/spelling-pairs";
import { cn } from "@/lib/utils";
import { SoundComparisons } from "./sound-comparisons";
import {
	Changes,
	CommonWords,
	commonWordGroups,
	FeatureList,
	FrequencyFact,
	hasChanges,
	KeyWords,
	PageSection,
	PreviousNext,
	SoundFamilies,
	Spelling,
} from "./sound-page-blocks";

const ACCENT = "en-us" as const;

/**
 * A sound's own page. On wide screens the sound stays pinned on the left, its
 * symbol, key words and how it's made, while what to tell it apart from, how
 * it's spelled, common words, how it changes and the sounds near it scroll on
 * the right. On a phone the two stack.
 */
export function SoundPageContent({ phonemeId }: { phonemeId: EnglishPhonemeSymbolId }) {
	const titleId = useId();
	const sound = describeSound({ targetAccent: ACCENT, phonemeId, showPageLink: false });
	const groups = commonWordGroups(phonemeId);
	const sections: { title: string; content: ReactNode }[] = [];
	if (getAllComparisons(phonemeId).length > 0) {
		sections.push({ title: "Compare with", content: <SoundComparisons phonemeId={phonemeId} /> });
	}
	if (getSpellingPattern(ACCENT, phonemeId)) {
		sections.push({ title: "Spelling", content: <Spelling phonemeId={phonemeId} /> });
	}
	if (groups.length > 0) {
		sections.push({
			title: `Common words with /${getIpaForPhonemeId(phonemeId)}/`,
			content: <CommonWords groups={groups} />,
		});
	}
	if (hasChanges(phonemeId)) {
		sections.push({ title: "How it changes", content: <Changes phonemeId={phonemeId} /> });
	}
	if (getSoundFamilies(phonemeId).length > 0) {
		sections.push({ title: "Sounds near it", content: <SoundFamilies phonemeId={phonemeId} /> });
	}

	return (
		<div className="flex flex-1 justify-center bg-background">
			<article
				aria-labelledby={titleId}
				data-phoneme-details
				className="flex w-full max-w-6xl flex-col gap-10 p-4 sm:p-6 lg:flex-row lg:items-start"
			>
				<div className="flex flex-col gap-5 rounded-3xl bg-popover p-5 lg:sticky lg:top-18 lg:max-h-[calc(100svh-6rem)] lg:w-96 lg:shrink-0 lg:overflow-y-auto">
					<Link
						href={SOUNDS_PATH}
						className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "-ml-2.5 self-start")}
					>
						<ArrowLeft aria-hidden="true" />
						All sounds
					</Link>
					<header className="flex items-start gap-4">
						<SoundTile ipa={sound.ipa} audioPath={sound.audioPath} />
						<div className="flex min-w-0 flex-col gap-1">
							<SoundHeading sound={sound} titleId={titleId} as="h1" />
							<p className="text-sm text-muted-foreground">{sound.label ?? sound.typeLabel}</p>
						</div>
					</header>
					<KeyWords phonemeId={phonemeId} />
					<section aria-labelledby={`${titleId}-made`} className="flex flex-col gap-3">
						<h2 id={`${titleId}-made`} className="text-sm font-semibold text-foreground">
							How it's made
						</h2>
						<Articulation targetAccent={ACCENT} phonemeId={phonemeId} />
						<FeatureList phonemeId={phonemeId} />
					</section>
					<FrequencyFact phonemeId={phonemeId} />
				</div>
				<div className="raised-surface flex min-w-0 flex-1 flex-col gap-12">
					{sections.map(({ title, content }) => (
						<PageSection key={title} title={title}>
							{content}
						</PageSection>
					))}
					<SyntheticVoiceNote targetAccent={ACCENT} words={pageWords(phonemeId)} />
					<PreviousNext phonemeId={phonemeId} />
				</div>
			</article>
		</div>
	);
}

/** Every word the page can play, for the synthetic-voice note. */
function pageWords(phonemeId: EnglishPhonemeSymbolId): string[] {
	const spelling = getSpellingPattern(ACCENT, phonemeId);
	return [
		...getSoundExamples(phonemeId).map(({ word }) => word),
		...getAllComparisons(phonemeId).flatMap(({ pairs }) => pairs.flatMap(({ words }) => words)),
		...(spelling
			? pairSpellings(spelling).rows.flatMap(({ examples }) => examples.map(({ word }) => word))
			: []),
		...commonWordGroups(phonemeId).flatMap(({ words }) => words),
		...getSoundVariants(phonemeId).flatMap(({ words }) => words),
	];
}
