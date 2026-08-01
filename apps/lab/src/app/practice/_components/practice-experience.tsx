"use client";

import { useEffect } from "react";
import { getTopic } from "@/lib/practice/topics";
import { usePracticeSessionStore } from "../_store/practice-session-store";
import { SessionScaffold } from "./session-scaffold";
import { StartScreen } from "./start-screen";

/**
 * Start screen, live session and reveal all run in place on /practice/[topic]
 * as client state. Leaving the route abandons the session — no resume (#140).
 */
export function PracticeExperience({ topicId }: { topicId: string }) {
	const phase = usePracticeSessionStore((state) => state.phase);
	const poolStatus = usePracticeSessionStore((state) => state.poolStatus);
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

	if (phase === "idle") {
		return (
			<StartScreen
				topic={topic}
				poolStatus={poolStatus}
				onStart={() => startSession(topic)}
				onRetry={() => void prefetchPool(topic)}
			/>
		);
	}

	return <SessionScaffold topic={topic} />;
}
