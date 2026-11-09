import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { OTHER_SPELLINGS_BELOW_PERCENTAGE } from "@phonaria/phonetics-data/data/en/spelling-shares";
import { useId } from "react";
import { DetailsCard } from "@/components/phoneme-details/details-section";
import { PlayableWordCell } from "@/components/phoneme-details/playable-word";
import { SpelledWord } from "@/components/spelled-word";
import { formatPercentage } from "@/lib/phoneme-frequency";
import { getRankedSpellings } from "@/lib/spelling-shares";

const ACCENT = "en-us" as const;
const MARK = "underline decoration-2 underline-offset-4";

/**
 * Every common way the sound is spelled, most common first, with its share of
 * the sound in everyday speech and words that play; then rarer spellings.
 */
export function SpellingShares({ phonemeId }: { phonemeId: EnglishPhonemeSymbolId }) {
	const { ranked, other } = getRankedSpellings(phonemeId);
	const otherId = useId();
	return (
		<DetailsCard className="flex flex-col gap-3 p-3">
			<ul
				aria-label="Spellings, most common first"
				className="flex flex-col divide-y divide-border overflow-hidden rounded-xl bg-background-strong shadow-xs"
			>
				{ranked.map(({ spelling, percentage, examples }) => (
					<li key={spelling} className="flex items-stretch">
						<span className="flex w-18 shrink-0 flex-col items-center justify-center border-r border-border py-1.5">
							<span className="font-display text-base font-semibold text-foreground">
								{spelling}
							</span>
							<span className="text-xs tabular-nums text-muted-foreground">
								{formatPercentage(percentage)}
							</span>
						</span>
						<ul className="flex min-w-0 flex-1 flex-wrap items-center">
							{examples.map(({ word, spelled }) => (
								<li key={word} className="self-stretch">
									<PlayableWordCell
										targetAccent={ACCENT}
										word={word}
										className="h-full px-3 py-1.5 text-foreground"
									>
										<SpelledWord spelled={spelled} markClassName={MARK} />
									</PlayableWordCell>
								</li>
							))}
						</ul>
					</li>
				))}
			</ul>
			{other.length > 0 ? (
				<div className="flex flex-col gap-1.5">
					<h3 id={otherId} className="px-1 text-xs font-medium text-muted-foreground">
						{`Rarer spellings, under ${OTHER_SPELLINGS_BELOW_PERCENTAGE}% each`}
					</h3>
					<ul aria-labelledby={otherId} className="flex flex-wrap gap-1.5">
						{other.map(({ spelling, examples: [example] }) => (
							<li
								key={spelling}
								className="flex items-stretch overflow-hidden rounded-xl bg-background-strong shadow-xs"
							>
								<span className="flex items-center border-r border-border px-2.5 font-display text-sm font-semibold text-foreground">
									{spelling}
								</span>
								{example ? (
									<PlayableWordCell
										targetAccent={ACCENT}
										word={example.word}
										className="h-full px-2.5 py-1 text-foreground"
									>
										<SpelledWord spelled={example.spelled} markClassName={MARK} />
									</PlayableWordCell>
								) : null}
							</li>
						))}
					</ul>
				</div>
			) : null}
		</DetailsCard>
	);
}
