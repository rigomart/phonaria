import { azureEvidenceFromResponse, type WavAudio } from "@phonaria/pronunciation";
import { describe, expect, it, vi } from "vitest";
import { type EvidenceLogPayload, withCatalogWordsOnly } from "@/lib/speech/evidence-log";
import { evidenceLogPayloadSchema } from "@/server/evidence-log";
import { MISCUE_FIXTURES } from "../../../../../packages/pronunciation/src/azure/fixtures/miscue";
import { createAttemptLogger } from "./evidence-log-attempt";
import { promptFor } from "./minimal-pair-prompt";
import { type AttemptLog, scoreAttempt } from "./speaking-attempt";

const LOG: AttemptLog = {
	evidence: {
		words: [{ pronunciations: [] }],
		transcript: { words: ["ship"], confidence: 0.9 },
	},
	verdicts: { gate: { type: "judged" }, judgement: null },
};

function logger({ enabled = true }: { enabled?: boolean } = {}) {
	const send = vi.fn<(payload: EvidenceLogPayload) => void>();
	const consent = { enabled };
	let clock = 1_000;
	const attempts = createAttemptLogger({
		word: "ship",
		isEnabled: () => consent.enabled,
		send,
		now: () => clock++,
	});
	return { attempts, send, consent };
}

describe("createAttemptLogger", () => {
	it("sends nothing while sharing is off, which is the default", () => {
		const { attempts, send } = logger({ enabled: false });

		attempts.scored(LOG);
		attempts.next("retried");
		attempts.scored(LOG);
		attempts.next("moved-on");

		expect(send).not.toHaveBeenCalled();
	});

	it("sends each attempt once, when the learner tries again", () => {
		const { attempts, send } = logger();

		attempts.scored(LOG);
		expect(send).not.toHaveBeenCalled();
		attempts.next("retried");
		attempts.next("retried");

		expect(send).toHaveBeenCalledTimes(1);
		expect(send).toHaveBeenCalledWith({
			schemaVersion: 1,
			attemptedAt: 1_000,
			word: "ship",
			targetAccent: "en-us",
			evidence: LOG.evidence,
			verdicts: LOG.verdicts,
			next: "retried",
		});
	});

	it("sends the last attempt as moved on when the learner moves on or leaves", () => {
		const { attempts, send } = logger();

		attempts.scored(LOG);
		attempts.next("retried");
		attempts.scored(LOG);
		attempts.next("moved-on");
		attempts.next("moved-on");

		expect(send.mock.calls.map(([payload]) => [payload.next, payload.attemptedAt])).toEqual([
			["retried", 1_000],
			["moved-on", 1_001],
		]);
	});

	it("settles a waiting attempt as a retry when another is scored first", () => {
		const { attempts, send } = logger();

		attempts.scored(LOG);
		attempts.scored(LOG);

		expect(send).toHaveBeenCalledTimes(1);
		expect(send.mock.calls[0][0].next).toBe("retried");
	});

	it("sends nothing for an attempt with nothing to log, such as a failed scoring", () => {
		const { attempts, send } = logger();

		attempts.scored(null);
		attempts.next("moved-on");

		expect(send).not.toHaveBeenCalled();
	});

	it("sends nothing when sharing is turned off before the next action", () => {
		const { attempts, send, consent } = logger();

		attempts.scored(LOG);
		consent.enabled = false;
		attempts.next("moved-on");

		expect(send).not.toHaveBeenCalled();
	});

	it("doesn't send an attempt scored while sharing was off, even once it's turned on", () => {
		const { attempts, send, consent } = logger({ enabled: false });

		attempts.scored(LOG);
		consent.enabled = true;
		attempts.next("moved-on");

		expect(send).not.toHaveBeenCalled();
	});
});

describe("an attempt from the page", () => {
	const SHIP = promptFor("i-ix", "ship");
	const REQUEST = {
		targetAccent: "en-us",
		words: [{ text: "ship", acceptedPronunciations: [["SH", "IX", "P"]] }],
	} as const;

	it.each(["sheep", "kid", "a ship"] as const)(
		"said as %s is a payload the endpoint accepts",
		async (said) => {
			if (!SHIP) throw new Error("ship is a catalog word");
			const { assessment, recognition } = MISCUE_FIXTURES[said];
			const route = async () =>
				Response.json(azureEvidenceFromResponse(assessment, REQUEST, recognition));
			const result = await scoreAttempt(SHIP, new Uint8Array(4) as WavAudio, route, async () => {
				throw new Error("not needed");
			});
			const { attempts, send } = logger();

			attempts.scored(result.type === "outcome" ? result.log : null);
			attempts.next("moved-on");

			const [[payload]] = send.mock.calls;
			const sent = withCatalogWordsOnly({ ...payload, attemptedAt: Date.now() });
			expect(evidenceLogPayloadSchema.safeParse(sent).success).toBe(true);
		},
	);
});
