"use client";

import { useState } from "react";
import { ConsonantChart } from "@/components/chart/consonant-chart";
import { VowelChart } from "@/components/chart/vowel-chart";
import { ChartContainer } from "@/components/ui/chart-container";
import { HeroSection, QuickStats } from "@/components/ui/hero-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function IpaChartPage() {
	const [activeSection, setActiveSection] = useState<"consonants" | "vowels">("consonants");

	return (
		<main className="mx-auto max-w-6xl py-6 space-y-6 px-4">
			{/* Hero Section */}
			<HeroSection
				title="English Phoneme Reference"
				subtitle="Interactive IPA Chart"
				description="Reference tool for understanding English phonemes. Click on any symbol to see articulation details, example words, and audio pronunciation."
			>
				<QuickStats phonemeCount={44} vowelCount={12} consonantCount={32} />
			</HeroSection>

			{/* Navigation Tabs */}
			<div className="flex justify-center">
				<Tabs
					value={activeSection}
					onValueChange={(v) => setActiveSection(v as "consonants" | "vowels")}
					className="w-full max-w-6xl"
				>
					<TabsList className="grid w-full grid-cols-2 h-10 p-1 bg-muted border">
						<TabsTrigger
							value="consonants"
							className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"
						>
							Consonants
						</TabsTrigger>
						<TabsTrigger
							value="vowels"
							className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"
						>
							Vowels
						</TabsTrigger>
					</TabsList>

					<div className="mt-8">
						<TabsContent value="consonants" className="space-y-0">
							<ChartContainer
								title="Consonant Phonemes"
								description="Consonant sounds organized by place and manner of articulation. Click any phoneme for detailed pronunciation information."
							>
								<ConsonantChart />
							</ChartContainer>
						</TabsContent>

						<TabsContent value="vowels" className="space-y-0">
							<ChartContainer
								title="Vowel Phonemes"
								description="Vowel sounds showing tongue position, lip rounding, and rhotic variants. Click any phoneme for pronunciation details."
							>
								<VowelChart />
							</ChartContainer>
						</TabsContent>
					</div>
				</Tabs>
			</div>
		</main>
	);
}
