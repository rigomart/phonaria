import type { SpellingPattern, TargetAccent } from "@phonaria/phonetics-data";
import { SpelledWord } from "@/components/spelled-word";
import { pairSpellings } from "@/lib/spelling-pairs";
import { DetailsCard } from "./details-section";
import { PlayableWordCell } from "./playable-word";

/**
 * How the sound is written: each spelling beside the example words that use
 * it, with the letters that spell the sound marked (t, top; -ed, jumped).
 * Words with a recording play when clicked.
 * Spellings the data has no word for close the list.
 */
export function SpellingPatterns({
	targetAccent,
	spelling,
}: {
	targetAccent: TargetAccent;
	spelling: SpellingPattern;
}) {
	const { rows, unpaired } = pairSpellings(spelling);

	return (
		<DetailsCard className="flex flex-col gap-3 p-3">
			<ul
				aria-label="Spellings with example words"
				className="flex flex-col divide-y divide-border overflow-hidden rounded-xl bg-background-strong shadow-xs"
			>
				{rows.map(({ pattern, examples }) => (
					<li key={pattern ?? examples[0].word} className="flex items-stretch">
						<span className="flex w-14 shrink-0 items-center justify-center border-r border-border font-display text-base font-semibold text-foreground">
							{pattern}
						</span>
						<ul className="flex min-w-0 flex-1 flex-wrap">
							{examples.map((example) => (
								<li key={example.word}>
									<PlayableWordCell
										targetAccent={targetAccent}
										word={example.word}
										className="h-full px-3 py-1.5 text-foreground"
									>
										<SpelledWord
											spelled={example.spelled}
											markClassName="underline decoration-2 underline-offset-4"
										/>
									</PlayableWordCell>
								</li>
							))}
						</ul>
					</li>
				))}
			</ul>
			{unpaired.length > 0 ? (
				<p className="flex flex-wrap items-center gap-2 px-1 text-xs text-muted-foreground">
					Also spelled
					{unpaired.map((pattern) => (
						<span
							key={pattern}
							className="rounded-full border border-border px-2.5 py-0.5 font-display text-sm text-muted-foreground"
						>
							{pattern}
						</span>
					))}
				</p>
			) : null}
		</DetailsCard>
	);
}
