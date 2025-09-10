"use client";

import { useState } from "react";
import type { ConsonantPhoneme, VowelPhoneme } from "shared-data";
import { consonants, vowels } from "shared-data";
import { PhonemeDialog } from "@/components/phoneme-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroSection } from "./_components/hero-section";

// Import our simplified components
import { PhonemeCategories } from "./_components/simplified/phoneme-categories";
import { PhonemeSearch } from "./_components/simplified/phoneme-search";

type PageSection = "consonants" | "vowels";

/**
 * Simplified IPA Chart implementation using category-based organization.
 * This replaces the complex grid system with a more learner-friendly approach.
 */
export default function IpaChartPage() {
	const [activeSection, setActiveSection] = useState<PageSection>("consonants");
	const [searchTerm, setSearchTerm] = useState("");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedPhoneme, setSelectedPhoneme] = useState<ConsonantPhoneme | VowelPhoneme | null>(
		null,
	);

	// Handle phoneme selection
	const handleConsonantClick = (phoneme: ConsonantPhoneme) => {
		setSelectedPhoneme(phoneme);
		setDialogOpen(true);
	};

	const handleVowelClick = (phoneme: VowelPhoneme) => {
		setSelectedPhoneme(phoneme);
		setDialogOpen(true);
	};

	const handleDialogClose = (open: boolean) => {
		setDialogOpen(open);
		if (!open) {
			setSelectedPhoneme(null);
		}
	};

	// Get filtered counts for result display
	const getFilteredCount = (phonemes: ConsonantPhoneme[] | VowelPhoneme[]) => {
		if (!searchTerm.trim()) return phonemes.length;

		const normalizedTerm = searchTerm.toLowerCase().trim();
		return phonemes.filter((phoneme) => {
			return (
				phoneme.symbol.toLowerCase().includes(normalizedTerm) ||
				phoneme.description.toLowerCase().includes(normalizedTerm) ||
				phoneme.guide?.toLowerCase().includes(normalizedTerm) ||
				phoneme.examples.some(
					(example) =>
						example.word.toLowerCase().includes(normalizedTerm) ||
						example.phonemic.toLowerCase().includes(normalizedTerm),
				)
			);
		}).length;
	};

	const consonantCount = getFilteredCount(consonants);
	const vowelCount = getFilteredCount(vowels);
	const totalCount = activeSection === "consonants" ? consonantCount : vowelCount;

	return (
		<main className="mx-auto max-w-6xl py-6 space-y-6 px-4">
			{/* Hero Section */}
			<HeroSection />

			{/* Universal Search */}
			<PhonemeSearch
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				resultCount={totalCount}
				placeholder="Search by sound, word, or description..."
			/>

			{/* Navigation Tabs */}
			<div className="flex justify-center">
				<Tabs
					value={activeSection}
					onValueChange={(v) => setActiveSection(v as PageSection)}
					className="w-full max-w-6xl"
				>
					<TabsList className="grid w-full grid-cols-2 h-10 p-1 bg-muted border">
						<TabsTrigger value="consonants">
							Consonants {searchTerm && `(${consonantCount})`}
						</TabsTrigger>
						<TabsTrigger value="vowels">Vowels {searchTerm && `(${vowelCount})`}</TabsTrigger>
					</TabsList>

					<div className="mt-8">
						<TabsContent value="consonants" className="space-y-0">
							<div className="space-y-6">
								<div>
									<h2 className="text-xl font-medium">Consonant Phonemes</h2>
									<p className="text-sm text-muted-foreground">
										Consonant sounds organized by type and characteristics. Click any phoneme for
										detailed pronunciation information.
									</p>
								</div>
								<PhonemeCategories
									phonemes={consonants}
									type="consonant"
									searchTerm={searchTerm}
									onPhonemeClick={handleConsonantClick}
									defaultOpenCategories={!searchTerm} // Close categories when searching
								/>
							</div>
						</TabsContent>

						<TabsContent value="vowels" className="space-y-0">
							<div className="space-y-6">
								<div>
									<h2 className="text-xl font-medium">Vowel Phonemes</h2>
									<p className="text-sm text-muted-foreground">
										Vowel sounds organized by type and characteristics. Click any phoneme for
										pronunciation details.
									</p>
								</div>
								<PhonemeCategories
									phonemes={vowels}
									type="vowel"
									searchTerm={searchTerm}
									onPhonemeClick={handleVowelClick}
									defaultOpenCategories={!searchTerm} // Close categories when searching
								/>
							</div>
						</TabsContent>
					</div>
				</Tabs>
			</div>

			{/* Phoneme Details Dialog - Reusing existing dialog system */}
			<PhonemeDialog.Root open={dialogOpen} onOpenChange={handleDialogClose}>
				<PhonemeDialog.Content className="max-w-3xl max-h-[min(85vh,calc(100dvh-2rem))] overflow-y-auto">
					{selectedPhoneme ? (
						<div className="space-y-8">
							<PhonemeDialog.Header phoneme={selectedPhoneme} />

							{/* Sagittal view placeholder */}
							<section className="space-y-3">
								<h3 className="text-sm font-medium">Sagittal view</h3>
								<div className="flex justify-center">
									<div
										className="aspect-square w-full max-w-[28rem] sm:max-w-[30rem] md:max-w-[32rem] rounded-lg border bg-muted/30 text-muted-foreground flex items-center justify-center select-none"
										role="img"
										aria-label="Sagittal view placeholder"
									>
										<span className="text-sm">Sagittal view placeholder</span>
									</div>
								</div>
							</section>

							{/* Articulation details */}
							{selectedPhoneme.category === "consonant" ? (
								<PhonemeDialog.ConsonantArticulation phoneme={selectedPhoneme} />
							) : (
								<PhonemeDialog.VowelArticulation phoneme={selectedPhoneme} />
							)}

							{/* Pronunciation guide */}
							{selectedPhoneme.guide ? <PhonemeDialog.Guide guide={selectedPhoneme.guide} /> : null}

							{/* Example words */}
							<PhonemeDialog.Examples examples={selectedPhoneme.examples} />

							{/* Allophones */}
							{selectedPhoneme.allophones?.length ? (
								<PhonemeDialog.Allophones allophones={selectedPhoneme.allophones} />
							) : null}
						</div>
					) : null}
				</PhonemeDialog.Content>
			</PhonemeDialog.Root>
		</main>
	);
}
