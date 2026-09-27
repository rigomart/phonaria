"use client";

import { ArrowRightIcon, Lightbulb } from "lucide-react";
import { useHydrated } from "@/hooks/use-hydrated";
import { useSubmitTranscription } from "@/hooks/use-submit-transcription";
import { useTranscriptionHistory } from "@/hooks/use-transcription-history";
import { cn } from "@/lib/utils";
import { PhraseSectionHeader } from "./phrase-list";
import { RecentTranscriptions } from "./recent-transcriptions";

const EXAMPLES = ["Hello world", "Judge the rhythm", "She chose well", "Through thick fog"];

/**
 * A first visit gets centered example chips. With history, the chips move to a
 * left column and recent transcriptions fill the right, recent first on narrow
 * screens. Chips versus a list keeps suggestions apart from the learner's own
 * words. The slot stays empty until history is read, so the centered chips
 * never flash before the columns; they are disabled until then anyway.
 */
export function EmptyState() {
	const { entries, loaded, remove, clear } = useTranscriptionHistory();

	let content = <div aria-hidden className="min-h-24" />;
	if (loaded && entries.length === 0) {
		content = (
			<div className="mx-auto w-full max-w-md space-y-4 text-center">
				<p className="text-sm text-muted-foreground font-display">Try an example</p>
				<ExampleChips className="justify-center" />
			</div>
		);
	} else if (loaded) {
		content = (
			<div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
				<section aria-labelledby="transcription-examples-heading" className="space-y-2">
					<PhraseSectionHeader
						id="transcription-examples-heading"
						icon={<Lightbulb aria-hidden />}
						title="Examples"
					/>
					<ExampleChips className="px-2.5 sm:flex-col sm:items-start" />
				</section>
				<RecentTranscriptions
					entries={entries}
					onRemove={remove}
					onClear={clear}
					className="max-sm:order-first"
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center pt-6 pb-8 animate-in fade-in duration-700 delay-200 fill-mode-both">
			<div className="w-full max-w-2xl px-4">{content}</div>
		</div>
	);
}

function ExampleChips({ className }: { className?: string }) {
	const { submit, isPending } = useSubmitTranscription();
	const hydrated = useHydrated();

	return (
		<div className={cn("flex flex-wrap gap-2", className)}>
			{EXAMPLES.map((example, i) => (
				<button
					type="button"
					key={example}
					onClick={() => submit(example)}
					disabled={!hydrated || isPending}
					className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-50 animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-300"
					style={{ animationDelay: `${300 + i * 75}ms` }}
				>
					<span>{example}</span>
					<ArrowRightIcon className="size-3 opacity-50" />
				</button>
			))}
		</div>
	);
}
