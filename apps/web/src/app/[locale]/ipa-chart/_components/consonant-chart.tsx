"use client";

import type { ConsonantSymbolId, TargetLanguage } from "@phonaria/phonetics-data";
import {
	getConsonantArticulationRegistryForLanguage,
	getIpaForPhonemeId,
	getLanguagePhonemeIds,
} from "@phonaria/phonetics-data";
import { Fragment, useMemo } from "react";
import { usePhonemeDetailsCopy } from "@/data/phoneme-details/client";
import { cn } from "@/lib/utils";
import {
	getCellKey,
	MANNER_ORDER,
	type MannerOfArticulation,
	PLACE_ORDER,
	type PlaceOfArticulation,
	type Voicing,
} from "../_lib/consonant-grid";
import { ConsonantPairCard } from "./consonant-pair-card";

interface ConsonantPhoneme {
	id: ConsonantSymbolId;
	symbol: string;
	voicing: Voicing;
	manner: MannerOfArticulation;
	place: PlaceOfArticulation;
}

function getEnglishConsonantPhonemes(): ConsonantPhoneme[] {
	const consonantArticulations = getConsonantArticulationRegistryForLanguage("en");
	const consonantIds = getLanguagePhonemeIds("en", "consonants");
	const phonemes: ConsonantPhoneme[] = [];

	for (const phonemeId of consonantIds) {
		const articulation = consonantArticulations[phonemeId];
		const ipa = getIpaForPhonemeId(phonemeId);

		phonemes.push({
			id: phonemeId,
			symbol: ipa,
			voicing: articulation.features.voicing,
			manner: articulation.features.manner,
			place: articulation.features.place,
		});
	}

	return phonemes;
}

function getSpanishConsonantPhonemes(): ConsonantPhoneme[] {
	const consonantArticulations = getConsonantArticulationRegistryForLanguage("es");
	const consonantIds = getLanguagePhonemeIds("es", "consonants");
	const phonemes: ConsonantPhoneme[] = [];

	for (const phonemeId of consonantIds) {
		const articulation = consonantArticulations[phonemeId];
		const ipa = getIpaForPhonemeId(phonemeId);

		phonemes.push({
			id: phonemeId,
			symbol: ipa,
			voicing: articulation.features.voicing,
			manner: articulation.features.manner,
			place: articulation.features.place,
		});
	}

	return phonemes;
}

function getConsonantPhonemesForLanguage(targetLanguage: TargetLanguage): ConsonantPhoneme[] {
	if (targetLanguage === "en") {
		return getEnglishConsonantPhonemes();
	}
	return getSpanishConsonantPhonemes();
}

export function ConsonantChart({ targetLanguage }: { targetLanguage: TargetLanguage }) {
	const { featureDefinitions } = usePhonemeDetailsCopy();
	const consonants = useMemo(
		() => getConsonantPhonemesForLanguage(targetLanguage),
		[targetLanguage],
	);

	const cells = useMemo(() => {
		const map = new Map<string, { voiceless?: ConsonantPhoneme; voiced?: ConsonantPhoneme }>();

		for (const phoneme of consonants) {
			const { manner, place, voicing } = phoneme;
			const key = getCellKey(manner, place);
			const current = map.get(key) ?? {};

			if (voicing === "voiceless") {
				current.voiceless = phoneme;
			} else {
				current.voiced = phoneme;
			}

			map.set(key, current);
		}

		return map;
	}, [consonants]);

	const gridTemplateColumns = `auto repeat(${PLACE_ORDER.length}, minmax(4.5rem, 1fr))`;

	return (
		<div className="inline-grid w-full min-w-max gap-1.5" style={{ gridTemplateColumns }}>
			<div />
			{PLACE_ORDER.map((place) => (
				<div
					key={place}
					className="px-1.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
				>
					{featureDefinitions.place.values[place].label}
				</div>
			))}

			{MANNER_ORDER.map((manner) => (
				<Fragment key={manner}>
					<div className="flex items-center justify-end pr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						{featureDefinitions.manner.values[manner].label}
					</div>
					{PLACE_ORDER.map((place) => {
						const key = getCellKey(manner, place);
						const cell = cells.get(key);
						const hasPhonemes = cell && (cell.voiceless || cell.voiced);

						return (
							<div
								key={place}
								className={cn(
									"flex min-h-16 items-center justify-center rounded-lg border p-2 transition-all duration-100",
									hasPhonemes ? "bg-card/50 hover:bg-primary/10" : "border-border/50",
								)}
							>
								{hasPhonemes ? (
									<ConsonantPairCard voiceless={cell.voiceless} voiced={cell.voiced} />
								) : (
									<div className="text-muted-foreground/10 text-xl font-bold select-none">-</div>
								)}
							</div>
						);
					})}
				</Fragment>
			))}
		</div>
	);
}
