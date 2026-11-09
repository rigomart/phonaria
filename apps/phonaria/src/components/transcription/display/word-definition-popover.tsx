import type { TargetAccent } from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { Spinner } from "@phonaria/ui/components/spinner";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Link } from "@/components/link";
import { SyntheticVoiceNote } from "@/components/synthetic-voice-note";
import { WordAudioForms } from "@/components/word-audio-forms";
import { useDefinition } from "@/hooks/use-definition";
import { buildWiktionaryEntryUrl } from "@/lib/definition/word";
import { cn } from "@/lib/utils";
import { findWordPagePath } from "@/lib/word-pages";

type WordDefinitionPopoverProps = {
	targetAccent: TargetAccent;
	word: string;
	ipa: string;
	/** The selected variant in dictionary notation; its recording plays first. */
	pronunciation: string;
};

function Attribution({ word }: { word: string }) {
	return (
		<p className="text-xs text-muted-foreground">
			Definitions from{" "}
			<a
				href={buildWiktionaryEntryUrl(word)}
				target="_blank"
				rel="noopener noreferrer"
				className="underline underline-offset-2 hover:text-foreground"
			>
				Wiktionary
			</a>
		</p>
	);
}

/** The word, linked to its page when an en-us word has one. */
function WordTitle({ targetAccent, word }: { targetAccent: TargetAccent; word: string }) {
	const href = targetAccent === "en-us" ? findWordPagePath(word) : undefined;
	const className = "text-base font-semibold font-display leading-none";
	if (!href) return <p className={className}>{word}</p>;
	return (
		<Link
			href={href}
			className={cn(
				className,
				"group/word-page inline-flex items-center gap-1 rounded-sm underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
			)}
		>
			{word}
			<span className="sr-only"> in IPA</span>
			<ArrowRight
				aria-hidden="true"
				className="size-3.5 text-muted-foreground transition-transform group-hover/word-page:translate-x-0.5 motion-reduce:transition-none"
			/>
		</Link>
	);
}

export function DefinitionBody({
	targetAccent,
	word,
	ipa,
	pronunciation,
	status,
	groups,
	errorMessage,
	onRetry,
}: {
	targetAccent: TargetAccent;
	word: string;
	ipa: string;
	pronunciation: string;
	status: ReturnType<typeof useDefinition>["status"];
	groups: ReturnType<typeof useDefinition>["groups"];
	errorMessage: string | null;
	onRetry: () => void;
}) {
	return (
		<div className="flex w-80 max-h-[min(24rem,70vh)] flex-col overflow-hidden">
			<div className="flex shrink-0 flex-col gap-2 pb-3">
				<div className="flex items-baseline justify-between gap-2">
					<WordTitle targetAccent={targetAccent} word={word} />
					{ipa ? <p className="text-sm text-muted-foreground whitespace-nowrap">/{ipa}/</p> : null}
				</div>
				<WordAudioForms targetAccent={targetAccent} word={word} pronunciation={pronunciation} />
				<SyntheticVoiceNote targetAccent={targetAccent} words={[word]} />
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

				<Attribution word={word} />
			</div>
		</div>
	);
}

export function WordDefinitionPopover({
	targetAccent,
	word,
	ipa,
	pronunciation,
}: WordDefinitionPopoverProps) {
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
			<PopoverContent sideOffset={8} className="w-auto">
				<DefinitionBody
					targetAccent={targetAccent}
					word={word}
					ipa={ipa}
					pronunciation={pronunciation}
					status={definition.status}
					groups={definition.groups}
					errorMessage={definition.errorMessage}
					onRetry={definition.retry}
				/>
			</PopoverContent>
		</Popover>
	);
}
