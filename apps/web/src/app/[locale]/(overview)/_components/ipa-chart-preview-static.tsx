"use client";

import { useTranslations } from "next-intl";
import {
	ConsonantArticulationRegistry,
	ConsonantIpaRegistry,
	DiphthongIpaRegistry,
	DiphthongVowelArticulationRegistry,
	MonophthongIpaRegistry,
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

const MAX_PREVIEW_VOWELS = 10;
const MAX_PREVIEW_CONSONANTS = 16;

// Use vowels from registries (monophthongs + diphthongs), limited for preview
const PREVIEW_VOWELS: PreviewVowel[] = [
	...Object.entries(MonophthongIpaRegistry).map(([id, ipa]) => {
		const phonemeId = id as PhonemeSymbolId;
		const articulation =
			MonophthongVowelArticulationRegistry[id as keyof typeof MonophthongVowelArticulationRegistry];
		return {
			id: phonemeId,
			symbol: ipa,
			rounded: articulation.features.roundness === "rounded",
		};
	}),
	...Object.entries(DiphthongIpaRegistry).map(([id, ipa]) => {
		const phonemeId = id as PhonemeSymbolId;
		const articulation =
			DiphthongVowelArticulationRegistry[id as keyof typeof DiphthongVowelArticulationRegistry];
		return {
			id: phonemeId,
			symbol: ipa,
			rounded: articulation.features.roundness === "rounded",
		};
	}),
].slice(0, MAX_PREVIEW_VOWELS);

// Use consonants from registry, limited for preview
const PREVIEW_CONSONANTS: PreviewConsonant[] = Object.entries(ConsonantIpaRegistry)
	.map(([id, ipa]) => {
		const phonemeId = id as PhonemeSymbolId;
		const articulation =
			ConsonantArticulationRegistry[id as keyof typeof ConsonantArticulationRegistry];
		return {
			id: phonemeId,
			symbol: ipa,
			voiced: articulation.features.voicing === "voiced",
		};
	})
	.slice(0, MAX_PREVIEW_CONSONANTS);

export function IpaChartPreviewStatic() {
	const t = useTranslations("overview-page.launchpad.ipa-chart.preview.legend");

	return (
		<div className="w-full h-full space-y-2 select-none flex flex-col min-h-0">
			{/* Vowels Section */}
			<div className="rounded-xl border bg-background-soft p-2 sm:p-3 shadow-sm space-y-3 flex-1 flex flex-col min-h-0">
				<div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap shrink-0">
					<div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
						<div className="flex items-center gap-1">
							<span className="size-2.5 sm:size-3 rounded-full border border-primary" />
							<span>{t("unrounded")}</span>
						</div>
						<div className="flex items-center gap-1">
							<span className="size-2.5 sm:size-3 rounded-full bg-primary" />
							<span>{t("rounded")}</span>
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
			<div className="space-y-3 rounded-xl border bg-background-soft shadow-sm p-2 sm:p-3 flex-1 flex flex-col min-h-0">
				<div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap shrink-0">
					<div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
						<div className="flex items-center gap-1">
							<span className="size-2.5 sm:size-3 rounded border border-border bg-background opacity-80" />
							<span>{t("voiceless")}</span>
						</div>
						<div className="flex items-center gap-1">
							<span className="size-2.5 sm:size-3 rounded border border-primary/20 bg-primary/20 font-semibold" />
							<span>{t("voiced")}</span>
						</div>
					</div>
				</div>
				<div className="flex flex-wrap gap-1.5 flex-1 items-start content-start">
					{PREVIEW_CONSONANTS.map((c) => (
						<div
							key={c.id}
							className={`size-8 flex items-center justify-center rounded-lg border text-sm font-medium ${
								c.voiced
									? "border-primary/20 bg-primary/20"
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
