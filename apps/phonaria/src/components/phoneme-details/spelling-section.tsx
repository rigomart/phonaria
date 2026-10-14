import {
	getSpellingPatternRegistryForLanguage,
	type LanguagePhonemeId,
	type SpellingPattern,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { Fragment } from "react";
import { SpelledWord } from "@/components/spelled-word";
import { DetailsSection } from "./details-section";

const SPELLING_EXAMPLE_COUNT = 2;

export function SpellingSection({
	targetAccent,
	phonemeId,
}: {
	targetAccent: TargetAccent;
	phonemeId: LanguagePhonemeId<TargetAccent>;
}) {
	const registry = getSpellingPatternRegistryForLanguage(targetAccent) as Partial<
		Record<LanguagePhonemeId<TargetAccent>, SpellingPattern>
	> | null;
	const spelling = registry?.[phonemeId];
	if (!spelling) return null;

	return (
		<DetailsSection title="Spelling">
			<div className="flex flex-col gap-3 rounded-2xl bg-background p-4">
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
			</div>
		</DetailsSection>
	);
}
