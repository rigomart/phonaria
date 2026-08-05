"use client";

/**
 * Temporary scaffolding so the session loop is drivable while the designed
 * reveal lands (#146). Drives the store only, so replacing it should need no
 * store changes.
 */
import { PhonemeIpaMap, type PhonemeSymbolId } from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import type { TopicDefinition } from "@/lib/practice/topics/types";
import {
	selectReviewRows,
	selectSoundAccuracy,
	selectTopicSoundTally,
	selectWordsCorrect,
	usePracticeSessionStore,
} from "../_store/practice-session-store";

/** Sequences are plain strings through the scorer, so don't trust the cast. */
function toIpa(sound: string): string {
	return PhonemeIpaMap[sound as PhonemeSymbolId] ?? sound;
}

export function ScoreboardScaffold({
	topic,
	onNewSession,
}: {
	topic: TopicDefinition;
	onNewSession: () => void;
}) {
	const rounds = usePracticeSessionStore((state) => state.rounds);
	const scores = usePracticeSessionStore((state) => state.scores);
	if (!scores) return null;

	const accuracy = selectSoundAccuracy(scores);
	const topicTally = selectTopicSoundTally(scores, topic.topicSounds);
	const topicIpa = topic.topicSounds.map(toIpa).join(", ");
	const rows = selectReviewRows(rounds, scores);

	return (
		<div className="flex flex-1 flex-col items-center justify-center bg-background p-4 animate-in fade-in duration-500 sm:p-6">
			<div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
				<h1 className="font-bold font-display text-2xl tracking-tight sm:text-3xl">
					{selectWordsCorrect(scores)} of {scores.length} words correct
				</h1>
				<div className="flex items-center gap-6 text-muted-foreground text-sm">
					<span>{accuracy === null ? "—" : `${Math.round(accuracy * 100)}%`} sound accuracy</span>
					<span>
						{topicTally.matched} of {topicTally.total} /{topicIpa}/ placed
					</span>
				</div>
				<ul className="flex w-full flex-col gap-2 text-left">
					{rows.map(({ round, score }) => (
						<li
							className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
							key={round.word.word}
						>
							<span className="font-medium text-sm">{round.word.word}</span>
							<span className="text-muted-foreground text-sm">
								{score.reference.map(toIpa).join(" ")}
							</span>
							<span className="text-sm">{score.correct ? "Correct" : "Not yet"}</span>
						</li>
					))}
				</ul>
				<Button onClick={onNewSession}>New session</Button>
			</div>
		</div>
	);
}
