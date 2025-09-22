"use client";

import type { VowelPhoneme } from "shared-data";
import { useIpaChartStore } from "../_store/ipa-chart-store";
import { VowelSymbolButton } from "./vowel-chart";

interface SupplementalVowelGroupProps {
	title: string;
	phonemes: VowelPhoneme[];
}

export function SupplementalVowelGroup({ title, phonemes }: SupplementalVowelGroupProps) {
	const selectPhoneme = useIpaChartStore((s) => s.selectPhoneme);

	if (phonemes.length === 0) {
		return null;
	}

	return (
		<div className="space-y-2">
			<h3 className="text-base font-semibold text-foreground">{title}</h3>
			<div className="flex flex-wrap gap-2">
				{phonemes.map((phoneme) => (
					<VowelSymbolButton key={phoneme.symbol} phoneme={phoneme} onSelect={selectPhoneme} />
				))}
			</div>
		</div>
	);
}
