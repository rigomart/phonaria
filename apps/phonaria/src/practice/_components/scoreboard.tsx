"use client";

/**
 * The post-submit reveal (#146): word score as the headline, every row fully
 * expanded and one way out. Blank rows show
 * CMU's first listing — never the scorer's closest variant, which a blank
 * answer would bias toward the shortest.
 */
import { Button } from "@phonaria/ui/components/button";
import { Check, X } from "lucide-react";
import type { Ref } from "react";
import { normalizeAcceptedVariants } from "@/lib/practice/scoring";
import type { TopicDefinition } from "@/lib/practice/topics/types";
import {
	selectReviewRows,
	selectSoundAccuracy,
	selectTopicSoundTally,
	selectWordsCorrect,
	usePracticeSessionStore,
} from "../_store/practice-session-store";
import { AlignmentDiff, GlyphSequence } from "./alignment-row";
import { WordAudio } from "./word-audio";

export function Scoreboard({
	topic,
	onNewSession,
	headingRef,
}: {
	topic: TopicDefinition;
	onNewSession: () => void;
	/** Lets the reveal effect land keyboard/AT focus on the results headline. */
	headingRef?: Ref<HTMLHeadingElement>;
}) {
	const rounds = usePracticeSessionStore((state) => state.rounds);
	const scores = usePracticeSessionStore((state) => state.scores);
	if (!scores) return null;

	const rows = selectReviewRows(rounds, scores);
	const accuracy = selectSoundAccuracy(scores);
	const tally = selectTopicSoundTally(scores, topic.topicSounds);
	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none">
			<div className="flex flex-col items-center gap-1 text-center">
				<span className="text-muted-foreground text-sm">Session complete</span>
				<h1
					className="font-bold font-display text-5xl tracking-tight outline-none"
					ref={headingRef}
					tabIndex={-1}
				>
					{selectWordsCorrect(scores)} of {scores.length}
				</h1>
				<span className="text-muted-foreground text-sm">dictionary matches</span>
			</div>

			<dl className="flex justify-center gap-6 text-center text-sm">
				<div className="flex flex-col">
					<dt className="order-last text-muted-foreground text-xs">sound accuracy</dt>
					<dd className="font-semibold text-lg">
						{accuracy === null ? "—" : `${Math.round(accuracy * 100)}%`}
					</dd>
				</div>
				<div className="flex flex-col">
					<dt className="order-last text-muted-foreground text-xs">
						{topic.display.topicStatLabel}
					</dt>
					<dd className="font-semibold text-lg">
						{tally.matched} of {tally.total}
					</dd>
				</div>
			</dl>

			<ul className="flex flex-col gap-2">
				{rows.map(({ round, score }) => {
					const blank = round.sequence.length === 0;
					const accepted = blank
						? normalizeAcceptedVariants([...round.word.variants])[0]
						: score.reference;

					return (
						<li
							className="flex flex-col gap-2 rounded-xl border bg-background p-3"
							key={round.word.word}
						>
							<div className="flex items-center gap-2">
								{score.correct ? (
									<Check
										aria-label="Matches dictionary"
										className="size-5 shrink-0 text-success"
										role="img"
									/>
								) : (
									<X
										aria-label={blank ? "No answer" : "Differs from dictionary"}
										className="size-5 shrink-0 text-destructive"
										role="img"
									/>
								)}
								<span className="font-display font-semibold">{round.word.word}</span>
								<WordAudio word={round.word.word} />
								{blank && (
									<span className="ml-auto text-warning-foreground text-xs">No answer</span>
								)}
							</div>

							{blank ? (
								<GlyphSequence label="Dictionary" sounds={accepted} />
							) : (
								<AlignmentDiff ops={score.ops} />
							)}

							{blank && (
								<p className="text-muted-foreground text-xs">Dictionary reference for this word.</p>
							)}
						</li>
					);
				})}
			</ul>

			<div className="flex justify-center">
				<Button onClick={onNewSession} size="lg">
					New session
				</Button>
			</div>
		</div>
	);
}
