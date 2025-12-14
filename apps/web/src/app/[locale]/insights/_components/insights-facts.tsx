"use client";

import { cmudictStatsData, getIpaForPhonemeId, getPhonemeCategory } from "@phonaria/phonetics-data";
import { Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";

function getTopPhoneme() {
	const sorted = [...cmudictStatsData.phonemes].sort(
		(a, b) => b.wordCoverage.percentage - a.wordCoverage.percentage,
	);
	const top = sorted[0];
	return {
		phonemeId: top.phonemeId,
		ipa: getIpaForPhonemeId(top.phonemeId) ?? top.phonemeId,
		percentage: top.wordCoverage.percentage,
	};
}

function getTopSyllableCount() {
	const sorted = [...cmudictStatsData.syllables].sort((a, b) => b.percentage - a.percentage);
	const top = sorted[0];
	return {
		count: top.count,
		percentage: top.percentage,
	};
}

function getPhonemeWithHighestDensity() {
	const sorted = [...cmudictStatsData.phonemes]
		.filter((p) => p.averageTokensPerWord > 1)
		.sort((a, b) => b.averageTokensPerWord - a.averageTokensPerWord);
	const top = sorted[0];
	if (!top) return null;
	return {
		phonemeId: top.phonemeId,
		ipa: getIpaForPhonemeId(top.phonemeId) ?? top.phonemeId,
		avgPerWord: top.averageTokensPerWord,
		category: getPhonemeCategory(top.phonemeId),
	};
}

type Fact = {
	key: string;
	text: string;
};

export function InsightsFacts() {
	const t = useTranslations("stats-page.sections.facts");

	const topPhoneme = getTopPhoneme();
	const topSyllable = getTopSyllableCount();
	const densestPhoneme = getPhonemeWithHighestDensity();

	const facts: Fact[] = [
		{
			key: "top-phoneme",
			text: t("top-phoneme", {
				ipa: topPhoneme.ipa,
				percentage: topPhoneme.percentage.toFixed(1),
			}),
		},
		{
			key: "top-syllable",
			text: t("top-syllable", {
				count: topSyllable.count,
				percentage: topSyllable.percentage.toFixed(1),
			}),
		},
	];

	if (densestPhoneme) {
		facts.push({
			key: "densest-phoneme",
			text: t("densest-phoneme", {
				ipa: densestPhoneme.ipa,
				avgPerWord: densestPhoneme.avgPerWord.toFixed(2),
			}),
		});
	}

	return (
		<div className="flex flex-col gap-2">
			{facts.map((fact) => (
				<div key={fact.key} className="flex items-start gap-2 text-sm text-muted-foreground">
					<Lightbulb className="size-4 shrink-0 mt-0.5 text-amber-500" />
					<span>{fact.text}</span>
				</div>
			))}
		</div>
	);
}
