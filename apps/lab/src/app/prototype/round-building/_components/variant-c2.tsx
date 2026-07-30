"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * Variant C2 — "Word rail". The same refined C base, arguing for a NON-LINEAR
 * nav model — the alternative to C's stepper.
 *
 * - No Back/Next at all. A rail of the five words is the navigation: each chip
 *   shows the word and whether it has an answer, and you move by picking one.
 *   Continue and go-back are the same gesture, so neither needs a button.
 * - `Finish session` is ALWAYS available in the footer, not gated behind
 *   reaching round 5 — a learner who wants out on word 2 can take the score.
 * - Same pre-submit check as C.
 */

import { Button } from "@phonaria/ui/components/button";
import { Check, Flag } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PROTOTYPE_SESSION, ROUND_COUNT } from "../_lib/palette";
import { useSessionDraft } from "../_lib/use-session-draft";
import { FinishPanel } from "./finish-panel";
import { SoundComposer } from "./sound-composer";

export function VariantC2() {
	const [round, setRound] = useState(0);
	const [finishing, setFinishing] = useState(false);
	const { drafts, append, removeLast, removeAt, filledCount } = useSessionDraft();

	if (finishing) {
		return (
			<FinishPanel
				drafts={drafts}
				onJumpToRound={(index) => {
					setRound(index);
					setFinishing(false);
				}}
				onKeepEditing={() => setFinishing(false)}
			/>
		);
	}

	const current = PROTOTYPE_SESSION[round];

	return (
		<div className="flex flex-1 flex-col pb-28">
			{/* The rail IS the navigation */}
			<div className="border-b bg-background-soft px-4 py-3">
				<div className="mx-auto flex max-w-2xl gap-1.5 overflow-x-auto">
					{PROTOTYPE_SESSION.map((entry, index) => {
						const answered = drafts[index].length > 0;
						const isActive = index === round;

						return (
							<button
								className={cn(
									"flex flex-1 shrink-0 cursor-pointer flex-col items-start gap-0.5 rounded-lg border px-2.5 py-1.5 text-left transition-colors",
									isActive ? "border-primary bg-background" : "bg-background hover:border-primary",
								)}
								key={entry.word}
								onClick={() => setRound(index)}
								type="button"
							>
								<span className="flex items-center gap-1 text-[0.625rem] text-muted-foreground">
									{answered ? (
										<>
											<Check className="size-3 text-success" /> done
										</>
									) : (
										"empty"
									)}
								</span>
								<span
									className={cn(
										"font-display text-sm",
										isActive ? "font-semibold" : "text-muted-foreground",
									)}
								>
									{entry.word}
								</span>
							</button>
						);
					})}
				</div>
			</div>

			<div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6">
				<div className="flex flex-col items-center gap-0.5">
					<h2 className="font-bold font-display text-4xl tracking-tight">{current.word}</h2>
					<span className="text-muted-foreground text-sm">{current.syllables} syllables</span>
				</div>

				<SoundComposer
					draft={drafts[round]}
					onAppend={(id) => append(round, id)}
					onRemoveAt={(index) => removeAt(round, index)}
					onRemoveLast={() => removeLast(round)}
				/>
			</div>

			{/* Finish is always reachable */}
			<div className="fixed inset-x-0 bottom-0 border-t bg-background px-4 pt-3 pb-16">
				<div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
					<span className="text-muted-foreground text-sm">
						{filledCount} of {ROUND_COUNT} answered
					</span>
					<Button onClick={() => setFinishing(true)} size="lg">
						<Flag /> Finish session
					</Button>
				</div>
			</div>
		</div>
	);
}
