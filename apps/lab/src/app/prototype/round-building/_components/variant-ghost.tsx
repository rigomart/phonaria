"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * `ghost` — the palette is present but recessed.
 *
 * No card, no border, no background, no group headings: just the 40 glyphs in a
 * loose centred wrap at low contrast, coming forward on hover and when search
 * matches them. The word and the field keep all the visual weight, which is what
 * made the original C feel calm.
 *
 * This is also the only variant with NO explain affordance — assistance comes
 * from the chips you placed and from the search results' labels. It is here to
 * test whether the explain toggle is needed at all.
 */

import { useState } from "react";
import { CONSONANT_KEYS, PROTOTYPE_SESSION, VOWEL_KEYS } from "../_lib/palette";
import { useComposer } from "../_lib/use-composer";
import { useSessionDraft } from "../_lib/use-session-draft";
import { ComposerField } from "./composer-field";
import { FinishPanel } from "./finish-panel";
import { PaletteKey } from "./palette-key";
import { BackAction, ForwardAction, RoundDots } from "./session-nav";

export function VariantGhost() {
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

			{/* Recessed — glyphs only. Consonants and vowels break on their own lines
			    so the wrap reads as ordered without needing headings. */}
			<div className="flex flex-col items-center gap-3">
				{[CONSONANT_KEYS, VOWEL_KEYS].map((group) => (
					<div
						className="flex max-w-md flex-wrap justify-center gap-x-1 gap-y-0.5"
						key={group[0].id}
					>
						{group.map((key) => (
							<PaletteKey
								className="size-8 rounded-md text-lg text-muted-foreground hover:bg-background-soft hover:text-foreground"
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
