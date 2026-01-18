"use client";

import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import { ButtonGroup } from "@phonaria/ui/components/group";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { PhonemeDetailsDialog } from "@/components/phoneme-details/phoneme-details-dialog";
import { Link } from "@/i18n/navigation";
import {
	Section,
	SectionContent,
	SectionDescription,
	SectionHeader,
	SectionText,
	SectionTitle,
} from "./section-layout";

type Phoneme = {
	id: PhonemeSymbolId;
	symbol: string;
	isHighlighted: boolean;
};

type WordExample = {
	word: string;
	pattern: string;
	phonemes: Phoneme[];
};

const PATTERN = "ough";

const WORDS: WordExample[] = [
	{
		word: "through",
		pattern: "ough",
		phonemes: [
			{ id: "TH", symbol: "θ", isHighlighted: false },
			{ id: "R", symbol: "ɹ", isHighlighted: false },
			{ id: "U", symbol: "u", isHighlighted: true },
		],
	},
	{
		word: "though",
		pattern: "ough",
		phonemes: [
			{ id: "DH", symbol: "ð", isHighlighted: false },
			{
				id: "OU",
				symbol: "oʊ",
				isHighlighted: true,
			},
		],
	},
	{
		word: "thought",
		pattern: "ough",
		phonemes: [
			{ id: "TH", symbol: "θ", isHighlighted: false },
			{ id: "O", symbol: "ɔ", isHighlighted: true },
			{ id: "T", symbol: "t", isHighlighted: false },
		],
	},
	{
		word: "tough",
		pattern: "ough",
		phonemes: [
			{ id: "T", symbol: "t", isHighlighted: false },
			{ id: "AH", symbol: "ʌ", isHighlighted: true },
			{ id: "F", symbol: "f", isHighlighted: true },
		],
	},
	{
		word: "cough",
		pattern: "ough",
		phonemes: [
			{ id: "K", symbol: "k", isHighlighted: false },
			{ id: "O", symbol: "ɔ", isHighlighted: true },
			{ id: "F", symbol: "f", isHighlighted: true },
		],
	},
	{
		word: "bough",
		pattern: "ough",
		phonemes: [
			{ id: "B", symbol: "b", isHighlighted: false },
			{
				id: "AU",
				symbol: "aʊ",
				isHighlighted: true,
			},
		],
	},
];

function highlightPattern(word: string, pattern: string) {
	const index = word.indexOf(pattern);
	if (index === -1) return <span>{word}</span>;

	const before = word.slice(0, index);
	const after = word.slice(index + pattern.length);

	return (
		<>
			<span className="text-muted-foreground">{before}</span>
			<span className="text-primary font-semibold">{pattern}</span>
			<span className="text-muted-foreground">{after}</span>
		</>
	);
}

function WordCard({
	example,
	onPhonemeClick,
}: {
	example: WordExample;
	onPhonemeClick: (phonemeId: PhonemeSymbolId) => void;
}) {
	return (
		<div className="flex flex-col items-center gap-2 rounded-lg border px-3 py-2.5">
			<span className="text-base font-medium tracking-tight">
				{highlightPattern(example.word, example.pattern)}
			</span>

			{/* IPA transcription with individual phoneme buttons */}
			<div className="flex items-center gap-0.5 text-base">
				<span className="text-muted-foreground">/</span>
				<ButtonGroup>
					{example.phonemes.map((phoneme, index) => (
						<Button
							key={`${example.word}-${phoneme.symbol}-${index}`}
							size="sm"
							variant={phoneme.isHighlighted ? "default" : "outline"}
							className="min-w-7 font-serif text-base"
							onClick={() => onPhonemeClick(phoneme.id)}
						>
							{phoneme.symbol}
						</Button>
					))}
				</ButtonGroup>
				<span className="text-muted-foreground">/</span>
			</div>
		</div>
	);
}

export function IpaIntroSection() {
	const t = useTranslations("overview-page.sections.ipa-intro");
	const [selectedPhoneme, setSelectedPhoneme] = useState<PhonemeSymbolId | null>(null);

	return (
		<Section>
			<SectionText>
				<SectionHeader>
					<SectionTitle>{t("title")}</SectionTitle>
					<SectionDescription>
						{t.rich("description", {
							pattern: PATTERN,
							code: (chunks) => (
								<code className="bg-muted px-1.5 py-0.5 rounded font-semibold">{chunks}</code>
							),
							highlight: (chunks) => (
								<span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-sm font-serif bg-primary text-primary-foreground">
									{chunks}
								</span>
							),
						})}
					</SectionDescription>
				</SectionHeader>

				<Button variant="outline" render={<Link href="/transcription" />}>
					{t("action")} <ArrowRight />
				</Button>
			</SectionText>

			<SectionContent>
				<div className="grid grid-cols-3 gap-2">
					{WORDS.map((example) => (
						<WordCard key={example.word} example={example} onPhonemeClick={setSelectedPhoneme} />
					))}
				</div>

				{selectedPhoneme && (
					<PhonemeDetailsDialog
						open={!!selectedPhoneme}
						onOpenChange={(open) => !open && setSelectedPhoneme(null)}
						phonemeId={selectedPhoneme}
					/>
				)}
			</SectionContent>
		</Section>
	);
}
