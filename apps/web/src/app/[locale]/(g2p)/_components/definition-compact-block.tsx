"use client";

import { useMemo } from "react";
import {
	WordDefinitionDetails,
	WordDefinitionDetailsContent,
	WordDefinitionDetailsHeader,
} from "@/app/[locale]/(g2p)/_components/word-definition-details";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useDictionaryStore } from "../_store/dictionary-store";
import {
	CollapsibleDetailCard,
	CollapsibleDetailCardContent,
	CollapsibleDetailCardHeader,
} from "./collapsible-detail-card";
import { PlayAudio } from "./play-audio";

export function DefinitionCompactBlock({
	expanded,
	onToggle,
}: {
	expanded: boolean;
	onToggle: () => void;
}) {
	const { selectedWord } = useDictionaryStore();

	useMemo(() => selectedWord, [selectedWord]);

	if (!selectedWord) {
		return (
			<Card className="h-fit">
				<CardHeader className="py-2">
					<CardTitle className="text-xs">Definition</CardTitle>
				</CardHeader>
			</Card>
		);
	}

	return (
		<WordDefinitionDetails word={selectedWord}>
			<CollapsibleDetailCard expanded={expanded} onToggle={onToggle}>
				<div className="relative">
					<CollapsibleDetailCardHeader controlsId="definition-content">
						<WordDefinitionDetailsHeader />
					</CollapsibleDetailCardHeader>
					<div className="absolute right-0 bottom-0">
						<PlayAudio src={"test"} label={`Pronunciation for ${selectedWord}`} />
					</div>
				</div>
				<CollapsibleDetailCardContent id="definition-content">
					<div className="max-h-80 overflow-auto pb-6">
						<WordDefinitionDetailsContent />
					</div>
				</CollapsibleDetailCardContent>
			</CollapsibleDetailCard>
		</WordDefinitionDetails>
	);
}
