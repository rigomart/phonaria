import type { SpellingPattern, TargetAccent } from "@phonaria/phonetics-data";
import type { ReactNode } from "react";
import { SpelledWord } from "@/components/spelled-word";
import { SyntheticVoiceInfo } from "@/components/synthetic-voice-note";
import { getPhonemeComparisons } from "@/lib/phoneme-comparisons";
import { cn } from "@/lib/utils";
import { PlayableWordCell } from "./playable-word";
import { getSpellingPattern, type PhonemeDetailsOptions } from "./sound";

/**
 * The words the compact card plays: one minimal pair against the sound's
 * first contrast, or, for a sound without one, its first example words.
 */
export type CardWords =
	| { kind: "pair"; partnerIpa: string; words: readonly [own: string, partner: string] }
	| { kind: "examples"; examples: SpellingPattern["examples"] };

const EXAMPLE_LIMIT = 3;

/** Null when the host switches both off (Practice) or the sound has neither. */
export function getCardWords({
	targetAccent,
	phonemeId,
	showComparisons = true,
	showSpellings = true,
}: PhonemeDetailsOptions): CardWords | null {
	const comparison = showComparisons ? getPhonemeComparisons(targetAccent, phonemeId, 1)[0] : null;
	const pair = comparison?.pairs[0];
	if (comparison && pair) {
		return { kind: "pair", partnerIpa: comparison.partnerIpa, words: pair.words };
	}
	const examples = showSpellings
		? getSpellingPattern(targetAccent, phonemeId)?.examples.slice(0, EXAMPLE_LIMIT)
		: undefined;
	return examples?.length ? { kind: "examples", examples } : null;
}

/**
 * The card's words as play buttons under a label ("Compare with /t/" or "Hear
 * it in"), with the synthetic-voice note folded into an info mark beside it.
 */
export function CardWordList({
	targetAccent,
	ipa,
	cardWords,
}: {
	targetAccent: TargetAccent;
	/** This sound's symbol, beside its word of the pair. */
	ipa: string;
	cardWords: CardWords;
}) {
	const words =
		cardWords.kind === "pair" ? cardWords.words : cardWords.examples.map(({ word }) => word);

	return (
		<div className="flex flex-col gap-2">
			<div className="flex min-h-6 items-center justify-between gap-2">
				<p className="text-xs font-medium text-muted-foreground">
					{cardWords.kind === "pair" ? (
						<>
							Compare with{" "}
							<span className="font-display text-base whitespace-nowrap text-foreground">
								/{cardWords.partnerIpa}/
							</span>
						</>
					) : (
						"Hear it in"
					)}
				</p>
				<SyntheticVoiceInfo targetAccent={targetAccent} words={words} />
			</div>
			<ul
				aria-label={
					cardWords.kind === "pair" ? `/${ipa}/ versus /${cardWords.partnerIpa}/` : undefined
				}
				className="flex flex-col gap-1.5"
			>
				{cardWords.kind === "pair" ? (
					<>
						<WordCell targetAccent={targetAccent} word={cardWords.words[0]} own>
							<PairWord word={cardWords.words[0]} ipa={ipa} />
						</WordCell>
						<WordCell targetAccent={targetAccent} word={cardWords.words[1]}>
							<PairWord word={cardWords.words[1]} ipa={cardWords.partnerIpa} />
						</WordCell>
					</>
				) : (
					cardWords.examples.map(({ word, spelled }) => (
						<WordCell key={word} targetAccent={targetAccent} word={word} own>
							<SpelledWord spelled={spelled} />
						</WordCell>
					))
				)}
			</ul>
		</div>
	);
}

function WordCell({
	targetAccent,
	word,
	own = false,
	children,
}: {
	targetAccent: TargetAccent;
	word: string;
	own?: boolean;
	children: ReactNode;
}) {
	return (
		<li>
			<PlayableWordCell
				targetAccent={targetAccent}
				word={word}
				className={cn(
					"w-full justify-between rounded-lg px-3 py-2",
					own ? "bg-secondary text-foreground" : "border",
				)}
			>
				{children}
			</PlayableWordCell>
		</li>
	);
}

function PairWord({ word, ipa }: { word: string; ipa: string }) {
	return (
		<span className="flex items-baseline gap-2">
			{word}
			<span className="font-display text-xs text-muted-foreground">/{ipa}/</span>
		</span>
	);
}
