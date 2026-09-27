"use client";

import { ArrowRightIcon } from "lucide-react";
import { useHydrated } from "@/hooks/use-hydrated";
import { useSubmitTranscription } from "@/hooks/use-submit-transcription";
import { useTranscriptionHistory } from "@/hooks/use-transcription-history";
import { RecentTranscriptions } from "./recent-transcriptions";

const EXAMPLES = ["Hello world", "Judge the rhythm", "She chose well", "Through thick fog"];

/**
 * Examples for a first visit, the learner's recent transcriptions after that.
 * The slot stays empty until history is read, so a returning learner never
 * sees the examples flash first; the chips are disabled until then anyway.
 */
export function EmptyState() {
	const { entries, loaded, remove, clear } = useTranscriptionHistory();

	let content = <div aria-hidden className="min-h-24" />;
	if (loaded) {
		content =
			entries.length > 0 ? (
				<RecentTranscriptions entries={entries} onRemove={remove} onClear={clear} />
			) : (
				<Examples />
			);
	}

	return (
		<div className="flex flex-col items-center px-4 pt-6 pb-8 animate-in fade-in duration-700 delay-200 fill-mode-both">
			{content}
		</div>
	);
}

function Examples() {
	const { submit, isPending } = useSubmitTranscription();
	const hydrated = useHydrated();

	const handleExampleClick = (example: string) => {
		submit(example);
	};

	return (
		<div className="w-full max-w-md space-y-4 text-center">
			<p className="text-sm text-muted-foreground font-display">Try an example</p>

			<div className="flex flex-wrap justify-center gap-2">
				{EXAMPLES.map((example, i) => (
					<button
						type="button"
						key={example}
						onClick={() => handleExampleClick(example)}
						disabled={!hydrated || isPending}
						className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-50 animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-300"
						style={{ animationDelay: `${300 + i * 75}ms` }}
					>
						<span>{example}</span>
						<ArrowRightIcon className="size-3 opacity-50" />
					</button>
				))}
			</div>
		</div>
	);
}
