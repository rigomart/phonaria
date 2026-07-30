"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * PLACEMENT: bottom. The palette is pinned to the bottom edge as chrome, the way
 * a phone keyboard sits below an app, so it is out of the word's composition
 * entirely and always in the same place regardless of answer length.
 *
 * Trade-off against `center`: the word and field get the whole upper page and the
 * palette never moves; but it is fixed furniture that has to coexist with Lab's
 * own footer, and it claims a fixed slice of every viewport.
 */

import { useState } from "react";
import { CONSONANT_KEYS, PROTOTYPE_SESSION, VOWEL_KEYS } from "../_lib/palette";
import { useComposer } from "../_lib/use-composer";
import { useSessionDraft } from "../_lib/use-session-draft";
import { ComposerField } from "./composer-field";
import { FinishPanel } from "./finish-panel";
import { PaletteKey } from "./palette-key";
import { type PaletteTreatment, TREATMENT_KEY_CLASS } from "./palette-treatment";
import { BackAction, ForwardAction, RoundDots } from "./session-nav";

export function VariantBottom({ treatment }: { treatment: PaletteTreatment }) {
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
		<div className="flex flex-1 flex-col pb-52">
			<div className="mx-auto flex w-full max-w-xl flex-col items-center gap-7 px-4 py-12">
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

			{/* Pinned chrome. Same container for both treatments so only the keys
			    differ between bottom-ghost and bottom-keys. */}
			<div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background-soft px-3 pt-2.5 pb-16">
				<div className="mx-auto flex max-w-2xl flex-col gap-1.5">
					{[CONSONANT_KEYS, VOWEL_KEYS].map((group) => (
						<div className="flex flex-wrap justify-center gap-1" key={group[0].id}>
							{group.map((key) => (
								<PaletteKey
									className={TREATMENT_KEY_CLASS[treatment]}
									id={key.id}
									key={key.id}
									onInsert={composer.commit}
									query={composer.query}
								/>
							))}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
