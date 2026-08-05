"use client";

/**
 * One word at a time on a calm centred page: the written word is the largest
 * thing on screen, the dots are both progress and jump target, and everything
 * sits in one column in page flow — nothing pinned to the viewport (#140).
 */
import { Button } from "@phonaria/ui/components/button";
import { ArrowLeft, ArrowRight, Flag } from "lucide-react";
import { usePracticeSessionStore } from "../_store/practice-session-store";
import { RoundDots } from "./round-dots";
import { SoundComposer } from "./sound-composer";

export function RoundBuilder() {
	const rounds = usePracticeSessionStore((state) => state.rounds);
	const currentIndex = usePracticeSessionStore((state) => state.currentIndex);
	const goToRound = usePracticeSessionStore((state) => state.goToRound);
	const nextRound = usePracticeSessionStore((state) => state.nextRound);
	const prevRound = usePracticeSessionStore((state) => state.prevRound);
	const openCheck = usePracticeSessionStore((state) => state.openCheck);
	const appendSound = usePracticeSessionStore((state) => state.appendSound);
	const removeSoundAt = usePracticeSessionStore((state) => state.removeSoundAt);

	const round = rounds[currentIndex];
	if (!round) return null;

	const isLastRound = currentIndex === rounds.length - 1;
	const syllables = round.word.syllableCount;

	return (
		<div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-7 px-4 py-12 animate-in fade-in duration-500 motion-reduce:animate-none">
			<RoundDots currentIndex={currentIndex} onJump={goToRound} rounds={rounds} />

			<div className="flex flex-col items-center gap-0.5">
				<h1 className="font-bold font-display text-5xl tracking-tight">{round.word.word}</h1>
				<p className="text-muted-foreground text-sm">
					{syllables} {syllables === 1 ? "syllable" : "syllables"}
				</p>
			</div>

			{/* Remounting per word clears the search and returns focus to the field. */}
			<SoundComposer
				key={currentIndex}
				onAppend={appendSound}
				onRemoveAt={removeSoundAt}
				sequence={round.sequence}
			/>

			<div className="flex w-full items-center justify-between">
				<Button disabled={currentIndex === 0} onClick={prevRound} variant="ghost">
					<ArrowLeft /> Back
				</Button>
				{isLastRound ? (
					<Button onClick={openCheck}>
						<Flag /> Finish session
					</Button>
				) : (
					<Button onClick={nextRound}>
						Next word <ArrowRight />
					</Button>
				)}
			</div>
		</div>
	);
}
