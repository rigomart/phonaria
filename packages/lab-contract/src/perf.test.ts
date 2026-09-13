import { describe, expect, it } from "vitest";
import type { LabContractTarget } from "./constants";
import {
	type BaselineRecord,
	comparisonNotes,
	createBaselineRecord,
	hasTranscriptionLanes,
	summarize,
} from "./perf";

const target = {
	name: "vercel-production",
	baseUrl: "https://phonaria-lab.rigos.dev",
	expectedCanonicalOrigin: "https://phonaria-lab.rigos.dev",
	practiceEnabled: false,
	indexingEnabled: false,
	bucketAssetsAvailable: true,
	authentication: { type: "none" },
	capabilities: {
		controlledServiceFailure: false,
		controlledWordlistFailure: false,
		practiceSession: false,
	},
	skipReasons: {},
} satisfies LabContractTarget;

function record(overrides?: Partial<BaselineRecord>): BaselineRecord {
	return {
		...createBaselineRecord(
			target,
			300,
			[40, 37, 32, 31, 40],
			[50, 48, 52, 49, 51],
			[900, 880, 910, 895, 905],
		),
		...overrides,
	};
}

describe("summarize", () => {
	it("keeps samples in collection order and reports median and p95", () => {
		expect(summarize([1047, 1027, 1034, 1018, 1018])).toEqual({
			samplesMs: [1047, 1027, 1034, 1018, 1018],
			medianMs: 1027,
			p95Ms: 1047,
		});
	});
});

describe("createBaselineRecord", () => {
	it("stores client and server transcription lanes separately", () => {
		const created = createBaselineRecord(
			target,
			292.4,
			[43, 37, 32, 31, 40],
			[50, 48, 52, 49, 51],
			[900, 880, 910, 895, 905],
		);

		expect(created.transcription.client.samplesMs).toEqual([50, 48, 52, 49, 51]);
		expect(created.transcription.server.samplesMs).toEqual([900, 880, 910, 895, 905]);
		expect(created.transcription.client.medianMs).toBe(50);
		expect(created.transcription.server.medianMs).toBe(900);
		expect(created.conditions.transcriptionClient).toContain('"hello"');
		expect(created.conditions.transcriptionClient).toContain("client-tier hit");
		expect(created.conditions.transcriptionServer).toContain('"aardvark"');
		expect(created.conditions.transcriptionServer).toContain("primes the Turso/CMUdict lookup");
		expect(created.conditions.transcriptionServer).toContain("successful server lookup");
		expect(created.conditions.transcriptionServer).toContain(
			'not the functional not-found fixture "zxqvwoplmj"',
		);
		expect("medianMs" in created.transcription).toBe(false);
	});
});

describe("hasTranscriptionLanes", () => {
	it("rejects the legacy combined transcription summary", () => {
		expect(hasTranscriptionLanes({ samplesMs: [1], medianMs: 1, p95Ms: 1 })).toBe(false);
		expect(hasTranscriptionLanes(record().transcription)).toBe(true);
	});
});

describe("comparisonNotes", () => {
	it("compares client and server lanes independently", () => {
		const previous = record();
		const current = record({
			coldPageLoadMs: 330,
			pageLoad: summarize([44, 41, 39, 40, 42]),
			transcription: {
				client: summarize([60, 58, 61, 59, 62]),
				server: summarize([1080, 1070, 1090, 1085, 1075]),
			},
		});

		expect(comparisonNotes(current, previous)).toEqual([
			"cold page load median 330ms vs committed 300ms (10.0% slower; investigate above 20%).",
			"warm page load median 41ms vs committed 37ms (10.8% slower; investigate above 20%).",
			"transcription client median 60ms vs committed 50ms (20.0% slower; investigate above 20%).",
			"transcription server median 1080ms vs committed 900ms (20.0% slower; investigate above 20%).",
		]);
	});

	it("skips lane comparison when the committed file still has a combined transcription field", () => {
		const previous = {
			...record(),
			transcription: summarize([1027, 1027, 1027, 1027, 1027]),
		} as unknown as BaselineRecord;

		const notes = comparisonNotes(record(), previous);
		expect(notes[0]).toContain("cold page load");
		expect(notes.join("\n")).toContain("not split into client and server lanes");
		expect(notes.join("\n")).not.toContain("transcription client");
	});
});
