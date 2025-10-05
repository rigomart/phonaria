"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { vowels } from "shared-data";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DiphthongChart } from "../_components/diphthong-chart";
import { VowelChart } from "../_components/vowel-chart";
import { SupplementalVowelGroup } from "../_components/vowel-supplement";

type VowelView = "monophthongs" | "diphthongs" | "all";

export function VowelsSection() {
	const t = useTranslations("IpaChart.Sections.vowels");
	const [view, setView] = useState<VowelView>("monophthongs");

	const monophthongs = useMemo(
		() => vowels.filter((phoneme) => phoneme.type === "monophthong"),
		[],
	);
	const rhoticVowels = useMemo(() => vowels.filter((phoneme) => phoneme.type === "rhotic"), []);
	const diphthongs = useMemo(() => vowels.filter((phoneme) => phoneme.type === "diphthong"), []);

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div>
					<h2 className="text-xl font-medium">{t("title")}</h2>
					<p className="text-sm text-muted-foreground">{t("description")}</p>
				</div>

				<div className="flex items-center gap-3">
					<span className="text-sm font-medium text-muted-foreground">View:</span>
					<ToggleGroup
						type="single"
						value={view}
						onValueChange={(value) => value && setView(value as VowelView)}
						className="justify-start"
					>
						<ToggleGroupItem value="monophthongs" aria-label="Show monophthongs">
							Single Vowels
						</ToggleGroupItem>
						<ToggleGroupItem value="diphthongs" aria-label="Show diphthongs">
							Glides
						</ToggleGroupItem>
						<ToggleGroupItem value="all" aria-label="Show all vowels">
							All
						</ToggleGroupItem>
					</ToggleGroup>
				</div>
			</div>

			{view === "monophthongs" && (
				<div className="space-y-6">
					<div>
						<h3 className="text-base font-medium mb-2">Single Vowel Sounds</h3>
						<p className="text-sm text-muted-foreground">
							Pure vowel sounds organized by tongue position. Click any phoneme for pronunciation
							details.
						</p>
					</div>
					<VowelChart vowels={monophthongs} />
					{rhoticVowels.length > 0 && (
						<SupplementalVowelGroup title="Rhotic vowels" phonemes={rhoticVowels} />
					)}
				</div>
			)}

			{view === "diphthongs" && (
				<div className="space-y-6">
					<div>
						<h3 className="text-base font-medium mb-2">Vowel Glides</h3>
						<p className="text-sm text-muted-foreground">
							Diphthongs move between two vowel positions. Each arrow shows the tongue&apos;s
							trajectory. Click any trajectory for pronunciation details.
						</p>
					</div>
					<DiphthongChart diphthongs={diphthongs} />
				</div>
			)}

			{view === "all" && (
				<div className="space-y-6">
					<div>
						<h3 className="text-base font-medium mb-2">Complete Vowel Inventory</h3>
						<p className="text-sm text-muted-foreground">
							All vowel sounds in General American English organized by type.
						</p>
					</div>
					<VowelChart vowels={vowels} />
					<div className="space-y-4">
						{rhoticVowels.length > 0 && (
							<SupplementalVowelGroup title="Rhotic vowels" phonemes={rhoticVowels} />
						)}
						{diphthongs.length > 0 && (
							<SupplementalVowelGroup title="Diphthongs" phonemes={diphthongs} />
						)}
					</div>
				</div>
			)}
		</div>
	);
}
