"use client";

import { Button } from "@phonaria/ui/components/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@phonaria/ui/components/empty";
import { ScrollArea } from "@phonaria/ui/components/scroll-area";
import { Spinner } from "@phonaria/ui/components/spinner";
import { useTranslations } from "next-intl";

interface FindBySoundResultsProps {
	words: string[];
	totalCount: number;
	isLoading: boolean;
	isError: boolean;
	hasSelection: boolean;
}

export function FindBySoundResults({
	words,
	totalCount,
	isLoading,
	isError,
	hasSelection,
}: FindBySoundResultsProps) {
	const t = useTranslations("find-by-sound-page.results");

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
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 p-2">
						{words.map((word) => (
							<Button
								key={word}
								variant="ghost"
								size="sm"
								className="justify-start font-medium"
								title={t("word-hint")}
							>
								{word}
							</Button>
						))}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
