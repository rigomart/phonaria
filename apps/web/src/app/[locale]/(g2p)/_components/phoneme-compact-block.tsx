"use client";

import { ChevronDown } from "lucide-react";
import { useMemo } from "react";
import {
	PhonemeDetails,
	PhonemeDetailsAllophones,
	PhonemeDetailsArticulation,
	PhonemeDetailsExamples,
	PhonemeDetailsGuide,
	PhonemeDetailsHeader,
} from "@/components/phoneme-details";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrentTranscription } from "../_lib/use-g2p";
import { useG2PStore } from "../_store/g2p-store";
import type { TranscriptionResult } from "../_types/g2p";

export function PhonemeCompactBlock({
	expanded,
	onToggle,
}: {
	expanded: boolean;
	onToggle: () => void;
}) {
	const { selectedPhoneme } = useG2PStore();
	const transcriptionQuery = useCurrentTranscription();
	const transcription = transcriptionQuery.data as TranscriptionResult | null;

	const summary = useMemo(() => {
		if (!selectedPhoneme || !transcription) return null;
		const symbol = selectedPhoneme.symbol;

		const words: string[] = [];
		for (const w of transcription.words) {
			const variant = w.variants[w.selectedVariantIndex] ?? [];
			if (variant.some((p) => p.symbol === symbol)) {
				words.push(w.word);
				if (words.length >= 3) break;
			}
		}

		const chips: string[] = [];
		if (selectedPhoneme.category === "consonant") {
			chips.push(selectedPhoneme.articulation.manner);
			chips.push(selectedPhoneme.articulation.place);
			chips.push(selectedPhoneme.articulation.voicing);
		} else {
			chips.push(selectedPhoneme.articulation.height);
			chips.push(selectedPhoneme.articulation.frontness);
			chips.push(selectedPhoneme.articulation.roundness);
		}
		return { words, chips, symbol };
	}, [selectedPhoneme, transcription]);

	if (!selectedPhoneme) {
		return (
			<Card className="h-fit">
				<CardHeader className="py-2">
					<CardTitle className="text-xs">Phoneme</CardTitle>
				</CardHeader>
				<CardContent className="py-2">
					<div className="text-xs text-muted-foreground">Click a phoneme to see details.</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="h-fit">
			<CardHeader className="py-2">
				<button
					type="button"
					aria-expanded={expanded}
					onClick={() => onToggle()}
					className="w-full text-left rounded-md p-1 -m-1 cursor-pointer hover:bg-muted/70 active:bg-muted shadow-sm hover:shadow transition flex items-start justify-between gap-2"
				>
					<div>
						<CardTitle className="text-xs">Phoneme</CardTitle>
						<div className="text-sm font-semibold">/{selectedPhoneme.symbol}/</div>
						<div className="flex flex-wrap gap-1 mt-1">
							{summary?.chips.map((c) => (
								<Badge key={c} variant="secondary" className="h-5 px-1.5 text-[10px] capitalize">
									{c}
								</Badge>
							))}
						</div>
					</div>
					<div className="flex items-center gap-2">
						<ChevronDown
							className={`h-3 w-3 opacity-70 transition-transform ${expanded ? "rotate-180" : "rotate-0"}`}
						/>
					</div>
				</button>
			</CardHeader>
			{expanded && (
				<CardContent className="py-2">
					<ScrollArea className="h-[400px] pr-3">
						<PhonemeDetails phoneme={selectedPhoneme}>
							<div className="space-y-6">
								<PhonemeDetailsHeader />
								<PhonemeDetailsArticulation />
								<PhonemeDetailsExamples />
								<PhonemeDetailsGuide />
								<PhonemeDetailsAllophones />
							</div>
						</PhonemeDetails>
					</ScrollArea>
				</CardContent>
			)}
		</Card>
	);
}
