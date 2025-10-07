"use client";

import { Fragment, useMemo } from "react";
import type { VowelPhoneme } from "shared-data";
import { cn } from "@/lib/utils";
import {
	FRONTNESS_LABELS,
	FRONTNESS_ORDER,
	getCellKey,
	HEIGHT_LABELS,
	HEIGHT_ORDER,
} from "../_lib/vowel-grid";
import { PhonemeCard } from "./phoneme-card";

interface VowelChartProps {
	vowels: VowelPhoneme[];
}

export function VowelChart({ vowels }: VowelChartProps) {
	const monophthongs = useMemo(
		() => vowels.filter((phoneme) => phoneme.type === "monophthong"),
		[vowels],
	);

	const cells = useMemo(() => {
		const map = new Map<string, VowelPhoneme[]>();

		for (const phoneme of monophthongs) {
			const { height, frontness } = phoneme.articulation;
			const key = getCellKey(height, frontness);
			const current = map.get(key) ?? [];
			current.push(phoneme);
			map.set(key, current);
		}

		return map;
	}, [monophthongs]);

	return (
		<div className="overflow-x-auto">
			<div className="inline-grid w-full min-w-max gap-1.5 grid-cols-[auto_repeat(5,minmax(4.25rem,1fr))]">
				<div />
				{FRONTNESS_ORDER.map((frontness) => (
					<div
						key={frontness}
						className="px-1.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
					>
						{FRONTNESS_LABELS[frontness]}
					</div>
				))}

				{HEIGHT_ORDER.map((height) => (
					<Fragment key={height}>
						<div className="flex items-center justify-end pr-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							{HEIGHT_LABELS[height]}
						</div>
						{FRONTNESS_ORDER.map((frontness) => {
							const key = `${height}-${frontness}`;
							const phonemes = cells.get(key) ?? [];

							return (
								<div
									key={frontness}
									className={cn(
										"flex min-h-[3.25rem] flex-wrap items-center justify-center gap-1.5 rounded-md border border-border/60 bg-card/40 px-2 py-1.5",
										phonemes.length === 0 && "opacity-45",
									)}
								>
									{phonemes.map((phoneme) => (
										<PhonemeCard key={phoneme.symbol} phoneme={phoneme} />
									))}
								</div>
							);
						})}
					</Fragment>
				))}
			</div>
		</div>
	);
}
