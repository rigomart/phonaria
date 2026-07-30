"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * PLACEMENT: central. The palette sits in the page flow directly under the
 * field, so the whole session — word, answer, sounds, navigation — is one
 * centred column that never touches the viewport edges.
 *
 * Trade-off against `bottom`: the palette is part of the composition, so it
 * shares the word's visual space; but nothing is pinned, so the page reads as a
 * single object and there is no fixed chrome to collide with Lab's footer.
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

export function VariantCenter({ treatment }: { treatment: PaletteTreatment }) {
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
		<div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-7 px-4 py-12">
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

			{/* In the flow. Consonants and vowels break on their own lines so the
			    wrap reads as ordered without needing headings. */}
			<div className="flex flex-col items-center gap-3">
				{[CONSONANT_KEYS, VOWEL_KEYS].map((group) => (
					<div
						className="flex max-w-lg flex-wrap justify-center gap-x-1 gap-y-0.5"
						key={group[0].id}
					>
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

			<div className="flex w-full items-center justify-between">
				<BackAction onBack={() => setRound((r) => r - 1)} round={round} />
				<ForwardAction
					onFinish={() => setFinishing(true)}
					onNext={() => setRound((r) => r + 1)}
					round={round}
				/>
			</div>
		</div>
	);
}
