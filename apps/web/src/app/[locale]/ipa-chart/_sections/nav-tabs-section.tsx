"use client";

import { useMemo } from "react";
import { vowels } from "shared-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiphthongChart } from "../_components/diphthong-chart";
import { VowelChart } from "../_components/vowel-chart";
import { SupplementalVowelGroup } from "../_components/vowel-supplement";
import type { IpaSection } from "../_store/ipa-chart-store";
import { useIpaChartStore } from "../_store/ipa-chart-store";
import { ConsonantsSection } from "./consonants-section";

export function NavTabsSection() {
	const activeSection = useIpaChartStore((s) => s.activeSection);
	const setActiveSection = useIpaChartStore((s) => s.setActiveSection);

	const monophthongs = useMemo(
		() => vowels.filter((phoneme) => phoneme.type === "monophthong"),
		[],
	);
	const rhoticVowels = useMemo(() => vowels.filter((phoneme) => phoneme.type === "rhotic"), []);
	const diphthongs = useMemo(() => vowels.filter((phoneme) => phoneme.type === "diphthong"), []);

	return (
		<div className="p-6">
			<Tabs
				value={activeSection}
				onValueChange={(v) => setActiveSection(v as IpaSection)}
				className="w-full max-w-6xl mx-auto"
			>
				<TabsList className="grid w-full grid-cols-3 h-10 p-1 bg-muted border">
					<TabsTrigger value="consonants">Consonants</TabsTrigger>
					<TabsTrigger value="monophthongs">Single Vowels</TabsTrigger>
					<TabsTrigger value="diphthongs">Diphthongs</TabsTrigger>
				</TabsList>

				<div className="mt-8">
					<TabsContent value="consonants" className="space-y-6">
						<ConsonantsSection />
					</TabsContent>

					<TabsContent value="monophthongs" className="space-y-6">
						<div className="space-y-6">
							<div>
								<h2 className="text-xl font-medium">Vowel Phonemes</h2>
								<p className="text-sm text-muted-foreground">
									Pure vowel sounds organized by tongue position. Click any phoneme for
									pronunciation details.
								</p>
							</div>
							<VowelChart vowels={monophthongs} />
							{rhoticVowels.length > 0 && (
								<SupplementalVowelGroup title="Rhotic vowels" phonemes={rhoticVowels} />
							)}
						</div>
					</TabsContent>

					<TabsContent value="diphthongs" className="space-y-6">
						<div className="space-y-6">
							<div>
								<h2 className="text-xl font-medium">Vowel Phonemes</h2>
								<p className="text-sm text-muted-foreground">
									Diphthongs move between two vowel positions. Each arrow shows the tongue&apos;s
									trajectory. Click any trajectory for pronunciation details.
								</p>
							</div>
							<DiphthongChart diphthongs={diphthongs} />
						</div>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
