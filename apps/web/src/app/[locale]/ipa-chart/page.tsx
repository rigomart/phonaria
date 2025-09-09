"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsonantChart } from "./_components/consonant-chart";
import { HeroSection } from "./_components/hero-section";
import { VowelChart } from "./_components/vowel-chart";

type PageSection = "consonants" | "vowels";

export default function IpaChartPage() {
	const [activeSection, setActiveSection] = useState<PageSection>("consonants");

	return (
		<main className="mx-auto max-w-6xl py-6 space-y-6 px-4">
			{/* Hero Section */}
			<HeroSection />

			{/* Navigation Tabs */}
			<div className="flex justify-center">
				<Tabs
					value={activeSection}
					onValueChange={(v) => setActiveSection(v as PageSection)}
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
							<div className="space-y-4">
								<div className="space-y-1">
									<h2 className="text-xl font-medium text-foreground">Consonant Phonemes</h2>
									<p className="text-sm text-muted-foreground">
										Consonant sounds organized by place and manner of articulation. Click any
										phoneme for detailed pronunciation information.
									</p>
								</div>
								<ConsonantChart />
							</div>
						</TabsContent>

						<TabsContent value="vowels" className="space-y-0">
							<div className="space-y-4">
								<div className="space-y-1">
									<h2 className="text-xl font-medium text-foreground">Vowel Phonemes</h2>
									<p className="text-sm text-muted-foreground">
										Vowel sounds showing tongue position, lip rounding, and rhotic variants. Click
										any phoneme for pronunciation details.
									</p>
								</div>
								<VowelChart />
							</div>
						</TabsContent>
					</div>
				</Tabs>
			</div>
		</main>
	);
}
