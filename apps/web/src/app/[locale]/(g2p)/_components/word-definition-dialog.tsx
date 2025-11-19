"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
	const normalizedWord = selectedWord?.trim() ?? "";
	const encodedWord = normalizedWord ? encodeURIComponent(normalizedWord.toLowerCase()) : "";
	const dictionaryFallbackLinks = encodedWord
		? [
				{
					label: "Oxford",
					href: `https://www.oxfordlearnersdictionaries.com/search/english/direct/?q=${encodedWord}`,
				},
				{
					label: "Cambridge",
					href: `https://dictionary.cambridge.org/dictionary/english/${encodedWord}`,
				},
			]
		: [];

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				if (!o) setSelectedWord(null);
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="sr-only">{`Definition`}</DialogTitle>
					<DialogDescription className="sr-only">{`Definition for ${selectedWord}`}</DialogDescription>

					<WordDefinitionDetailsHeader word={selectedWord ?? ""} audioUrl={data?.audioUrl} />
				</DialogHeader>
				<ScrollArea className="max-h-[min(70vh,calc(100dvh-10rem))]">
					{data && <WordDefinitionDetailsContent wordDefinition={data} />}
					{isLoading && <WordDefinitionDetailsContentLoading />}
					{error && <WordDefinitionDetailsContentNotFound />}
				</ScrollArea>
				{dictionaryFallbackLinks.length > 0 && (
					<DialogFooter className="items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-xs text-muted-foreground">You can also check this word in:</p>
						<div className="flex flex-wrap gap-1">
							{dictionaryFallbackLinks.map((link) => (
								<Button key={link.label} asChild variant="ghost" size="xs">
									<Link href={link.href} target="_blank" rel="noreferrer noopener">
										{link.label}
										<ExternalLink className="size-4" aria-hidden="true" />
									</Link>
								</Button>
							))}
						</div>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}
