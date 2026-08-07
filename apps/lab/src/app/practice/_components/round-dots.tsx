"use client";

/**
 * Five dots: progress and jump target in one control (#140). Current, answered
 * and empty are three states, so the label says which — colour alone would not.
 */
import { cn } from "@/lib/utils";
import type { PracticeRound } from "../_store/practice-session-store";

interface RoundDotsProps {
	rounds: readonly PracticeRound[];
	currentIndex: number;
	onJump: (index: number) => void;
}

export function RoundDots({ rounds, currentIndex, onJump }: RoundDotsProps) {
	return (
		<div className="flex gap-1">
			{rounds.map((round, index) => {
				const isCurrent = index === currentIndex;
				const isAnswered = round.sequence.length > 0;
				const state = isCurrent ? "current" : isAnswered ? "answered" : "no answer yet";

				return (
					<button
						aria-current={isCurrent ? "step" : undefined}
						aria-label={`Word ${index + 1} of ${rounds.length}, ${round.word.word} — ${state}`}
						// The centered `after` overlay widens the touch target on coarse
						// pointers (same pattern as the shared Button): 44px tall — the
						// row is vertically clear — but clamped to the 40px horizontal
						// pitch (w-9 + gap-1) so adjacent dots' overlays don't overlap
						// and steal each other's taps.
						className="relative flex h-8 w-9 cursor-pointer items-center justify-center rounded-md outline-none pointer-coarse:after:-translate-x-1/2 pointer-coarse:after:-translate-y-1/2 pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:left-1/2 pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-10 focus-visible:ring-2 focus-visible:ring-ring"
						key={round.word.word}
						onClick={() => onJump(index)}
						type="button"
					>
						<span
							className={cn(
								// Size carries the current word as well as colour does.
								"rounded-full transition-colors motion-reduce:transition-none",
								isCurrent ? "size-3 bg-primary" : "size-2.5",
								!isCurrent && (isAnswered ? "bg-success" : "bg-border"),
							)}
						/>
					</button>
				);
			})}
		</div>
	);
}
