"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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

	const { data, isLoading, error, refetch } = useDictionary(selectedWord);

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				if (!o) setSelectedWord(null);
			}}
		>
			<DialogContent className="max-w-2xl max-h-[min(85vh,calc(100dvh-2rem))] overflow-hidden">
				{selectedWord ? (
					isLoading ? (
						<div className="p-2">
							<DialogHeader>
								<DialogTitle className="sr-only">Loading definition</DialogTitle>
							</DialogHeader>
							<ScrollArea className="h-[60vh]">
								<div className="p-3 space-y-4">
									<div className="space-y-2">
										<Skeleton className="h-3 w-24" />
										<Skeleton className="h-6 w-44" />
									</div>
									<div className="space-y-3">
										{["a", "b", "c"].map((key) => (
											<div key={key} className="space-y-2">
												<Skeleton className="h-5 w-24" />
												<Skeleton className="h-4 w-11/12" />
												<Skeleton className="h-4 w-10/12" />
											</div>
										))}
									</div>
								</div>
							</ScrollArea>
						</div>
					) : error || !data ? (
						<div className="p-2">
							<DialogHeader>
								<DialogTitle className="sr-only">Error loading definition</DialogTitle>
							</DialogHeader>
							<div className="p-6 text-center text-sm text-muted-foreground">
								<div>Could not load definition.</div>
							</div>
						</div>
					) : (
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
					)
				) : null}
			</DialogContent>
		</Dialog>
	);
}
