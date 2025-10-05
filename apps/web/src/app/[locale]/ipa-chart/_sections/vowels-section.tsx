"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { vowels } from "shared-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiphthongChart } from "../_components/diphthong-chart";
import { VowelChart } from "../_components/vowel-chart";
import { SupplementalVowelGroup } from "../_components/vowel-supplement";

export function VowelsSection() {
	const t = useTranslations("IpaChart.Sections.vowels");

	const monophthongs = useMemo(
		() => vowels.filter((phoneme) => phoneme.type === "monophthong"),
		[],
	);
	const rhoticVowels = useMemo(() => vowels.filter((phoneme) => phoneme.type === "rhotic"), []);
	const diphthongs = useMemo(() => vowels.filter((phoneme) => phoneme.type === "diphthong"), []);

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-medium">{t("title")}</h2>
				<p className="text-sm text-muted-foreground">{t("description")}</p>
			</div>

			<Tabs defaultValue="monophthongs" className="w-full">
				<TabsList className="grid w-full max-w-md grid-cols-3">
					<TabsTrigger value="monophthongs">Monophthongs</TabsTrigger>
					<TabsTrigger value="diphthongs">Diphthongs</TabsTrigger>
					<TabsTrigger value="all">All Vowels</TabsTrigger>
				</TabsList>

				<TabsContent value="monophthongs" className="space-y-6 mt-6">
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
				</TabsContent>

				<TabsContent value="diphthongs" className="space-y-6 mt-6">
					<div>
						<h3 className="text-base font-medium mb-2">Vowel Glides</h3>
						<p className="text-sm text-muted-foreground">
							Diphthongs move between two vowel positions. Each arrow shows the tongue&apos;s
							trajectory. Click any trajectory for pronunciation details.
						</p>
					</div>
					<DiphthongChart diphthongs={diphthongs} />
				</TabsContent>

				<TabsContent value="all" className="space-y-6 mt-6">
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
				</TabsContent>
			</Tabs>
		</div>
	);
}
