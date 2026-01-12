"use client";

import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import { ButtonGroup } from "@phonaria/ui/components/group";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { PhonemeDetailsDialog } from "@/components/phoneme-details/phoneme-details-dialog";
import { Link } from "@/i18n/navigation";

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
			{ id: "voiceless-dental-fricative", symbol: "θ", isHighlighted: false },
			{ id: "voiced-postalveolar-approximant", symbol: "ɹ", isHighlighted: false },
			{ id: "close-back-rounded", symbol: "u", isHighlighted: true },
		],
	},
	{
		word: "though",
		pattern: "ough",
		phonemes: [
			{ id: "voiced-dental-fricative", symbol: "ð", isHighlighted: false },
			{
				id: "close-mid-back-rounded-to-near-close-near-back-rounded",
				symbol: "oʊ",
				isHighlighted: true,
			},
		],
	},
	{
		word: "thought",
		pattern: "ough",
		phonemes: [
			{ id: "voiceless-dental-fricative", symbol: "θ", isHighlighted: false },
			{ id: "open-mid-back-rounded", symbol: "ɔ", isHighlighted: true },
			{ id: "voiceless-alveolar-plosive", symbol: "t", isHighlighted: false },
		],
	},
	{
		word: "tough",
		pattern: "ough",
		phonemes: [
			{ id: "voiceless-alveolar-plosive", symbol: "t", isHighlighted: false },
			{ id: "open-mid-back-unrounded", symbol: "ʌ", isHighlighted: true },
			{ id: "voiceless-labiodental-fricative", symbol: "f", isHighlighted: true },
		],
	},
	{
		word: "cough",
		pattern: "ough",
		phonemes: [
			{ id: "voiceless-velar-plosive", symbol: "k", isHighlighted: false },
			{ id: "open-mid-back-rounded", symbol: "ɔ", isHighlighted: true },
			{ id: "voiceless-labiodental-fricative", symbol: "f", isHighlighted: true },
		],
	},
	{
		word: "bough",
		pattern: "ough",
		phonemes: [
			{ id: "voiced-bilabial-plosive", symbol: "b", isHighlighted: false },
			{
				id: "open-front-unrounded-to-near-close-near-back-rounded",
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
		<div className="flex flex-col items-center gap-2 rounded-lg bg-background-strong px-3 py-2.5">
			<span className="text-base font-medium tracking-tight">
				{highlightPattern(example.word, example.pattern)}
			</span>

			{/* IPA transcription with individual phoneme buttons */}
			<div className="flex items-center gap-0.5 text-sm">
				<span className="text-muted-foreground">/</span>
				<ButtonGroup>
					{example.phonemes.map((phoneme, index) => (
						<Button
							key={`${example.word}-${phoneme.symbol}-${index}`}
							size="xs"
							variant={phoneme.isHighlighted ? "default" : "outline"}
							className="min-w-6 font-serif"
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
	const [selectedPhoneme, setSelectedPhoneme] = useState<PhonemeSymbolId | null>(null);

	return (
		<section className="grid md:grid-cols-2 gap-6 items-center py-4">
			{/* Text Column */}
			<div className="space-y-3">
				<div className="space-y-2">
					<h2 className="text-base font-semibold tracking-tight">
						The International Phonetic Alphabet
					</h2>
					<p className="text-muted-foreground leading-relaxed text-sm">
						One symbol, one sound. The IPA assigns each sound its own letter. Here are the same{" "}
						<code className="bg-muted px-1.5 py-0.5 rounded font-semibold">{PATTERN}</code> words
						in IPA. The{" "}
						<span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-serif bg-primary text-primary-foreground">
							highlighted
						</span>{" "}
						symbols mark where spelling and sound diverge.
					</p>
				</div>

				<Button variant="outline" render={<Link href="/transcription" />}>
					Try the Transcription Studio <ArrowRight />
				</Button>
			</div>

			{/* Interactive Column */}
			<div className="rounded-xl bg-muted/40 p-3">
				<div className="grid grid-cols-3 gap-2">
					{WORDS.map((example) => (
						<WordCard key={example.word} example={example} onPhonemeClick={setSelectedPhoneme} />
					))}
				</div>
			</div>

			{/* Phoneme Details Dialog */}
			{selectedPhoneme && (
				<PhonemeDetailsDialog
					open={!!selectedPhoneme}
					onOpenChange={(open) => !open && setSelectedPhoneme(null)}
					phonemeId={selectedPhoneme}
				/>
			)}
		</section>
	);
}
