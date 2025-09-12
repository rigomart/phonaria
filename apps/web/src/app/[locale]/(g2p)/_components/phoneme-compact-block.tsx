"use client";

import { ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useCurrentTranscription } from "../_lib/use-g2p";
import { useG2PStore } from "../_store/g2p-store";
import type { TranscriptionResult } from "../_types/g2p";
import { PhonemeDetailPanel } from "./phoneme-detail-panel";

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
			chips.push(selectedPhoneme.articulation.place);
			chips.push(selectedPhoneme.articulation.manner);
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

	if (expanded) {
		return <PhonemeDetailPanel />;
	}

	return (
		<Card
			tabIndex={0}
			onClick={(e) => {
				const target = e.target as HTMLElement | null;
				if (target?.closest("button")) return;
				onToggle();
			}}
			onKeyDown={(e) => {
				if (e.currentTarget !== e.target) return;
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onToggle();
				}
			}}
			className="h-fit cursor-pointer hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
		>
			<CardHeader className="py-2">
				<div className="flex items-start justify-between gap-2">
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
						<ChevronDown className="h-3 w-3 opacity-70" />
					</div>
				</div>
			</CardHeader>
			<CardContent className="py-2 space-y-1">
				{summary?.words && summary.words.length > 0 ? (
					<div className="text-[10px] text-muted-foreground">
						Examples: {summary.words.join(", ")}
					</div>
				) : (
					<div className="text-[10px] text-muted-foreground">No examples in current result</div>
				)}
				<div className="text-[10px] text-muted-foreground">Press Enter to open</div>
			</CardContent>
		</Card>
	);
}
