import type { SpellingPattern } from "@phonaria/phonetics-data";
import { Fragment } from "react";
import { SpelledWord } from "@/components/spelled-word";
import { pairSpellings } from "@/lib/spelling-pairs";
import { DetailsCard } from "./details-section";

/**
 * How the sound is written: each spelling beside the example words that use
 * it, with the letters that spell the sound marked (t, top; -ed, jumped).
 * Spellings the data has no word for close the list.
 */
export function SpellingPatterns({ spelling }: { spelling: SpellingPattern }) {
	const { rows, unpaired } = pairSpellings(spelling);

	return (
		<DetailsCard className="flex flex-col gap-3">
			<ul aria-label="Spellings with example words" className="flex flex-col gap-2">
				{rows.map(({ pattern, examples }) => (
					<li key={pattern ?? examples[0].word} className="flex items-center gap-3">
						{pattern ? <PatternChip pattern={pattern} /> : <span className="min-w-14" />}
						<span className="min-w-0 text-base text-muted-foreground">
							{examples.map((example, index) => (
								<Fragment key={example.word}>
									{index > 0 && ", "}
									<SpelledWord
										spelled={example.spelled}
										markClassName="underline decoration-2 underline-offset-4"
									/>
								</Fragment>
							))}
						</span>
					</li>
				))}
			</ul>
			{unpaired.length > 0 ? (
				<p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
					Also spelled
					{unpaired.map((pattern) => (
						<PatternChip key={pattern} pattern={pattern} />
					))}
				</p>
			) : null}
		</DetailsCard>
	);
}

function PatternChip({ pattern }: { pattern: string }) {
	return (
		<span className="min-w-14 shrink-0 rounded-full bg-background-strong px-3 py-1 text-center text-sm font-medium text-foreground">
			{pattern}
		</span>
	);
}
