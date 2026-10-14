import type { SpellingPattern } from "@phonaria/phonetics-data";
import { Fragment } from "react";
import { SpelledWord } from "@/components/spelled-word";
import { DetailsCard } from "./details-section";

const SPELLING_EXAMPLE_COUNT = 2;

/** The letters that commonly spell the sound, with example words. */
export function SpellingPatterns({ spelling }: { spelling: SpellingPattern }) {
	return (
		<DetailsCard className="flex flex-col gap-3">
			<ul aria-label="Common spellings" className="flex flex-wrap gap-1.5">
				{spelling.patterns.map((pattern) => (
					<li
						key={pattern}
						className="rounded-full bg-background-strong px-3 py-1 text-sm font-medium text-foreground"
					>
						{pattern}
					</li>
				))}
			</ul>
			<p className="text-sm text-muted-foreground">
				As in{" "}
				{spelling.examples.slice(0, SPELLING_EXAMPLE_COUNT).map((example, index) => (
					<Fragment key={example.word}>
						{index > 0 && ", "}
						<SpelledWord spelled={example.spelled} />
					</Fragment>
				))}
			</p>
		</DetailsCard>
	);
}
