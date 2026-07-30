"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * Variant C — "Stepper". The refined C base, arguing for a LINEAR nav model.
 *
 * - The IPA panel is always visible (see sound-composer.tsx).
 * - There is no "review all answers" button. Navigation is one primary action —
 *   `Next word`, which becomes `Finish session` on the last round — plus a
 *   secondary `Back`. The dot strip is clickable for jumping, but the guided
 *   path is forward.
 * - `Finish session` leads to the pre-submit check, not straight to grading.
 */

import { Button } from "@phonaria/ui/components/button";
import { ArrowLeft, ArrowRight, Flag } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PROTOTYPE_SESSION, ROUND_COUNT } from "../_lib/palette";
import { useSessionDraft } from "../_lib/use-session-draft";
import { FinishPanel } from "./finish-panel";
import { SoundComposer } from "./sound-composer";

export function VariantC() {
	const [round, setRound] = useState(0);
	const [finishing, setFinishing] = useState(false);
	const { drafts, append, removeLast, removeAt } = useSessionDraft();

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
	const isLast = round === ROUND_COUNT - 1;

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 pb-28">
			{/* Progress — clickable, but not the primary way to move */}
			<div className="flex flex-col items-center gap-1.5">
				<span className="text-muted-foreground text-xs">
					Word {round + 1} of {ROUND_COUNT}
				</span>
				<div className="flex gap-1">
					{drafts.map((draft, index) => (
						<button
							aria-label={`Go to word ${index + 1}`}
							className={cn(
								"h-1.5 w-8 cursor-pointer rounded-full transition-colors",
								index === round
									? "bg-primary"
									: draft.length > 0
										? "bg-success"
										: "bg-background-strong",
							)}
							key={PROTOTYPE_SESSION[index].word}
							onClick={() => setRound(index)}
							type="button"
						/>
					))}
				</div>
			</div>

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

			{/* One primary action, one way back */}
			<div className="fixed inset-x-0 bottom-0 border-t bg-background px-4 pt-3 pb-16">
				<div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
					<Button disabled={round === 0} onClick={() => setRound((r) => r - 1)} variant="ghost">
						<ArrowLeft /> Back
					</Button>
					{isLast ? (
						<Button onClick={() => setFinishing(true)} size="lg">
							<Flag /> Finish session
						</Button>
					) : (
						<Button onClick={() => setRound((r) => r + 1)} size="lg">
							Next word <ArrowRight />
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
