import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { getIpaForPhonemeId } from "@phonaria/phonetics-data";
import { ChevronRight } from "lucide-react";
import { useId } from "react";
import { Link } from "@/components/link";
import { DetailsCard } from "@/components/phoneme-details/details-section";
import { PlayableWordCell } from "@/components/phoneme-details/playable-word";
import { type DetailSection, getDetailSections } from "@/components/phoneme-details/sections";
import {
	getCommonWords,
	getRelatedSounds,
	getSoundVariants,
	howItsMade,
	type RelatedSound,
	type SoundVariant,
} from "@/lib/sound-page-content";

/** Puts `section` after the last of `ids` the list has, or first when it has none. */
function insertAfter(
	sections: DetailSection[],
	ids: readonly string[],
	section: DetailSection,
): DetailSection[] {
	const index = Math.max(...ids.map((id) => sections.findIndex((s) => s.id === id)));
	return [...sections.slice(0, index + 1), section, ...sections.slice(index + 1)];
}

/**
 * The drawer's sections plus what only the page shows: a sentence on how a
 * consonant is made, related sounds after Compare with, and common words
 * and sound variants after Spelling.
 */
export function getSoundPageSections(phonemeId: EnglishPhonemeSymbolId): DetailSection[] {
	let sections = getDetailSections({ targetAccent: "en-us", phonemeId, showPageLink: false });

	const made = howItsMade(phonemeId);
	if (made) {
		sections = sections.map((section) =>
			section.id === "articulation"
				? {
						...section,
						content: (
							<div className="flex flex-col gap-3">
								{section.content}
								<p className="text-pretty text-sm text-muted-foreground">{made}</p>
							</div>
						),
					}
				: section,
		);
	}

	const related = getRelatedSounds(phonemeId);
	if (related.length > 0) {
		sections = insertAfter(sections, ["articulation", "comparisons"], {
			id: "related",
			title: "Related sounds",
			content: <RelatedSounds sounds={related} />,
		});
	}

	const common = getCommonWords(phonemeId);
	const groups = [
		{ label: "At the start", words: common.start },
		{ label: "Inside", words: common.inside },
		{ label: "At the end", words: common.end },
	].filter(({ words }) => words.length > 0);
	if (groups.length > 0) {
		sections = insertAfter(sections, ["articulation", "comparisons", "related", "spelling"], {
			id: "common-words",
			title: `Common words with /${getIpaForPhonemeId(phonemeId)}/`,
			words: groups.flatMap(({ words }) => words),
			content: <CommonWords groups={groups} />,
		});
	}

	const variants = getSoundVariants(phonemeId);
	if (variants.length > 0) {
		sections = insertAfter(
			sections,
			["articulation", "comparisons", "related", "spelling", "common-words"],
			{
				id: "variants",
				title: "Sound variants",
				words: variants.flatMap(({ words }) => words),
				content: <SoundVariants variants={variants} />,
			},
		);
	}

	return sections;
}

function RelatedSounds({ sounds }: { sounds: readonly RelatedSound[] }) {
	return (
		<ul className="divide-y divide-border overflow-hidden rounded-2xl bg-background">
			{sounds.map(({ id, ipa, name, word, path }) => (
				<li key={id}>
					<Link
						href={path}
						className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset motion-reduce:transition-none"
					>
						<span className="shrink-0 font-display text-lg">/{ipa}/</span>
						<span className="min-w-0 flex-1 text-sm text-muted-foreground">
							{`${name}, as in '${word}'`}
						</span>
						<ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
					</Link>
				</li>
			))}
		</ul>
	);
}

function CommonWords({
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
							targetAccent="en-us"
							word={word}
							className="h-full px-3 py-1.5 text-foreground"
						/>
					</li>
				))}
			</ul>
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
										<PlayableWordCell targetAccent="en-us" word={word} className="px-3 py-1" />
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
