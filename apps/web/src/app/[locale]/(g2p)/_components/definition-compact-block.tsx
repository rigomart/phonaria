"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
	WordDefinitionDetails,
	WordDefinitionDetailsContent,
	WordDefinitionDetailsHeader,
	WordDefinitionDetailsHeaderActions,
} from "@/components/word-definition-details";
import { useDictionaryStore } from "../_store/dictionary-store";
import {
	CollapsibleDetailCard,
	CollapsibleDetailCardContent,
	CollapsibleDetailCardHeader,
} from "./collapsible-detail-card";

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
				<CollapsibleDetailCardHeader
					controlsId="definition-content"
					actions={<WordDefinitionDetailsHeaderActions />}
				>
					<WordDefinitionDetailsHeader />
				</CollapsibleDetailCardHeader>
				<CollapsibleDetailCardContent id="definition-content">
					<div className="max-h-80 overflow-auto">
						<WordDefinitionDetailsContent />
					</div>
				</CollapsibleDetailCardContent>
			</CollapsibleDetailCard>
		</WordDefinitionDetails>
	);
}
