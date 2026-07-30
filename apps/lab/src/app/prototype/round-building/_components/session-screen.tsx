"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * The chosen design: C's page with the palette as a CENTRAL panel of BORDERED
 * KEYS, in the page flow under the field. Placement and treatment are settled —
 * the only thing still varying is how hard the consonant/vowel boundary is
 * pushed, which `separation` selects.
 */

import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
	CONSONANT_KEYS,
	type PaletteKey as PaletteKeyType,
	PROTOTYPE_SESSION,
	VOWEL_KEYS,
} from "../_lib/palette";
import { useComposer } from "../_lib/use-composer";
import { useSessionDraft } from "../_lib/use-session-draft";
import { ComposerField } from "./composer-field";
import { FinishPanel } from "./finish-panel";
import { PaletteKey } from "./palette-key";
import { BackAction, ForwardAction, RoundDots } from "./session-nav";

export type Separation = "labels" | "rule" | "tint" | "tint-labels";

/**
 * Three independent mechanisms for making the boundary visible, plus the
 * combination. Each row of the palette is already its own line, so this is only
 * about how much more than a line break the boundary deserves.
 */
const SEPARATION_MODES: Record<Separation, { labels: boolean; rule: boolean; tint: boolean }> = {
	labels: { labels: true, rule: false, tint: false },
	rule: { labels: false, rule: true, tint: false },
	tint: { labels: false, rule: false, tint: true },
	"tint-labels": { labels: true, rule: false, tint: true },
};

const GROUPS: { label: string; keys: PaletteKeyType[]; vowels: boolean }[] = [
	{ label: "Consonants", keys: CONSONANT_KEYS, vowels: false },
	{ label: "Vowels", keys: VOWEL_KEYS, vowels: true },
];

export function SessionScreen({ separation }: { separation: Separation }) {
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
	const mode = SEPARATION_MODES[separation];

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

			<div className={cn("flex flex-col items-center", mode.rule ? "gap-5" : "gap-4")}>
				{GROUPS.map((group, index) => (
					<div className="flex flex-col items-center gap-1.5" key={group.label}>
						{mode.rule && index > 0 && <span className="mb-2 h-px w-72 bg-border" />}
						{mode.labels && (
							<span className="text-muted-foreground text-xs uppercase tracking-wide">
								{group.label}
							</span>
						)}
						<PaletteRows
							keys={group.keys}
							onInsert={composer.commit}
							query={composer.query}
							tinted={mode.tint && group.vowels}
						/>
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

function PaletteRows({
	keys,
	query,
	tinted,
	onInsert,
}: {
	keys: PaletteKeyType[];
	query: string;
	tinted: boolean;
	onInsert: (id: EnglishPhonemeSymbolId) => void;
}) {
	return (
		<div className="flex max-w-lg flex-wrap justify-center gap-1">
			{keys.map((key) => (
				<PaletteKey
					className={cn(
						"size-9 rounded-md border text-lg hover:border-primary",
						tinted
							? "border-primary bg-background-strong hover:bg-background-soft"
							: "bg-background hover:bg-background-strong",
					)}
					id={key.id}
					key={key.id}
					onInsert={onInsert}
					query={query}
				/>
			))}
		</div>
	);
}
