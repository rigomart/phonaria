"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * `strip` — the palette costs one line.
 *
 * All 40 sounds live in a single horizontally scrolling row welded to the bottom
 * of the field, with hairline dividers between consonants, vowels and
 * diphthongs. It reads as part of the input rather than a second surface, so the
 * page keeps the original C's proportions almost exactly. The bet: search does
 * the finding, and the strip only needs to prove the sounds are all there.
 */

import { useState } from "react";
import {
	CONSONANT_KEYS,
	DIPHTHONG_KEYS,
	MONOPHTHONG_KEYS,
	PROTOTYPE_SESSION,
} from "../_lib/palette";
import { useComposer } from "../_lib/use-composer";
import { useSessionDraft } from "../_lib/use-session-draft";
import { ComposerField } from "./composer-field";
import { FinishPanel } from "./finish-panel";
import { PaletteKey } from "./palette-key";
import { BackAction, ForwardAction, RoundDots } from "./session-nav";

const SEGMENTS = [CONSONANT_KEYS, MONOPHTHONG_KEYS, DIPHTHONG_KEYS];

export function VariantStrip() {
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
		<div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-6 px-4 py-12">
			<RoundDots drafts={drafts} onJump={setRound} round={round} />

			<div className="flex flex-col items-center gap-0.5">
				<h2 className="font-bold font-display text-5xl tracking-tight">{current.word}</h2>
				<span className="text-muted-foreground text-sm">{current.syllables} syllables</span>
			</div>

			<div className="w-full">
				<ComposerField
					composer={composer}
					draft={drafts[round]}
					onRemoveAt={(index) => removeAt(round, index)}
				/>

				{/* One line, all 40. The right-edge fade is the only hint that it
				    scrolls — whether that is enough is the thing to judge here. */}
				<div className="relative mt-1.5">
					<div className="flex gap-2 overflow-x-auto rounded-xl border bg-background-soft px-2 py-1.5">
						{SEGMENTS.map((segment, segmentIndex) => (
							<div className="flex items-center gap-0.5" key={segment[0].id}>
								{segmentIndex > 0 && <span className="mr-1.5 h-6 w-px shrink-0 bg-border" />}
								{segment.map((key) => (
									<PaletteKey
										className="size-8 shrink-0 rounded-md text-base hover:bg-background-strong"
										id={key.id}
										key={key.id}
										onInsert={composer.commit}
										query={composer.query}
									/>
								))}
							</div>
						))}
					</div>
					<div className="pointer-events-none absolute inset-y-px right-px w-10 rounded-r-xl bg-gradient-to-l from-background-soft to-transparent" />
				</div>
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
