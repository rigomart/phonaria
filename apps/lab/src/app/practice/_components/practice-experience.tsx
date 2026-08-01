"use client";

import { useEffect } from "react";
import { getTopic } from "@/lib/practice/topics";
import { usePracticeSessionStore } from "../_store/practice-session-store";
import { SessionScaffold } from "./session-scaffold";
import { StartScreen } from "./start-screen";

/**
 * Owns the whole in-place practice experience: start screen, live session and
 * reveal all run on /practice/[topic] as client state. Leaving the route
 * abandons the session — there is no resume, by design (#140).
 */
export function PracticeExperience({ topicId }: { topicId: string }) {
	const phase = usePracticeSessionStore((state) => state.phase);
	const poolStatus = usePracticeSessionStore((state) => state.poolStatus);
	const prefetchPool = usePracticeSessionStore((state) => state.prefetchPool);
	const startSession = usePracticeSessionStore((state) => state.startSession);
	const abandon = usePracticeSessionStore((state) => state.abandon);

	// The registry is the source of truth for slugs; the server route already
	// rejected unknown ones with notFound().
	const topic = getTopic(topicId);

	useEffect(() => {
		if (!topic) return;
		// Prefetch on start-screen mount so Start is the only thing that waits.
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
