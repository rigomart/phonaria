"use client";

import { Button } from "@phonaria/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { Spinner } from "@phonaria/ui/components/spinner";
import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { useDefinition } from "@/hooks/use-definition";
import { WIKTIONARY_SITE_URL } from "@/lib/definition/contract";
import { cn } from "@/lib/utils";

type WordDefinitionPopoverProps = {
	word: string;
	ipa: string;
};

function Attribution() {
	return (
		<p className="text-xs text-muted-foreground">
			Definitions from{" "}
			<a
				href={WIKTIONARY_SITE_URL}
				target="_blank"
				rel="noopener noreferrer"
				className="underline underline-offset-2 hover:text-foreground"
			>
				Wiktionary
			</a>
		</p>
	);
}

function DefinitionBody({
	word,
	ipa,
	status,
	groups,
	errorMessage,
	onRetry,
}: {
	word: string;
	ipa: string;
	status: ReturnType<typeof useDefinition>["status"];
	groups: ReturnType<typeof useDefinition>["groups"];
	errorMessage: string | null;
	onRetry: () => void;
}) {
	return (
		<div className="flex w-80 max-h-[min(24rem,70vh)] flex-col overflow-hidden">
			<div className="flex shrink-0 items-baseline justify-between gap-2 pb-3">
				<p className="text-base font-semibold font-display leading-none">{word}</p>
				{ipa ? <p className="text-sm text-muted-foreground whitespace-nowrap">/{ipa}/</p> : null}
			</div>

			<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain">
				{status === "loading" || status === "idle" ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Spinner className="size-4" />
						Looking up definition
					</div>
				) : null}

				{status === "not_found" ? (
					<p className="text-sm text-muted-foreground">No definition found</p>
				) : null}

				{status === "error" ? (
					<div className="flex flex-col items-start gap-2">
						<p className="text-sm text-foreground">{errorMessage}</p>
						<Button variant="outline" size="sm" onClick={onRetry}>
							<RotateCcw />
							Retry
						</Button>
					</div>
				) : null}

				{status === "found"
					? groups.map((group) => (
							<div key={group.partOfSpeech} className="flex flex-col gap-1.5">
								<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
									{group.partOfSpeech}
								</p>
								<ol className="list-decimal space-y-2 pl-4">
									{group.senses.map((sense, index) => (
										<li
											key={`${group.partOfSpeech}-${index}`}
											className="text-sm leading-relaxed text-foreground"
										>
											{sense.definition}
											{sense.example ? (
												<p className="mt-0.5 text-xs italic text-muted-foreground">
													{sense.example}
												</p>
											) : null}
										</li>
									))}
								</ol>
							</div>
						))
					: null}

				<Attribution />
			</div>
		</div>
	);
}

export function WordDefinitionPopover({ word, ipa }: WordDefinitionPopoverProps) {
	const [open, setOpen] = useState(false);
	const definition = useDefinition(open ? word : null);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<button
						type="button"
						className={cn(
							"text-base md:text-lg whitespace-nowrap px-3 py-1 rounded-md",
							"text-muted-foreground cursor-pointer",
							"transition-colors duration-150",
							"hover:bg-muted hover:text-foreground",
							"data-popup-open:bg-muted data-popup-open:text-foreground",
						)}
						aria-label={`Definition of ${word}`}
					/>
				}
			>
				{word}
			</PopoverTrigger>
			<PopoverContent sideOffset={8}>
				<DefinitionBody
					word={word}
					ipa={ipa}
					status={definition.status}
					groups={definition.groups}
					errorMessage={definition.errorMessage}
					onRetry={definition.retry}
				/>
			</PopoverContent>
		</Popover>
	);
}
