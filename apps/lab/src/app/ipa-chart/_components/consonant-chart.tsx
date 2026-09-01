"use client";

import {
	type ConsonantArticulation,
	type ConsonantSymbolId,
	getConsonantArticulationRegistryForLanguage,
	getIpaForPhonemeId,
	getLanguagePhonemeIds,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { Fragment, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
	getCellKey,
	MANNER_LABELS,
	MANNER_ORDER,
	type MannerOfArticulation,
	PLACE_LABELS,
	PLACE_ORDER,
	type PlaceOfArticulation,
} from "../_lib/consonant-grid";
import { ConsonantPairCard, type ConsonantPhoneme } from "./consonant-pair-card";

function getConsonantPhonemes(targetAccent: TargetAccent): ConsonantPhoneme[] {
	const consonantArticulations: Partial<Record<ConsonantSymbolId, ConsonantArticulation>> =
		getConsonantArticulationRegistryForLanguage(targetAccent);
	const consonantIds = getLanguagePhonemeIds(targetAccent, "consonants");
	const phonemes: ConsonantPhoneme[] = [];

	for (const phonemeId of consonantIds) {
		const articulation = consonantArticulations[phonemeId];
		if (!articulation) throw new Error(`Missing consonant articulation for ${phonemeId}`);
		const ipa = getIpaForPhonemeId(phonemeId);

		phonemes.push({
			id: phonemeId as ConsonantSymbolId,
			symbol: ipa,
			voicing: articulation.features.voicing,
			manner: articulation.features.manner,
			place: articulation.features.place,
		});
	}

	return phonemes;
}

export function ConsonantChart({ targetAccent }: { targetAccent: TargetAccent }) {
	const consonants = useMemo(() => getConsonantPhonemes(targetAccent), [targetAccent]);

	const { cells, mannerOrder, placeOrder } = useMemo(() => {
		const map = new Map<string, { voiceless?: ConsonantPhoneme; voiced?: ConsonantPhoneme }>();
		const usedManners = new Set<MannerOfArticulation>();
		const usedPlaces = new Set<PlaceOfArticulation>();

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
			usedManners.add(manner);
			usedPlaces.add(place);
		}

		return {
			cells: map,
			mannerOrder: MANNER_ORDER.filter((m) => usedManners.has(m)),
			placeOrder: PLACE_ORDER.filter((p) => usedPlaces.has(p)),
		};
	}, [consonants]);

	const gridTemplateColumns = `auto repeat(${placeOrder.length}, minmax(4.5rem, 1fr))`;

	return (
		<div className="inline-grid w-full min-w-max gap-1.5" style={{ gridTemplateColumns }}>
			<div />
			{placeOrder.map((place) => (
				<div
					key={place}
					className="px-1.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
				>
					{PLACE_LABELS[place]}
				</div>
			))}

			{mannerOrder.map((manner) => (
				<Fragment key={manner}>
					<div className="flex items-center justify-end pr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						{MANNER_LABELS[manner]}
					</div>
					{placeOrder.map((place) => {
						const key = getCellKey(manner, place);
						const cell = cells.get(key);
						const hasPhonemes = cell && (cell.voiceless || cell.voiced);

						return (
							<div
								key={place}
								className={cn(
									"flex min-h-16 items-center justify-center rounded-lg border p-2 transition-all duration-100",
									hasPhonemes ? "bg-card hover:bg-muted" : "border-border/50",
								)}
							>
								{hasPhonemes ? (
									<ConsonantPairCard
										targetAccent={targetAccent}
										voiceless={cell.voiceless}
										voiced={cell.voiced}
									/>
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
