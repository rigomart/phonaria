"use client";

import { Button } from "@phonaria/ui/components/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@phonaria/ui/components/empty";
import { ScrollArea } from "@phonaria/ui/components/scroll-area";
import { Spinner } from "@phonaria/ui/components/spinner";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { PhonemeSearchResponse } from "../_lib/phoneme-search/model";

interface FindBySoundResultsProps {
	words: PhonemeSearchResponse["words"];
	totalCount: number;
	limit: number;
	isLoading: boolean;
	isError: boolean;
	hasSelection: boolean;
}

export function FindBySoundResults({
	words,
	totalCount,
	limit,
	isLoading,
	isError,
	hasSelection,
}: FindBySoundResultsProps) {
	const t = useTranslations("find-by-sound-page.results");
	const [copiedWord, setCopiedWord] = useState<string | null>(null);

	const handleCopy = async (word: string, ipa: string) => {
		try {
			await navigator.clipboard.writeText(ipa);
			setCopiedWord(word);
			setTimeout(() => setCopiedWord(null), 2000);
		} catch (error) {
			console.error("Copy failed:", error);
		}
	};

	if (!hasSelection) {
		return (
			<div className="rounded-lg border bg-background-soft p-6">
				<Empty>
					<EmptyHeader>
						<EmptyTitle>{t("empty.title")}</EmptyTitle>
						<EmptyDescription>{t("empty.description")}</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="rounded-lg border bg-background-soft p-6">
				<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
					<Spinner className="size-4" />
					{t("loading")}
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="rounded-lg border bg-background-soft p-6">
				<div className="text-center">
					<div className="text-sm font-medium">{t("error.title")}</div>
					<div className="mt-1 text-sm text-muted-foreground">{t("error.description")}</div>
				</div>
			</div>
		);
	}

	if (words.length === 0) {
		return (
			<div className="rounded-lg border border-dashed bg-background-soft p-6">
				<div className="text-center">
					<div className="text-sm font-medium">{t("no-matches.title")}</div>
					<div className="mt-1 text-sm text-muted-foreground">{t("no-matches.description")}</div>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-lg border bg-background-soft">
			<div className="flex items-center justify-between px-3 py-2 border-b">
				<span className="text-sm font-medium">{t("title")}</span>
				<span className="text-xs text-muted-foreground tabular-nums">
					{t("count", { count: totalCount })}
				</span>
			</div>

			<div className="h-72 min-h-0 overflow-hidden">
				<ScrollArea scrollbarGutter>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-2">
						{words.map((result) => (
							<Button
								key={result.word}
								variant="ghost"
								size="sm"
								className="justify-start gap-2 group relative"
								title={t("word-hint")}
								onClick={() => handleCopy(result.word, result.ipa)}
							>
								<span className="font-medium">{result.word}</span>
								<span className="text-muted-foreground">/{result.ipa}/</span>
								<div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
									{copiedWord === result.word ? (
										<Check className="size-3.5 text-green-500" />
									) : (
										<Copy className="size-3.5 text-muted-foreground" />
									)}
								</div>
							</Button>
						))}
					</div>
				</ScrollArea>
			</div>

			{totalCount >= limit && (
				<div className="px-3 py-2 border-t bg-background/50">
					<p className="text-xs text-center text-muted-foreground">
						{t("capped-results", { limit })}
					</p>
				</div>
			)}
		</div>
	);
}
