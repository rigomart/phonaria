"use client";

import { useTranscribe } from "@/hooks/use-transcribe";
import { useG2PStore } from "@/lib/transcription/g2p-store";
import {
	getVisibleSpellingSuggestion,
	type SpellingSuggestion,
} from "@/lib/transcription/spelling-suggestion";

export function DidYouMeanControl({
	suggestion,
	onAccept,
	disabled = false,
}: {
	suggestion: SpellingSuggestion;
	onAccept: () => void;
	disabled?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onAccept}
			disabled={disabled}
			className="max-w-full rounded-md px-1 py-1 text-left text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-64"
		>
			<span className="text-muted-foreground">Did you mean </span>
			{suggestion.segments.map((segment, index) => (
				<span
					key={`${index}-${segment.text}`}
					className={segment.underlined ? "underline underline-offset-2" : undefined}
				>
					{segment.text}
				</span>
			))}
		</button>
	);
}

export function DidYouMean() {
	const suggestion = useG2PStore((state) => state.currentResult?.spellingSuggestion);
	const lookupError = useG2PStore((state) => state.lookupError);
	const isTranscribing = useG2PStore((state) => state.isTranscribing);
	const { acceptSpellingSuggestion, isPending } = useTranscribe();
	const isBusy = isPending || isTranscribing;
	const visible = getVisibleSpellingSuggestion(suggestion, lookupError, isBusy);
	if (!visible) return null;

	return (
		<div className="self-start">
			<DidYouMeanControl
				suggestion={visible}
				onAccept={acceptSpellingSuggestion}
				disabled={isBusy}
			/>
		</div>
	);
}
