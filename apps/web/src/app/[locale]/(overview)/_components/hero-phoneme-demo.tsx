"use client";

import { MousePointerClick } from "lucide-react";
import { useState } from "react";
import type { PhonemeSymbolId } from "shared-data";
import { PhonemeDetailsDialog } from "@/components/phoneme-details/phoneme-details-dialog";
import { cn } from "@/lib/utils";
import { useScopedI18n } from "@/locales/client";

type ExamplePhoneme = {
	id: PhonemeSymbolId;
	symbol: string;
};

const SENTENCE_DATA: { text: string; phonemes: ExamplePhoneme[] }[] = [
	{
		text: "Think",
		phonemes: [
			{ id: "voiceless-dental-fricative", symbol: "θ" },
			{ id: "near-close-near-front-unrounded", symbol: "ɪ" },
			{ id: "voiced-velar-nasal", symbol: "ŋ" },
			{ id: "voiceless-velar-plosive", symbol: "k" },
		],
	},
	{
		text: "through",
		phonemes: [
			{ id: "voiceless-dental-fricative", symbol: "θ" },
			{ id: "voiced-postalveolar-approximant", symbol: "r" },
			{ id: "close-back-rounded", symbol: "u" },
		],
	},
	{
		text: "the",
		phonemes: [
			{ id: "voiced-dental-fricative", symbol: "ð" },
			{ id: "mid-central-unrounded", symbol: "ə" },
		],
	},
	{
		text: "thought",
		phonemes: [
			{ id: "voiceless-dental-fricative", symbol: "θ" },
			{ id: "open-mid-back-rounded", symbol: "ɔ" },
			{ id: "voiceless-alveolar-plosive", symbol: "t" },
		],
	},
];

export function HeroPhonemeDemo() {
	const t = useScopedI18n("overview-page.hero");
	const [selectedPhonemeId, setSelectedPhonemeId] = useState<PhonemeSymbolId | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	const handlePhonemeClick = (phonemeId: PhonemeSymbolId) => {
		setSelectedPhonemeId(phonemeId);
		setDialogOpen(true);
	};

	return (
		<div className="space-y-4">
			{/* Demo Container */}
			<div className="flex flex-col items-center justify-center rounded-xl p-4 sm:p-6 shadow-sm gap-6">
				{/* IPA Transcription - Clickable Phonemes */}
				<div className="flex flex-wrap justify-center gap-x-6 gap-y-4">
					{SENTENCE_DATA.map((word) => (
						<div key={word.text} className="flex flex-col items-center gap-2">
							<span className="text-sm sm:text-base text-muted-foreground font-medium">
								{word.text}
							</span>
							<div className="flex items-center">
								{word.phonemes.map((phoneme, index) => (
									<button
										key={`${word.text}-${phoneme.id}-${index}`}
										type="button"
										onClick={() => handlePhonemeClick(phoneme.id)}
										className={cn(
											"text-2xl md:text-3xl bg-transparent border-none p-1 m-0 rounded-md",
											"cursor-pointer transition-all duration-100 ease-out",
											"hover:text-primary hover:bg-primary/5 hover:shadow-sm",
											"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:rounded-md",
											selectedPhonemeId === phoneme.id &&
												"text-primary bg-primary/10 ring-2 ring-primary/40 rounded-md shadow-sm",
										)}
										title={t("hint")}
									>
										{phoneme.symbol}
									</button>
								))}
							</div>
						</div>
					))}
				</div>

				<div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-primary/80 text-xs font-medium bg-primary/5 border border-primary/10">
					<MousePointerClick className="size-3.5" />
					<span>{t("hint")}</span>
				</div>
			</div>

			{/* Phoneme Details Dialog */}
			{selectedPhonemeId && (
				<PhonemeDetailsDialog
					open={dialogOpen}
					onOpenChange={setDialogOpen}
					phonemeId={selectedPhonemeId}
				/>
			)}
		</div>
	);
}
