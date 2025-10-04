"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDictionary } from "../_hooks/use-dictionary";
import { useDictionaryStore } from "../_store/dictionary-store";
import {
	WordDefinitionDetailsContent,
	WordDefinitionDetailsContentLoading,
	WordDefinitionDetailsContentNotFound,
	WordDefinitionDetailsHeader,
} from "./word-definition-details";

export function WordDefinitionDialog() {
	const { selectedWord, setSelectedWord } = useDictionaryStore();
	const open = !!selectedWord;

	const { data, isLoading, error } = useDictionary(selectedWord);

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				if (!o) setSelectedWord(null);
			}}
		>
			<DialogContent className="max-w-2xl max-h-[min(85vh,calc(100dvh-2rem))] overflow-hidden">
				<DialogHeader>
					<DialogTitle className="sr-only">{`Definition for ${selectedWord}`}</DialogTitle>

					<WordDefinitionDetailsHeader word={selectedWord ?? ""} audioUrl={data?.audioUrl} />
				</DialogHeader>
				<ScrollArea className="h-[60vh]">
					{data && <WordDefinitionDetailsContent wordDefinition={data} />}
					{isLoading && <WordDefinitionDetailsContentLoading />}
					{error && <WordDefinitionDetailsContentNotFound />}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
