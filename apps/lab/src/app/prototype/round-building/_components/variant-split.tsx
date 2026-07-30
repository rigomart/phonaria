"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * `split` — the palette stops fighting the word for vertical space.
 *
 * Two columns on desktop: the word and the field own the left, the palette is a
 * quiet reference rail down the right, grouped by manner the way Lab's chart is.
 * Nothing pushes the word around and the page never scrolls. Stacks on mobile,
 * which is the honest weakness — on a phone this becomes `dock` with a card.
 */

import { Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
	CONSONANT_KEYS,
	DIPHTHONG_KEYS,
	MONOPHTHONG_KEYS,
	type PaletteKey as PaletteKeyType,
	PROTOTYPE_SESSION,
} from "../_lib/palette";
import { useComposer } from "../_lib/use-composer";
import { useSessionDraft } from "../_lib/use-session-draft";
import { ComposerField } from "./composer-field";
import { FinishPanel } from "./finish-panel";
import { PaletteKey } from "./palette-key";
import { BackAction, ForwardAction, RoundDots } from "./session-nav";

const GROUPS: { label: string; keys: PaletteKeyType[] }[] = [
	{ label: "Consonants", keys: CONSONANT_KEYS },
	{ label: "Vowels", keys: MONOPHTHONG_KEYS },
	{ label: "Diphthongs", keys: DIPHTHONG_KEYS },
];

export function VariantSplit() {
	const [round, setRound] = useState(0);
	const [finishing, setFinishing] = useState(false);
	const [explain, setExplain] = useState(false);
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
		<div className="mx-auto grid w-full max-w-5xl flex-1 gap-8 px-4 py-10 lg:grid-cols-[1fr_18rem]">
			{/* Left — the word and the answer */}
			<div className="flex flex-col items-center gap-6 lg:pt-10">
				<RoundDots drafts={drafts} onJump={setRound} round={round} />

				<div className="flex flex-col items-center gap-0.5">
					<h2 className="font-bold font-display text-5xl tracking-tight">{current.word}</h2>
					<span className="text-muted-foreground text-sm">{current.syllables} syllables</span>
				</div>

				<ComposerField
					className="w-full max-w-lg"
					composer={composer}
					draft={drafts[round]}
					onRemoveAt={(index) => removeAt(round, index)}
				/>

				<div className="flex w-full max-w-lg items-center justify-between">
					<BackAction onBack={() => setRound((r) => r - 1)} round={round} />
					<ForwardAction
						onFinish={() => setFinishing(true)}
						onNext={() => setRound((r) => r + 1)}
						round={round}
					/>
				</div>
			</div>

			{/* Right — reference rail */}
			<aside className="flex h-fit flex-col gap-4 rounded-xl border bg-background-soft p-4 lg:sticky lg:top-6">
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground text-xs">Sounds</span>
					<button
						aria-label="Tap sounds for details instead of adding them"
						aria-pressed={explain}
						className={cn(
							"flex size-6 cursor-pointer items-center justify-center rounded-md border transition-colors",
							explain
								? "border-primary bg-primary text-primary-foreground"
								: "bg-background text-muted-foreground",
						)}
						onClick={() => setExplain((value) => !value)}
						type="button"
					>
						<Info className="size-3.5" />
					</button>
				</div>

				{GROUPS.map((group) => (
					<div className="flex flex-col gap-1.5" key={group.label}>
						<span className="text-muted-foreground text-xs">{group.label}</span>
						<div className="flex flex-wrap gap-1">
							{group.keys.map((key) => (
								<PaletteKey
									className="size-8 rounded-md border bg-background text-base hover:border-primary"
									explain={explain}
									id={key.id}
									key={key.id}
									onInsert={composer.commit}
									query={composer.query}
								/>
							))}
						</div>
					</div>
				))}
			</aside>
		</div>
	);
}
