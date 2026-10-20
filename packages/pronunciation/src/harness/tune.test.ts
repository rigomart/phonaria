import { readFile } from "node:fs/promises";
import type { PhonemeContrast, PhonemeSymbolId } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import { AZURE_JUDGE_THRESHOLDS } from "../azure/judge-thresholds";
import type { SoundEvidence, SoundVerdict, WordEvidence } from "../contract";
import { LENIENT_MARGINS } from "../judge";
import { buildCatalogCases, pronunciationOf } from "./cases";
import type { ScoredCase } from "./metrics";
import { type SoundOccurrence, SWAP_MARGINS, soundOccurrences, tuneThresholds } from "./tune";
import {
	renderTuneReport,
	serializeThresholds,
	type ThresholdsFile,
	thresholdsFile,
	withDefaultSources,
} from "./tune-report";

/** Judged `swapped` up to `swappedUpTo`, `match` above it, or `match` at every margin. */
function occurrence(
	phonemeId: PhonemeSymbolId,
	{
		sourceId = "tts:a",
		recording,
		expectedHeard,
		swappedUpTo = 0,
	}: {
		sourceId?: string;
		recording?: string;
		expectedHeard?: PhonemeSymbolId;
		swappedUpTo?: number;
	},
): SoundOccurrence {
	const heard = expectedHeard ?? ("ZH" as PhonemeSymbolId);
	const verdicts = SWAP_MARGINS.map((margin): SoundVerdict =>
		margin <= swappedUpTo + 1e-9 ? { type: "swapped", heard } : { type: "match" },
	);
	return {
		sourceId,
		phonemeId,
		...(expectedHeard && { expectedHeard }),
		...(recording && { recording }),
		verdicts,
	};
}

function times<T>(count: number, make: (index: number) => T): T[] {
	return Array.from({ length: count }, (_, index) => make(index));
}

describe("tuneThresholds", () => {
	it("raises a sound only as far as its own false flags need", () => {
		const occurrences = [
			...times(95, () => occurrence("E", {})),
			...times(3, () => occurrence("E", { swappedUpTo: 0.3 })),
			...times(2, () => occurrence("E", { swappedUpTo: 0.5 })),
			...times(10, () => occurrence("E", { expectedHeard: "AE", swappedUpTo: 0.6 })),
			...times(100, () => occurrence("T", {})),
		];
		const { thresholds, sounds } = tuneThresholds(occurrences);
		expect(thresholds).toEqual({ default: LENIENT_MARGINS, bySound: { E: { swap: 0.35 } } });
		expect(sounds.find((sound) => sound.phonemeId === "E")).toMatchObject({
			status: "tuned",
			before: { correct: 100, flagged: 5, swaps: 10, named: 10 },
			after: { correct: 100, flagged: 2, swaps: 10, named: 10 },
		});
	});

	it("holds each source to the target for a sound it said often enough", () => {
		const occurrences = [
			...times(100, () => occurrence("E", { sourceId: "tts:a" })),
			...times(47, () => occurrence("E", { sourceId: "tts:b" })),
			...times(3, () => occurrence("E", { sourceId: "tts:b", swappedUpTo: 0.25 })),
		];
		expect(
			tuneThresholds(occurrences).thresholds.bySound,
			"3 of 150 is 2% overall, but 3 of 50 on tts:b",
		).toEqual({ E: { swap: 0.3 } });
	});

	it("keeps a sound said too few times at the default and says so", () => {
		const occurrences = [
			...times(20, () => occurrence("UX", {})),
			occurrence("UX", { swappedUpTo: 0.4 }),
		];
		const { thresholds, sounds } = tuneThresholds(occurrences);
		expect(thresholds.bySound).toEqual({});
		expect(sounds).toMatchObject([{ phonemeId: "UX", status: "too-few", swap: 0.2 }]);
	});

	it("raises the sound that costs fewest named swaps until each source's recordings meet the target", () => {
		const recording = (index: number) => `tts:a\0word${index}`;
		const occurrences = [
			...times(100, (index) =>
				occurrence("AE", { recording: recording(index), swappedUpTo: index < 2 ? 0.3 : 0 }),
			),
			...times(100, (index) =>
				occurrence("N", {
					recording: recording(index),
					swappedUpTo: index >= 2 && index < 4 ? 0.3 : 0,
				}),
			),
			...times(10, () => occurrence("AE", { expectedHeard: "E", swappedUpTo: 0.3 })),
			...times(10, () => occurrence("N", { expectedHeard: "NG", swappedUpTo: 0.9 })),
		];
		expect(
			tuneThresholds(occurrences).thresholds.bySound,
			"each sound is at 2%, but 4 of 100 recordings are flagged; raising N loses no swaps",
		).toEqual({ N: { swap: 0.35 } });
	});
});

