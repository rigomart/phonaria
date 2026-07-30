"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * `dock` — the palette is chrome, not content.
 *
 * Two tight rows welded to the bottom edge of the viewport with no card, no
 * border box and no group headings, the way a phone keyboard sits below an app.
 * The page above it is the original C, untouched: dots, big word, field. The
 * palette is always visible but never competes with the word for attention.
 */

import { useState } from "react";
import { CONSONANT_KEYS, PROTOTYPE_SESSION, VOWEL_KEYS } from "../_lib/palette";
import { useComposer } from "../_lib/use-composer";
import { useSessionDraft } from "../_lib/use-session-draft";
import { ComposerField } from "./composer-field";
import { FinishPanel } from "./finish-panel";
import { PaletteKey } from "./palette-key";
import { BackAction, ForwardAction, RoundDots } from "./session-nav";

export function VariantDock() {
	const [round, setRound] = useState(0);
	const [finishing, setFinishing] = useState(false);
	const { drafts, append, removeLast, removeAt } = useSessionDraft();
	const composer = useComposer({
		onAppend: (id) => append(round, id),
		onRemoveLast: () => removeLast(round),
	});

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
		<div className="flex flex-1 flex-col pb-44">
			<div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 px-4 py-10">
				<RoundDots drafts={drafts} onJump={setRound} round={round} />

				<div className="flex flex-col items-center gap-0.5">
					<h2 className="font-bold font-display text-5xl tracking-tight">{current.word}</h2>
					<span className="text-muted-foreground text-sm">{current.syllables} syllables</span>
				</div>

				<ComposerField
					className="w-full"
					composer={composer}
					draft={drafts[round]}
					onRemoveAt={(index) => removeAt(round, index)}
				/>

				<div className="flex w-full items-center justify-between">
					<BackAction onBack={() => setRound((r) => r - 1)} round={round} />
					<ForwardAction
						onFinish={() => setFinishing(true)}
						onNext={() => setRound((r) => r + 1)}
						round={round}
					/>
				</div>
			</div>

			{/* Keyboard chrome — no card, no labels */}
			<div className="fixed inset-x-0 bottom-0 border-t bg-background-soft px-3 pt-2 pb-16">
				<div className="mx-auto flex max-w-2xl flex-col gap-1.5">
					<div className="flex flex-wrap justify-center gap-1">
						{CONSONANT_KEYS.map((key) => (
							<PaletteKey
								className="size-9 rounded-md border bg-background text-lg hover:border-primary"
								id={key.id}
								key={key.id}
								onInsert={composer.commit}
								query={composer.query}
							/>
						))}
					</div>
					<div className="flex flex-wrap justify-center gap-1">
						{VOWEL_KEYS.map((key) => (
							<PaletteKey
								className="size-9 rounded-md border bg-background-strong text-lg hover:border-primary"
								id={key.id}
								key={key.id}
								onInsert={composer.commit}
								query={composer.query}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
