"use client";

import {
	ConsonantArticulationRegistry,
	ConsonantSymbolRegistry,
	DiphthongSymbolRegistry,
	DiphthongVowelArticulationRegistry,
	MonophthongSymbolRegistry,
	MonophthongVowelArticulationRegistry,
	type PhonemeSymbolId,
} from "shared-data";

type PreviewVowel = {
	id: PhonemeSymbolId;
	symbol: string;
	rounded: boolean;
};

type PreviewConsonant = {
	id: PhonemeSymbolId;
	symbol: string;
	voiced: boolean;
};

const MAX_PREVIEW_VOWELS = 12;
const MAX_PREVIEW_CONSONANTS = 18;

// Use vowels from registries (monophthongs + diphthongs), limited for preview
const PREVIEW_VOWELS: PreviewVowel[] = [
	...Object.entries(MonophthongSymbolRegistry).map(([id, symbol]) => {
		const articulation =
			MonophthongVowelArticulationRegistry[id as keyof typeof MonophthongVowelArticulationRegistry];
		return {
			id: id as PhonemeSymbolId,
			symbol: symbol.ipa,
			rounded: articulation.features.roundness === "rounded",
		};
	}),
	...Object.entries(DiphthongSymbolRegistry).map(([id, symbol]) => {
		const articulation =
			DiphthongVowelArticulationRegistry[id as keyof typeof DiphthongVowelArticulationRegistry];
		return {
			id: id as PhonemeSymbolId,
			symbol: symbol.ipa,
			rounded: articulation.features.roundness === "rounded",
		};
	}),
].slice(0, MAX_PREVIEW_VOWELS);

// Use consonants from registry, limited for preview
const PREVIEW_CONSONANTS: PreviewConsonant[] = Object.entries(ConsonantSymbolRegistry)
	.map(([id, symbol]) => {
		const articulation =
			ConsonantArticulationRegistry[id as keyof typeof ConsonantArticulationRegistry];
		return {
			id: id as PhonemeSymbolId,
			symbol: symbol.ipa,
			voiced: articulation.features.voicing === "voiced",
		};
	})
	.slice(0, MAX_PREVIEW_CONSONANTS);

export function IpaChartPreviewStatic() {
	return (
		<div className="w-full h-full space-y-3 select-none flex flex-col min-h-0">
			{/* Vowels Section */}
			<div className="rounded-xl bg-background-soft p-2 sm:p-3 shadow-sm space-y-3 flex-1 flex flex-col min-h-0">
				<div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap shrink-0">
					<div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-muted-foreground">
						<div className="flex items-center gap-1 sm:gap-1.5">
							<span className="size-2.5 sm:size-3 rounded-full border border-primary" />
							<span>Unrounded</span>
						</div>
						<div className="flex items-center gap-1 sm:gap-1.5">
							<span className="size-2.5 sm:size-3 rounded-full bg-primary" />
							<span>Rounded</span>
						</div>
					</div>
				</div>
				<div className="relative flex-1 bg-background/50 rounded-lg border border-border/30 flex items-center justify-center min-h-0">
					<div className="flex flex-wrap gap-2 items-center justify-center px-2">
						{PREVIEW_VOWELS.map((v) => (
							<button
								key={v.id}
								type="button"
								className={`size-6 sm:size-9 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
									v.rounded
										? "border-transparent bg-primary text-primary-foreground"
										: "border-primary bg-background text-foreground"
								}`}
								disabled
							>
								{v.symbol}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Consonants Section */}
			<div className="space-y-3 rounded-xl bg-background-soft shadow-sm p-2 sm:p-3 flex-1 flex flex-col min-h-0">
				<div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap shrink-0">
					<div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-muted-foreground">
						<div className="flex items-center gap-1 sm:gap-1.5">
							<span className="size-2.5 sm:size-3 rounded border border-border bg-background opacity-80" />
							<span>Voiceless</span>
						</div>
						<div className="flex items-center gap-1 sm:gap-1.5">
							<span className="size-2.5 sm:size-3 rounded border border-primary/20 bg-primary/5 font-semibold" />
							<span>Voiced</span>
						</div>
					</div>
				</div>
				<div className="flex flex-wrap gap-1.5 flex-1 items-start content-start">
					{PREVIEW_CONSONANTS.map((c) => (
						<div
							key={c.id}
							className={`size-8 flex items-center justify-center rounded-lg border text-sm font-medium ${
								c.voiced
									? "border-primary/20 bg-primary/5"
									: "border-border bg-background opacity-80"
							}`}
						>
							{c.symbol}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
