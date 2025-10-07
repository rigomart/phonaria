"use client";

import type { VowelPhoneme } from "shared-data";
import { PhonemeCard } from "./phoneme-card";

interface SupplementalVowelGroupProps {
	title: string;
	phonemes: VowelPhoneme[];
}

export function SupplementalVowelGroup({ title, phonemes }: SupplementalVowelGroupProps) {
	if (phonemes.length === 0) {
		return null;
	}

	return (
		<section className="space-y-2">
			<header className="flex items-center justify-between">
				<h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
				<span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
					{phonemes.length}
				</span>
			</header>
			<div className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,max-content))] justify-start gap-2">
				{phonemes.map((phoneme) => (
					<PhonemeCard key={phoneme.symbol} phoneme={phoneme} />
				))}
			</div>
		</section>
	);
}
