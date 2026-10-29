import {
	formatPhonemeLabel,
	type LanguagePhonemeId,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SpelledWord } from "@/components/spelled-word";
import { flags } from "@/lib/flags";
import type { PhonemeComparison } from "@/lib/phoneme-comparisons";
import { MinimalPairActivity } from "@/lib/practice/minimal-pair-activity";
import { DetailsCard } from "./details-section";
import { PlayableWordCell } from "./playable-word";

/**
 * Similar sounds, a card each, titled by that sound. Its minimal pairs sit
 * below as rows, this sound's word on the left and the other's on the right,
 * with the letters that differ marked. This sound's words are raised and the
 * other's outlined, so which side is which shows without a label. With
 * speaking practice on, each card links to that pair of sounds there.
 */
export function ComparisonList({
	targetAccent,
	ipa,
	comparisons,
}: {
	targetAccent: TargetAccent;
	/** This sound's symbol, for the label read aloud. */
	ipa: string;
	comparisons: readonly PhonemeComparison[];
}) {
	const practise = targetAccent === MinimalPairActivity.targetAccent && flags.isEnabled("speech");
	return (
		<div className="flex flex-col gap-2">
			{comparisons.map(({ contrastId, partnerId, partnerIpa, pairs }) => {
				const partnerName = formatPhonemeLabel(
					targetAccent,
					partnerId as LanguagePhonemeId<TargetAccent>,
				);
				return (
					<DetailsCard key={contrastId} className="flex flex-col gap-3 p-3">
						<p className="flex items-baseline gap-2 px-1">
							<span className="font-display text-xl leading-none">/{partnerIpa}/</span>
							<span className="truncate text-xs text-muted-foreground">{partnerName}</span>
						</p>
						<ul aria-label={`/${ipa}/ versus /${partnerIpa}/`} className="flex flex-col gap-1.5">
							{pairs.map(({ words: [own, partner] }) => (
								<li key={`${own}-${partner}`} className="grid grid-cols-2 gap-2">
									<PlayableWordCell
										targetAccent={targetAccent}
										word={own}
										className="justify-center rounded-lg bg-background-strong px-2 py-1.5 text-foreground shadow-xs"
									>
										<SpelledWord spelled={markDifference(own, partner)} />
									</PlayableWordCell>
									<PlayableWordCell
										targetAccent={targetAccent}
										word={partner}
										className="justify-center rounded-lg border border-border px-2 py-1.5"
									>
										<SpelledWord spelled={markDifference(partner, own)} />
									</PlayableWordCell>
								</li>
							))}
						</ul>
						{practise ? (
							<Link
								className="flex items-center gap-1 self-start rounded-sm px-1 text-muted-foreground text-xs transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
								search={{ contrast: contrastId }}
								to={MinimalPairActivity.path}
							>
								Practise saying /{ipa}/ and /{partnerIpa}/
								<ArrowRight aria-hidden="true" className="size-3" />
							</Link>
						) : null}
					</DetailsCard>
				);
			})}
		</div>
	);
}

/** Brackets the letters `word` doesn't share with `other` at either end: hot, hat → "h[o]t". */
function markDifference(word: string, other: string): string {
	let start = 0;
	while (start < word.length && start < other.length && word[start] === other[start]) start++;
	let end = 0;
	while (
		end < word.length - start &&
		end < other.length - start &&
		word[word.length - 1 - end] === other[other.length - 1 - end]
	) {
		end++;
	}
	const changed = word.slice(start, word.length - end);
	return changed ? `${word.slice(0, start)}[${changed}]${word.slice(word.length - end)}` : word;
}