describe("tuneThresholds when single raises stall", () => {
	// 100 recordings of AE, I and N; three are flagged, each on two of the sounds.
	const flaggedPairs: readonly (readonly PhonemeSymbolId[])[] = [
		["AE", "N"],
		["AE", "I"],
		["I", "N"],
	];
	const recordingsWith = (extra: readonly PhonemeSymbolId[] = []) =>
		times(100, (index) =>
			(["AE", "I", "N", ...extra] as const).map((id) =>
				occurrence(id, {
					recording: `tts:a\0take${index}`,
					swappedUpTo: flaggedPairs[index]?.includes(id) ? 0.3 : 0,
				}),
			),
		).flat();

	it("raises two sounds together when no single raise clears a recording", () => {
		// Each sound is at 2 of 100, and raising any one alone still leaves all three flagged.
		const tuning = tuneThresholds(recordingsWith());
		expect(tuning.thresholds.bySound).toEqual({ AE: { swap: 0.35 }, I: { swap: 0.35 } });
		expect(tuning.overTarget).toEqual([]);
	});

	it("says which sources are still over the target when no raise reaches it", () => {
		// A sound said too few times to tune flags 3 recordings by itself.
		const occurrences = [
			...times(100, (index) => occurrence("AE", { recording: `tts:a\0take${index}` })),
			...times(3, (index) =>
				occurrence("UX", { recording: `tts:a\0take${index}`, swappedUpTo: 0.3 }),
			),
		];
		const tuning = tuneThresholds(occurrences);
		expect(tuning.overTarget).toEqual([{ sourceId: "tts:a", flagged: 3, recordings: 100 }]);
		const file = thresholdsFile(tuning, { id: "azure", settings: {} }, new Map());
		expect(file.tunedOn.overTarget).toEqual(tuning.overTarget);
		expect(
			renderTuneReport({ tuning, before: new Map(), after: new Map(), heldOut: [] }),
		).toContain("**Target not met.** Still over the target after tuning:\n\n- tts:a: 3 of 100");
	});

	it("leaves overTarget out of the file when every source meets the target", () => {
		const tuning = tuneThresholds(recordingsWith());
		const file = thresholdsFile(tuning, { id: "azure", settings: {} }, new Map());
		expect(file.tunedOn).not.toHaveProperty("overTarget");
	});
});

describe("soundOccurrences", () => {
	const contrasts: readonly PhonemeContrast<"en-us">[] = [
		{ id: "i-ix", phonemeIds: ["I", "IX"], minimalPairs: [{ words: ["seat", "sit"] }] },
	];
	const [seatCorrect] = buildCatalogCases(contrasts).filter(
		(candidate) => candidate.kind === "correct" && candidate.targetWord === "seat",
	);
	const clear = (id: PhonemeSymbolId): SoundEvidence => ({
		type: "scored",
		phonemeId: id,
		startSeconds: 0,
		endSeconds: 0.1,
		targetScore: 0.9,
		rivals: [],
	});
	const evidence: WordEvidence = {
		pronunciations: [{ pronunciationIndex: 0, sounds: pronunciationOf("seat").map(clear) }],
	};
	const take = (recordingId: string, contrastId = "i-ix"): ScoredCase => ({
		case: { ...seatCorrect, contrastId },
		recordingId,
		sourceId: "real:ana",
		sourceKind: "real",
		evidence,
	});
	const recordingsOf = (scored: readonly ScoredCase[]) =>
		new Set(soundOccurrences(scored).map((occurrence) => occurrence.recording));

	it("counts separate takes of a word apart", () => {
		const occurrences = soundOccurrences([take("ana/seat-1.wav"), take("ana/seat-2.wav")]);
		expect(occurrences.filter((occurrence) => occurrence.phonemeId === "S")).toHaveLength(2);
		expect(recordingsOf([take("ana/seat-1.wav"), take("ana/seat-2.wav")]).size).toBe(2);
	});

	it("counts one take judged in several contrasts once", () => {
		const scored = [take("ana/seat-1.wav"), take("ana/seat-1.wav", "i-e")];
		expect(soundOccurrences(scored)).toHaveLength(pronunciationOf("seat").length);
		expect(recordingsOf(scored).size).toBe(1);
	});
});

describe("withDefaultSources", () => {
	const defaults = ["--catalog", "--tts-dir=guy", "--tts-dir=aria"];

	it("adds the default sources when only other options are given", () => {
		expect(withDefaultSources([], defaults)).toEqual(defaults);
		expect(withDefaultSources(["--offline", "--concurrency=1"], defaults)).toEqual([
			...defaults,
			"--offline",
			"--concurrency=1",
		]);
	});

	it("keeps the sources given instead", () => {
		for (const source of [
			"--catalog",
			"--audio-dir=a",
			"--tts-dir=b",
			"--voices-dir=c",
			"--clips=d.json",
		]) {
			expect(withDefaultSources([source, "--offline"], defaults)).toEqual([source, "--offline"]);
		}
	});
});

describe("the committed Azure thresholds", () => {
	it("are the bytes the tune script writes", async () => {
		const committed = await readFile(
			new URL("../azure/judge-thresholds.json", import.meta.url),
			"utf8",
		);
		expect(serializeThresholds(JSON.parse(committed) as ThresholdsFile)).toBe(committed);
	});

	it("only raise swap margins above the lenient default, onto the tried steps", () => {
		expect(AZURE_JUDGE_THRESHOLDS.default).toEqual(LENIENT_MARGINS);
		for (const [id, own] of Object.entries(AZURE_JUDGE_THRESHOLDS.bySound)) {
			expect(Object.keys(own ?? {}), id).toEqual(["swap"]);
			expect(SWAP_MARGINS, id).toContain(own?.swap);
			expect(own?.swap, id).toBeGreaterThan(LENIENT_MARGINS.swap);
		}
	});
});
