"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDictionaryStore } from "../_store/dictionary-store";
import {
	WordDefinitionDetails,
	WordDefinitionDetailsContent,
	WordDefinitionDetailsHeader,
	WordDefinitionDetailsHeaderActions,
} from "./word-definition-details";

export function DefinitionCompactBlock() {
	const { selectedWord } = useDictionaryStore();

	if (!selectedWord) {
		return (
			<Card className="h-full">
				<CardHeader className="py-3">
					<CardTitle className="text-xs">Definition</CardTitle>
				</CardHeader>
				<CardContent className="p-0 h-full">
					<div className="h-full flex items-center justify-center">
						<div className="text-center space-y-2 px-6">
							<div className="text-sm text-muted-foreground">Select a word to see definitions.</div>
							<div className="text-xs text-muted-foreground">
								Click a word above the transcription.
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<WordDefinitionDetails word={selectedWord}>
			<Card className="h-full flex flex-col">
				<CardHeader className="py-3">
					<div className="flex items-center justify-between">
						<WordDefinitionDetailsHeader />
						<WordDefinitionDetailsHeaderActions />
					</div>
				</CardHeader>
				<CardContent className="flex-1 p-0 min-h-0">
					<ScrollArea className="h-full">
						<div className="p-4">
							<WordDefinitionDetailsContent />
						</div>
					</ScrollArea>
				</CardContent>
			</Card>
		</WordDefinitionDetails>
	);
}
