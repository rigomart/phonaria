"use client";

import { ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { AudioButton } from "@/components/audio-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useDictionary } from "../_lib/use-dictionary";
import type { WordDefinition } from "../_schemas/dictionary";
import { useDictionaryStore } from "../_store/dictionary-store";
import { WordDefinitionPanel } from "./word-definition-panel";

export function DefinitionCompactBlock({
	expanded,
	onToggle,
}: {
	expanded: boolean;
	onToggle: () => void;
}) {
	const { selectedWord } = useDictionaryStore();
	const query = useDictionary(selectedWord);

	const summary = useMemo(() => {
		const data = query.data as WordDefinition | null;
		if (!data) return null;

		const parts = data.meanings.map((m) => m.partOfSpeech);
		const uniqueParts = Array.from(new Set(parts)).slice(0, 1); // show only 1 POS for compactness

		const firstDef = data.meanings.flatMap((m) => m.definitions.map((d) => d))[0]?.definition;

		const audioUrl = data.audioUrl ?? null;
		return { uniqueParts, firstDef, audioUrl };
	}, [query.data]);

	if (!selectedWord) {
		return (
			<Card className="h-fit">
				<CardHeader className="py-2">
					<CardTitle className="text-xs">Definition</CardTitle>
				</CardHeader>
				<CardContent className="py-2">
					<div className="text-xs text-muted-foreground">Select a word to see its definition.</div>
				</CardContent>
			</Card>
		);
	}

	if (expanded) {
		return <WordDefinitionPanel />;
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
						<CardTitle className="text-xs">Definition</CardTitle>
						<div className="text-sm font-semibold">{selectedWord}</div>
						{summary?.uniqueParts && summary.uniqueParts.length > 0 && (
							<div className="flex flex-wrap gap-1 mt-1">
								{summary.uniqueParts.map((p) => (
									<Badge key={p} variant="secondary" className="h-5 px-1.5 text-[10px] capitalize">
										{p}
									</Badge>
								))}
							</div>
						)}
					</div>
					<div className="flex items-center gap-2">
						{summary?.audioUrl && selectedWord && (
							<AudioButton src={summary.audioUrl} label={`Pronunciation for ${selectedWord}`} />
						)}
						<ChevronDown className="h-3 w-3 opacity-70" />
					</div>
				</div>
			</CardHeader>
			<CardContent className="py-2 space-y-1">
				{query.isLoading && <div className="text-xs text-muted-foreground">Loading…</div>}
				{summary?.firstDef && <p className="text-xs line-clamp-1">{summary.firstDef}</p>}
				<div className="text-[10px] text-muted-foreground">Press Enter to open</div>
			</CardContent>
		</Card>
	);
}
