"use client";

import { ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	WordDefinitionDetails,
	WordDefinitionDetailsContent,
	WordDefinitionDetailsHeader,
	WordDefinitionDetailsHeaderActions,
} from "@/components/word-definition-details";
import { useDictionaryStore } from "../_store/dictionary-store";

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
				<CardContent className="py-2">
					<div className="text-xs text-muted-foreground">Select a word to see its definition.</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<WordDefinitionDetails word={selectedWord}>
			<Card className="h-fit">
				<CardHeader className="py-2">
					<div className="flex items-start justify-between gap-2">
						<button
							type="button"
							aria-expanded={expanded}
							aria-controls="definition-content"
							onClick={() => onToggle()}
							className="w-full text-left rounded-md p-1 -m-1 cursor-pointer hover:bg-muted/70 active:bg-muted shadow-sm hover:shadow transition flex items-start justify-between gap-2"
						>
							<div className="flex-1">
								<WordDefinitionDetailsHeader />
							</div>
							<ChevronDown
								className={`h-3 w-3 opacity-70 transition-transform ${expanded ? "rotate-180" : "rotate-0"}`}
							/>
						</button>
						<div className="pt-1">
							<WordDefinitionDetailsHeaderActions />
						</div>
					</div>
				</CardHeader>
				{expanded && (
					<CardContent id="definition-content" className="py-2 space-y-1">
						<WordDefinitionDetailsContent />
					</CardContent>
				)}
			</Card>
		</WordDefinitionDetails>
	);
}
