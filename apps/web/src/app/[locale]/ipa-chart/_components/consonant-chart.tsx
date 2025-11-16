"use client";

import { Fragment, useMemo } from "react";
import type { ConsonantSymbolId } from "shared-data";
import { ConsonantArticulationRegistry, ConsonantSymbolRegistry } from "shared-data";
import { cn } from "@/lib/utils";
import {
	getCellKey,
	MANNER_LABELS,
	MANNER_ORDER,
	type MannerOfArticulation,
	PLACE_LABELS,
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

export function ConsonantChart() {
	const consonants = useMemo(() => {
		const phonemes: ConsonantPhoneme[] = [];

		for (const [id, articulation] of Object.entries(ConsonantArticulationRegistry)) {
			const symbolEntry = ConsonantSymbolRegistry[id as keyof typeof ConsonantSymbolRegistry];
			if (!symbolEntry) continue;

			phonemes.push({
				id: id as ConsonantSymbolId,
				symbol: symbolEntry.ipa,
				voicing: articulation.features.voicing,
				manner: articulation.features.manner,
				place: articulation.features.place,
			});
		}

		return phonemes;
	}, []);

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

	return (
		<div className="space-y-4">
			<div className="rounded-md border border-dashed border-muted-foreground/40 bg-card/80 px-3 py-2 text-xs text-muted-foreground">
				Consonants organized by how and where they are produced. Voiceless sounds appear lighter,
				voiced sounds are emphasized. Select any symbol for details.
			</div>
			<div className="overflow-x-auto">
				<div className="inline-grid w-full min-w-max gap-1.5 grid-cols-[auto_repeat(10,minmax(4.5rem,1fr))]">
					<div />
					{PLACE_ORDER.map((place) => (
						<div
							key={place}
							className="px-1.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
						>
							{PLACE_LABELS[place]}
						</div>
					))}

					{MANNER_ORDER.map((manner) => (
						<Fragment key={manner}>
							<div className="flex items-center justify-end pr-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								{MANNER_LABELS[manner]}
							</div>
							{PLACE_ORDER.map((place) => {
								const key = getCellKey(manner, place);
								const cell = cells.get(key);
								const hasPhonemes = cell && (cell.voiceless || cell.voiced);

								return (
									<div
										key={place}
										className={cn(
											"flex min-h-[4rem] items-center justify-center rounded-lg border px-2 py-1.5 transition-all duration-100",
											hasPhonemes ? "bg-card/50 hover:bg-primary/10" : "border-border/50",
										)}
									>
										{hasPhonemes ? (
											<ConsonantPairCard voiceless={cell.voiceless} voiced={cell.voiced} />
										) : (
											<div className="text-muted-foreground/30 text-lg">•</div>
										)}
									</div>
								);
							})}
						</Fragment>
					))}
				</div>
			</div>
		</div>
	);
}
