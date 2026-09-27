"use client";

import { Button } from "@phonaria/ui/components/button";
import { X } from "lucide-react";
import { useState } from "react";
import { useSubmitTranscription } from "@/hooks/use-submit-transcription";
import { useTranscriptionHistory } from "@/hooks/use-transcription-history";

const COLLAPSED_COUNT = 5;

/**
 * The learner's own past transcriptions, from this browser's storage. Renders
 * nothing until the stored history is read, so the server HTML never has it.
 */
export function RecentTranscriptions() {
	const { entries, remove, clear } = useTranscriptionHistory();
	const { submit, isPending } = useSubmitTranscription();
	const [expanded, setExpanded] = useState(false);
	const [confirmingClear, setConfirmingClear] = useState(false);

	if (entries.length === 0) return null;

	const visible = expanded ? entries : entries.slice(0, COLLAPSED_COUNT);
	const hiddenCount = entries.length - visible.length;

	const handleClear = () => {
		clear();
		setConfirmingClear(false);
		setExpanded(false);
	};

	return (
		<section
			aria-labelledby="recent-transcriptions-heading"
			className="mt-auto w-full max-w-sm space-y-1 animate-in fade-in fill-mode-both duration-300"
		>
			<h2
				id="recent-transcriptions-heading"
				className="text-center text-xs text-muted-foreground font-display"
			>
				Recent
			</h2>

			<ul>
				{visible.map((entry) => (
					<li key={entry.text} className="flex items-center gap-1">
						<button
							type="button"
							onClick={() => submit(entry.text)}
							disabled={isPending}
							className="flex min-w-0 flex-1 items-baseline gap-3 rounded-md px-2 py-1 text-left text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
						>
							<span className="truncate">{entry.text}</span>
							{entry.ipa ? <span className="ml-auto shrink truncate">/{entry.ipa}/</span> : null}
						</button>
						<Button
							variant="ghost"
							size="icon-xs"
							className="text-muted-foreground hover:text-foreground"
							aria-label={`Remove "${entry.text}" from history`}
							onClick={() => remove(entry.text)}
						>
							<X />
						</Button>
					</li>
				))}
			</ul>

			<div className="flex min-h-7 items-center justify-between gap-2 px-2 text-xs text-muted-foreground">
				{hiddenCount > 0 || expanded ? (
					<Button
						variant="link"
						size="xs"
						className="px-0 text-muted-foreground hover:text-foreground"
						onClick={() => setExpanded(!expanded)}
					>
						{expanded ? "Show fewer" : `Show all (${entries.length})`}
					</Button>
				) : (
					<span />
				)}

				{confirmingClear ? (
					<span className="flex items-center gap-1">
						Clear all history?
						<Button variant="ghost" size="xs" onClick={() => setConfirmingClear(false)}>
							Cancel
						</Button>
						<Button variant="destructive-outline" size="xs" onClick={handleClear}>
							Clear
						</Button>
					</span>
				) : (
					<Button
						variant="ghost"
						size="xs"
						className="text-muted-foreground hover:text-foreground"
						onClick={() => setConfirmingClear(true)}
					>
						Clear history
					</Button>
				)}
			</div>
		</section>
	);
}
