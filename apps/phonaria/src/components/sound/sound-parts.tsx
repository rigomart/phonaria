"use client";

import {
	getIpaForPhonemeId,
	getPhonemeArticulationRegistryForLanguage,
	getSpellingPatternRegistryForLanguage,
	type LanguagePhonemeId,
	type PhonemeArticulation,
	type PhonemeSymbolId,
	type SpellingPattern,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { Fragment } from "react";
import { SpelledWord } from "@/components/spelled-word";
import { cn } from "@/lib/utils";

export function getPhonemeArticulation<TLanguage extends TargetAccent>(
	targetAccent: TLanguage,
	phonemeId: LanguagePhonemeId<TLanguage>,
): PhonemeArticulation {
	const registry = getPhonemeArticulationRegistryForLanguage(targetAccent) as Record<
		LanguagePhonemeId<TLanguage>,
		PhonemeArticulation
	>;
	return registry[phonemeId];
}

export function getSpellingPattern(
	targetAccent: TargetAccent,
	phonemeId: LanguagePhonemeId<TargetAccent>,
): SpellingPattern | undefined {
	const registry = getSpellingPatternRegistryForLanguage(targetAccent) as Partial<
		Record<LanguagePhonemeId<TargetAccent>, SpellingPattern>
	> | null;
	return registry?.[phonemeId];
}

/** `/t/`, with the slashes muted so the symbol itself reads first. */
export function SoundSymbol({
	phonemeId,
	className,
}: {
	phonemeId: PhonemeSymbolId;
	className?: string;
}) {
	return (
		<span className={cn("inline-flex items-baseline gap-0.5 font-medium", className)}>
			<span aria-hidden="true" className="text-muted-foreground/50">
				/
			</span>
			<span>{getIpaForPhonemeId(phonemeId)}</span>
			<span aria-hidden="true" className="text-muted-foreground/50">
				/
			</span>
		</span>
	);
}

/** The first `count` example words, with the letters that spell the sound emphasized. */
export function SpellingExamples({
	spelling,
	count,
}: {
	spelling: SpellingPattern;
	count?: number;
}) {
	return spelling.examples.slice(0, count).map((example, index) => (
		<Fragment key={example.word}>
			{index > 0 && ", "}
			<SpelledWord spelled={example.spelled} />
		</Fragment>
	));
}
