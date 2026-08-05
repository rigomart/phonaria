"use client";

import { useEffect } from "react";
import { getTopic } from "@/lib/practice/topics";
import { usePracticeSessionStore } from "../_store/practice-session-store";
import { PreSubmitCheck } from "./pre-submit-check";
import { RoundBuilder } from "./round-builder";
import { ScoreboardScaffold } from "./scoreboard-scaffold";
import { StartScreen } from "./start-screen";

/**
 * Start screen, live session and reveal all run in place on /practice/[topic]
 * as client state. Leaving the route abandons the session — no resume (#140).
 */
export function PracticeExperience({ topicId }: { topicId: string }) {
	const phase = usePracticeSessionStore((state) => state.phase);
	const poolStatus = usePracticeSessionStore((state) => state.poolStatus);
	const sessionError = usePracticeSessionStore((state) => state.sessionError);
	const prefetchPool = usePracticeSessionStore((state) => state.prefetchPool);
	const startSession = usePracticeSessionStore((state) => state.startSession);
	const abandon = usePracticeSessionStore((state) => state.abandon);

	// The server route already rejected unknown slugs with notFound().
	const topic = getTopic(topicId);

	useEffect(() => {
		if (!topic) return;
		// Prefetch on mount so Start is the only thing that waits.
		void prefetchPool(topic);
		return () => abandon();
	}, [topic, prefetchPool, abandon]);

	if (!topic) return null;

	switch (phase) {
		case "building":
			return <RoundBuilder />;
		case "checking":
			return <PreSubmitCheck />;
		case "review":
			// `startSession` already resets the session slice, so there is nothing
			// to abandon first — and on failure it leaves the start screen showing
			// why.
			return <ScoreboardScaffold onNewSession={() => startSession(topic)} topic={topic} />;
		default:
			return (
				<StartScreen
					onRetryPool={() => void prefetchPool(topic)}
					onStart={() => startSession(topic)}
					poolStatus={poolStatus}
					sessionError={sessionError}
					topic={topic}
				/>
			);
	}
}
