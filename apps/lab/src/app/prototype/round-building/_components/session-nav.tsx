"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * Navigation is FUNCTIONALLY IDENTICAL in all four variants on purpose — back,
 * next word, finish on the last word, plus a clickable progress indicator — so
 * the only thing they disagree about is the palette. Where these two pieces sit
 * is each variant's call.
 */

import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import { ArrowLeft, ArrowRight, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROTOTYPE_SESSION, ROUND_COUNT } from "../_lib/palette";

export function RoundDots({
	drafts,
	round,
	onJump,
	className,
}: {
	drafts: EnglishPhonemeSymbolId[][];
	round: number;
	onJump: (index: number) => void;
	className?: string;
}) {
	return (
		<div className={cn("flex gap-1", className)}>
			{drafts.map((draft, index) => (
				<button
					aria-label={`Go to word ${index + 1}`}
					className={cn(
						"h-1 w-7 cursor-pointer rounded-full transition-colors",
						index === round
							? "bg-primary"
							: draft.length > 0
								? "bg-success"
								: "bg-background-strong",
					)}
					key={PROTOTYPE_SESSION[index].word}
					onClick={() => onJump(index)}
					type="button"
				/>
			))}
		</div>
	);
}

export function BackAction({ round, onBack }: { round: number; onBack: () => void }) {
	return (
		<Button disabled={round === 0} onClick={onBack} variant="ghost">
			<ArrowLeft /> Back
		</Button>
	);
}

export function ForwardAction({
	round,
	onNext,
	onFinish,
}: {
	round: number;
	onNext: () => void;
	onFinish: () => void;
}) {
	if (round === ROUND_COUNT - 1) {
		return (
			<Button onClick={onFinish}>
				<Flag /> Finish session
			</Button>
		);
	}

	return (
		<Button onClick={onNext}>
			Next word <ArrowRight />
		</Button>
	);
}
