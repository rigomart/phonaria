"use client";

import { ArrowRightIcon, Lightbulb } from "lucide-react";
import { useHydrated } from "@/hooks/use-hydrated";
import { useSubmitTranscription } from "@/hooks/use-submit-transcription";
import { useTranscriptionHistory } from "@/hooks/use-transcription-history";
import { TRANSCRIPTION_EXAMPLES } from "@/lib/transcription/examples";
import { PhraseList, PhraseSectionHeader } from "./phrase-list";
import { RecentTranscriptions } from "./recent-transcriptions";

/**
 * A first visit gets example chips. With history, examples and recent
 * transcriptions sit side by side, recent first on narrow screens. The slot
 * stays empty until history is read, so the chips never flash before the
 * columns; they are disabled until then anyway.
 */
export function EmptyState() {
	const { entries, loaded, remove, clear } = useTranscriptionHistory();

	let content = <div aria-hidden className="min-h-24" />;
	if (loaded && entries.length === 0) {
		content = <ExampleChips />;
	} else if (loaded) {
		content = (
			<div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
				<ExampleList />
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

function ExampleChips() {
	const { submit, isPending } = useSubmitTranscription();
	const hydrated = useHydrated();

	return (
		<div className="mx-auto w-full max-w-md space-y-4 text-center">
			<p className="text-sm text-muted-foreground font-display">Try an example</p>

			<div className="flex flex-wrap justify-center gap-2">
				{TRANSCRIPTION_EXAMPLES.map(({ text }, i) => (
					<button
						type="button"
						key={text}
						onClick={() => submit(text)}
						disabled={!hydrated || isPending}
						className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-50 animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-300"
						style={{ animationDelay: `${300 + i * 75}ms` }}
					>
						<span>{text}</span>
						<ArrowRightIcon className="size-3 opacity-50" />
					</button>
				))}
			</div>
		</div>
	);
}

function ExampleList() {
	const { submit, isPending } = useSubmitTranscription();

	return (
		<section
			aria-labelledby="transcription-examples-heading"
			className="space-y-2 animate-in fade-in fill-mode-both duration-300"
		>
			<PhraseSectionHeader
				id="transcription-examples-heading"
				icon={<Lightbulb aria-hidden />}
				title="Examples"
			/>
			<PhraseList phrases={TRANSCRIPTION_EXAMPLES} onSelect={submit} disabled={isPending} />
		</section>
	);
}
