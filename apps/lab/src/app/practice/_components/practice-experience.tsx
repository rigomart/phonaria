"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { getTopic } from "@/lib/practice/topics";
import { selectWordsCorrect, usePracticeSessionStore } from "../_store/practice-session-store";
import { announce, PracticeLiveRegion } from "./live-region";
import { PreSubmitCheck } from "./pre-submit-check";
import { RoundBuilder } from "./round-builder";
import { Scoreboard } from "./scoreboard";
import { StartScreen } from "./start-screen";

/**
 * Start screen, live session and reveal all run in place on /practice/[topic]
 * as client state. Leaving the route abandons the session — no resume (#140).
 */
export function PracticeExperience({ topicId }: { topicId: string }) {
	const phase = usePracticeSessionStore((state) => state.phase);
	const poolStatus = usePracticeSessionStore((state) => state.poolStatus);
	const sessionError = usePracticeSessionStore((state) => state.sessionError);
	const scores = usePracticeSessionStore((state) => state.scores);
	const roundCount = usePracticeSessionStore((state) => state.rounds.length);
	const prefetchPool = usePracticeSessionStore((state) => state.prefetchPool);
	const startSession = usePracticeSessionStore((state) => state.startSession);
	const abandon = usePracticeSessionStore((state) => state.abandon);

	const reviewRef = useRef<HTMLHeadingElement>(null);

	// The server route already rejected unknown slugs with notFound().
	const topic = getTopic(topicId);

	useEffect(() => {
		if (!topic) return;
		// Prefetch on mount so Start is the only thing that waits.
		void prefetchPool(topic);
		return () => abandon();
	}, [topic, prefetchPool, abandon]);

	// Reveal: announce the headline and land keyboard/AT focus on the results.
	// `scores` is set exactly once per submit, so this fires per reveal, not per
	// render. The ref points at the scoreboard's results heading.
	useEffect(() => {
		if (phase !== "review" || !scores) return;
		announce(`Session results: ${selectWordsCorrect(scores)} of ${roundCount} words correct`);
		reviewRef.current?.focus();
	}, [phase, scores, roundCount]);

	if (!topic) return null;

	let view: ReactNode;
	switch (phase) {
		case "building":
			view = <RoundBuilder />;
			break;
		case "checking":
			view = <PreSubmitCheck />;
			break;
		case "review":
			// `startSession` already resets the session slice, so there is nothing
			// to abandon first — and on failure it leaves the start screen showing
			// why.
			view = (
				<Scoreboard headingRef={reviewRef} onNewSession={() => startSession(topic)} topic={topic} />
			);
			break;
		case "idle":
			view = (
				<StartScreen
					onRetryPool={() => void prefetchPool(topic)}
					onStart={() => startSession(topic)}
					poolStatus={poolStatus}
					sessionError={sessionError}
					topic={topic}
				/>
			);
			break;
	}

	return (
		<>
			<PracticeLiveRegion />
			{view}
		</>
	);
}
