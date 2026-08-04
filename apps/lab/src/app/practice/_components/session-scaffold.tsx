"use client";

/**
 * Temporary scaffolding so the session loop is drivable while the designed UI
 * lands — round builder is #145, scoreboard reveal is #146. Drives the store
 * only, so replacing it should need no store changes.
 */
import { PhonemeIpaMap, type PhonemeSymbolId } from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import type { TopicDefinition } from "@/lib/practice/topics/types";
import {
	type PracticeRound,
	selectBlankCount,
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

function RoundBuilder({ topic }: { topic: TopicDefinition }) {
	const rounds = usePracticeSessionStore((state) => state.rounds);
	const currentIndex = usePracticeSessionStore((state) => state.currentIndex);
	const nextRound = usePracticeSessionStore((state) => state.nextRound);
	const prevRound = usePracticeSessionStore((state) => state.prevRound);
	const openCheck = usePracticeSessionStore((state) => state.openCheck);

	const round = rounds[currentIndex];
	if (!round) return null;

	const isLastRound = currentIndex === rounds.length - 1;

	return (
		<div className="w-full max-w-md flex flex-col items-center gap-4 text-center">
			<p className="text-sm text-muted-foreground font-display">
				{topic.display.kicker} · {topic.display.heading}
			</p>
			<p className="text-sm text-muted-foreground">
				Round {currentIndex + 1} of {rounds.length}
			</p>
			<h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-display">
				{round.word.word}
			</h1>
			<p className="text-sm text-muted-foreground">
				{round.word.syllableCount} syllables · the sound palette arrives with the round builder
			</p>
			<div className="flex items-center gap-2">
				<Button variant="outline" disabled={currentIndex === 0} onClick={prevRound}>
					Back
				</Button>
				{isLastRound ? (
					<Button onClick={openCheck}>Finish session</Button>
				) : (
					<Button variant="outline" onClick={nextRound}>
						Next word
					</Button>
				)}
			</div>
		</div>
	);
}

function PreSubmitCheck() {
	const rounds = usePracticeSessionStore((state) => state.rounds);
	const sessionError = usePracticeSessionStore((state) => state.sessionError);
	const keepEditing = usePracticeSessionStore((state) => state.keepEditing);
	const editRound = usePracticeSessionStore((state) => state.editRound);
	const submit = usePracticeSessionStore((state) => state.submit);

	const blanks = selectBlankCount(rounds);

	return (
		<div className="w-full max-w-md flex flex-col gap-4">
			<h1 className="text-xl font-bold tracking-tight font-display">Before you submit</h1>
			{sessionError ? (
				<p role="alert" className="rounded-lg border border-border bg-muted p-3 text-sm">
					{sessionError}
				</p>
			) : null}
			<ul className="flex flex-col gap-2">
				{rounds.map((round: PracticeRound, index: number) => (
					<li
						key={round.word.word}
						className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
					>
						<span className="text-sm font-medium">{round.word.word}</span>
						<span className="text-sm text-muted-foreground">
							{round.sequence.length === 0 ? "No answer" : round.sequence.map(toIpa).join(" ")}
						</span>
						<Button variant="ghost" size="sm" onClick={() => editRound(index)}>
							{round.sequence.length === 0 ? "Answer it" : "Change"}
						</Button>
					</li>
				))}
			</ul>
			<div className="flex items-center justify-end gap-2">
				<Button variant="outline" onClick={keepEditing}>
					Keep editing
				</Button>
				<Button onClick={submit}>
					{blanks > 0 ? `Submit with ${blanks} blank${blanks === 1 ? "" : "s"}` : "Submit session"}
				</Button>
			</div>
		</div>
	);
}

function Scoreboard({ topic, onNewSession }: { topic: TopicDefinition; onNewSession: () => void }) {
	const rounds = usePracticeSessionStore((state) => state.rounds);
	const scores = usePracticeSessionStore((state) => state.scores);
	if (!scores) return null;

	const accuracy = selectSoundAccuracy(scores);
	const topicTally = selectTopicSoundTally(scores, topic.topicSounds);
	const topicIpa = topic.topicSounds.map(toIpa).join(", ");
	const rows = selectReviewRows(rounds, scores);

	return (
		<div className="w-full max-w-md flex flex-col items-center gap-4 text-center">
			<h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
				{selectWordsCorrect(scores)} of {scores.length} words correct
			</h1>
			<div className="flex items-center gap-6 text-sm text-muted-foreground">
				<span>{accuracy === null ? "—" : `${Math.round(accuracy * 100)}%`} sound accuracy</span>
				<span>
					{topicTally.matched} of {topicTally.total} /{topicIpa}/ placed
				</span>
			</div>
			<ul className="w-full flex flex-col gap-2 text-left">
				{rows.map(({ round, score }) => (
					<li
						key={round.word.word}
						className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
					>
						<span className="text-sm font-medium">{round.word.word}</span>
						<span className="text-sm text-muted-foreground">
							{score.reference.map(toIpa).join(" ")}
						</span>
						<span className="text-sm">{score.correct ? "Correct" : "Not yet"}</span>
					</li>
				))}
			</ul>
			<Button onClick={onNewSession}>New session</Button>
		</div>
	);
}

export function SessionScaffold({ topic }: { topic: TopicDefinition }) {
	const phase = usePracticeSessionStore((state) => state.phase);
	const startSession = usePracticeSessionStore((state) => state.startSession);

	// `startSession` already resets the session slice, so there is nothing to
	// abandon first — and on failure it leaves the start screen showing why.
	const onNewSession = () => startSession(topic);

	return (
		<div className="flex flex-1 flex-col items-center justify-center bg-background p-4 sm:p-6 animate-in fade-in duration-500">
			{phase === "building" ? <RoundBuilder topic={topic} /> : null}
			{phase === "checking" ? <PreSubmitCheck /> : null}
			{phase === "review" ? <Scoreboard topic={topic} onNewSession={onNewSession} /> : null}
		</div>
	);
}
