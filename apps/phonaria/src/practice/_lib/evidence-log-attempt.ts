/**
 * Holds a scored attempt until the learner's next action says whether they retried
 * or moved on, then sends it to the opt-in evidence log once. It sends only if
 * sharing stayed on throughout: the consent grant when the attempt was scored must
 * still be the current one, so turning sharing off and on again drops it.
 */
import {
	EVIDENCE_LOG_SCHEMA_VERSION,
	type EvidenceLogNext,
	type EvidenceLogPayload,
} from "@/lib/speech/evidence-log";
import type { AttemptLog } from "./speaking-attempt";

export type AttemptLogger = {
	/** A scored attempt, or null when there is nothing to log. */
	scored(log: AttemptLog | null): void;
	/** The learner's next action: sends the attempt waiting for it, if any. */
	next(action: EvidenceLogNext): void;
	/**
	 * The round is gone: sends the waiting attempt as moved on, and drops any result
	 * that arrives later, so nothing is sent after the learner has left.
	 */
	leave(): void;
	/** Sharing was turned off: forgets the waiting attempt. */
	drop(): void;
};

export function createAttemptLogger({
	word,
	currentGrant,
	send,
	now = Date.now,
}: {
	word: string;
	/** The consent grant in force now, or null when sharing is off. */
	currentGrant: () => string | null;
	send: (payload: EvidenceLogPayload) => void;
	now?: () => number;
}): AttemptLogger {
	let pending: (AttemptLog & { attemptedAt: number; grant: string }) | null = null;
	let left = false;

	function next(action: EvidenceLogNext) {
		const attempt = pending;
		pending = null;
		if (!attempt || currentGrant() !== attempt.grant) return;
		send({
			schemaVersion: EVIDENCE_LOG_SCHEMA_VERSION,
			attemptedAt: attempt.attemptedAt,
			word,
			targetAccent: "en-us",
			evidence: attempt.evidence,
			verdicts: attempt.verdicts,
			next: action,
		});
	}

	return {
		scored(log) {
			next("retried");
			const grant = currentGrant();
			if (log && !left && grant) pending = { ...log, attemptedAt: now(), grant };
		},
		next,
		leave() {
			next("moved-on");
			left = true;
		},
		drop() {
			pending = null;
		},
	};
}
