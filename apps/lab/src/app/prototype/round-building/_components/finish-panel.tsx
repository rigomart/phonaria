"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * The last screen before an irreversible submit. This is the PRE-submit check
 * that belongs to #131 — the learner's final chance to revise while every answer
 * is still hidden. The POST-submit reveal (score, corrections, lesson, retry) is
 * #130's question and is stubbed here on purpose.
 */

import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import { ArrowLeft, Check, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PROTOTYPE_SESSION, ROUND_COUNT } from "../_lib/palette";
import { PhonemeChip } from "./phoneme-chip";

interface FinishPanelProps {
	drafts: EnglishPhonemeSymbolId[][];
	onJumpToRound: (round: number) => void;
	onKeepEditing: () => void;
}

export function FinishPanel({ drafts, onJumpToRound, onKeepEditing }: FinishPanelProps) {
	const [submitted, setSubmitted] = useState(false);

	const blanks = drafts.reduce((count, draft) => (draft.length === 0 ? count + 1 : count), 0);
	const answered = ROUND_COUNT - blanks;

	if (submitted) {
		return (
			<div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 px-4 py-16 text-center">
				<Check className="size-8 text-success" />
				<h2 className="font-bold font-display text-2xl tracking-tight">Session submitted</h2>
				<p className="max-w-md text-muted-foreground text-sm">
					The reveal — score, phoneme-level corrections, the schwa lesson, and retry — is what{" "}
					<a
						className="underline underline-offset-4"
						href="https://github.com/rigomart/phonaria/issues/130"
						rel="noreferrer"
						target="_blank"
					>
						#130
					</a>{" "}
					decides. This prototype deliberately stops here.
				</p>
				<Button onClick={() => setSubmitted(false)} variant="outline">
					<ArrowLeft /> Back to the check
				</Button>
			</div>
		);
	}

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-8">
			<div className="flex flex-col gap-1">
				<h2 className="font-bold font-display text-2xl tracking-tight">Ready to submit?</h2>
				<p className="text-muted-foreground text-sm">
					{blanks === 0
						? "All five words answered. Nothing is graded until you submit — this is your last chance to change an answer."
						: `${answered} of ${ROUND_COUNT} answered. Blank words are scored as wrong, so it is worth a guess.`}
				</p>
			</div>

			<ul className="flex flex-col gap-2">
				{PROTOTYPE_SESSION.map((entry, index) => {
					const draft = drafts[index];
					const isBlank = draft.length === 0;

					return (
						<li key={entry.word}>
							<div
								className={cn(
									"flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:gap-4",
									isBlank ? "border-warning bg-background" : "bg-background",
								)}
							>
								<div className="flex w-40 shrink-0 items-baseline gap-2">
									<span className="text-muted-foreground text-xs">{index + 1}</span>
									<span className="font-display font-semibold">{entry.word}</span>
								</div>

								<div className="flex flex-1 flex-wrap items-center gap-1.5">
									{isBlank ? (
										<span className="flex items-center gap-1.5 text-sm text-warning">
											<TriangleAlert className="size-4" /> No answer
										</span>
									) : (
										draft.map((id, chipIndex) => (
											<PhonemeChip className="h-9" id={id} key={`${id}-${chipIndex}`} />
										))
									)}
								</div>

								<Button onClick={() => onJumpToRound(index)} size="sm" variant="outline">
									{isBlank ? "Answer it" : "Change"}
								</Button>
							</div>
						</li>
					);
				})}
			</ul>

			<div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
				<Button onClick={onKeepEditing} variant="ghost">
					<ArrowLeft /> Keep editing
				</Button>
				<Button onClick={() => setSubmitted(true)} size="lg">
					{blanks === 0 ? "Submit session" : `Submit with ${blanks} blank${blanks > 1 ? "s" : ""}`}
				</Button>
			</div>
		</div>
	);
}
