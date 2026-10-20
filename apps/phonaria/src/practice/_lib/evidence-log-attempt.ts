/**
 * Holds a scored attempt until the learner's next action says whether they retried
 * or moved on, then sends it to the opt-in evidence log once. Sends nothing while
 * sharing is off, whether it was off when the attempt was scored or when it would
 * be sent.
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
};

export function createAttemptLogger({
	word,
	isEnabled,
	send,
	now = Date.now,
}: {
	word: string;
	isEnabled: () => boolean;
	send: (payload: EvidenceLogPayload) => void;
	now?: () => number;
}): AttemptLogger {
	let pending: (AttemptLog & { attemptedAt: number }) | null = null;

	function next(action: EvidenceLogNext) {
		const attempt = pending;
		pending = null;
		if (!attempt || !isEnabled()) return;
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
			if (log && isEnabled()) pending = { ...log, attemptedAt: now() };
		},
		next,
	};
}
