import { azureEvidenceFromResponse, type WavAudio } from "@phonaria/pronunciation";
import { describe, expect, it, vi } from "vitest";
import { type EvidenceLogPayload, withCatalogWordsOnly } from "@/lib/speech/evidence-log";
import { evidenceLogPayloadSchema } from "@/server/evidence-log";
import { MISCUE_FIXTURES } from "../../../../../packages/pronunciation/src/azure/fixtures/miscue";
import { createAttemptLogger, pageAttemptLogger } from "./evidence-log-attempt";
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
	const consent: { grant: string | null } = { grant: enabled ? "on:first" : null };
	let clock = 1_000;
	const attempts = createAttemptLogger({
		word: "ship",
		currentGrant: () => consent.grant,
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
		consent.grant = null;
		attempts.next("moved-on");

		expect(send).not.toHaveBeenCalled();
	});

	it("sends nothing when sharing was turned off and on again before the next action", () => {
		const { attempts, send, consent } = logger();

		attempts.scored(LOG);
		consent.grant = null;
		consent.grant = "on:second";
		attempts.next("moved-on");

		expect(send).not.toHaveBeenCalled();
	});

	it("forgets the waiting attempt when told sharing was turned off", () => {
		const { attempts, send } = logger();

		attempts.scored(LOG);
		attempts.drop();
		attempts.next("moved-on");

		expect(send).not.toHaveBeenCalled();
	});

	it("doesn't send an attempt scored while sharing was off, even once it's turned on", () => {
		const { attempts, send, consent } = logger({ enabled: false });

		attempts.scored(LOG);
		consent.grant = "on:first";
		attempts.next("moved-on");

		expect(send).not.toHaveBeenCalled();
	});
});

describe("createAttemptLogger once the learner has left", () => {
	it("sends the waiting attempt as moved on", () => {
		const { attempts, send } = logger();

		attempts.scored(LOG);
		attempts.leave();

		expect(send).toHaveBeenCalledTimes(1);
		expect(send.mock.calls[0][0].next).toBe("moved-on");
	});

	it("sends nothing for a scoring result that resolves after the learner left mid-check", async () => {
		const { attempts, send } = logger();
		let finishScoring = (_log: AttemptLog) => {};
		const scoring = new Promise<AttemptLog>((resolve) => {
			finishScoring = resolve;
		}).then((log) => attempts.scored(log));

		attempts.leave();
		finishScoring(LOG);
		await scoring;
		attempts.next("moved-on");

		expect(send).not.toHaveBeenCalled();
	});
});

describe("pageAttemptLogger", () => {
	function page() {
		const events = new EventTarget();
		const { send, consent } = logger();
		const opened = vi.fn(() =>
			createAttemptLogger({ word: "ship", currentGrant: () => consent.grant, send }),
		);
		const connection = pageAttemptLogger(opened, events);
		const fire = (type: string, persisted = false) =>
			events.dispatchEvent(Object.assign(new Event(type), { persisted }));
		return { ...connection, send, opened, fire };
	}

	it("sends the waiting attempt as moved on when the page is hidden", () => {
		const { logger: attempts, send, fire } = page();

		attempts.scored(LOG);
		fire("pagehide");

		expect(send).toHaveBeenCalledTimes(1);
		expect(send.mock.calls[0][0].next).toBe("moved-on");
	});

	it("sends nothing for a result that resolves after the page was hidden", () => {
		const { logger: attempts, send, fire } = page();

		fire("pagehide");
		attempts.scored(LOG);
		attempts.next("moved-on");

		expect(send).not.toHaveBeenCalled();
	});

	it("logs new attempts once after a back/forward cache restore, and nothing from before", () => {
		const { logger: attempts, send, opened, fire } = page();

		fire("pagehide");
		attempts.scored(LOG);
		fire("pageshow", true);
		attempts.next("moved-on");
		expect(send).not.toHaveBeenCalled();

		attempts.scored(LOG);
		attempts.next("retried");
		attempts.next("retried");

		expect(opened).toHaveBeenCalledTimes(2);
		expect(send).toHaveBeenCalledTimes(1);
	});

	it("drops a result that started before the page was hidden and restored", async () => {
		const { logger: attempts, send, fire } = page();
		let finishScoring = (_log: AttemptLog) => {};
		const report = attempts.reporter();
		const scoring = new Promise<AttemptLog>((resolve) => {
			finishScoring = resolve;
		}).then(report);

		fire("pagehide");
		fire("pageshow", true);
		finishScoring(LOG);
		await scoring;
		attempts.next("retried");
		attempts.next("moved-on");
		expect(send).not.toHaveBeenCalled();

		attempts.reporter()(LOG);
		attempts.next("moved-on");
		expect(send).toHaveBeenCalledTimes(1);
	});

	it("reports to the logger that was current, while it still is", () => {
		const { logger: attempts, send } = page();

		attempts.reporter()(LOG);
		attempts.next("retried");

		expect(send).toHaveBeenCalledTimes(1);
	});

	it("keeps its logger through a first page load's pageshow, and stops on close", () => {
		const { logger: attempts, send, opened, fire, close } = page();

		fire("pageshow");
		attempts.scored(LOG);
		close();
		fire("pageshow", true);
		attempts.scored(LOG);
		attempts.next("moved-on");

		expect(opened).toHaveBeenCalledTimes(1);
		expect(send).toHaveBeenCalledTimes(1);
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
