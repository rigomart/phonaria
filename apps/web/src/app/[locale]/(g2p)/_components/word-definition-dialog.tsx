"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDictionary } from "../_hooks/use-dictionary";
import { useDictionaryStore } from "../_store/dictionary-store";
import {
	WordDefinitionDetails,
	WordDefinitionDetailsContent,
	WordDefinitionDetailsHeader,
} from "./word-definition-details";

export function WordDefinitionDialog() {
	const { selectedWord, setSelectedWord } = useDictionaryStore();
	const open = !!selectedWord;

	const { data, isLoading, error } = useDictionary(selectedWord);

	if (isLoading) return <div>Loading...</div>;

	if (error || !data) return <div>Error</div>;

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				if (!o) setSelectedWord(null);
			}}
		>
			<DialogContent className="max-w-2xl max-h-[min(85vh,calc(100dvh-2rem))] overflow-hidden">
				{selectedWord ? (
					<WordDefinitionDetails wordDefinition={data}>
						<DialogHeader>
							<DialogTitle className="sr-only">{`Definition for ${selectedWord}`}</DialogTitle>

							<WordDefinitionDetailsHeader />
						</DialogHeader>
						<ScrollArea className="h-[60vh]">
							<div className="p-1">
								<WordDefinitionDetailsContent />
							</div>
						</ScrollArea>
					</WordDefinitionDetails>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
