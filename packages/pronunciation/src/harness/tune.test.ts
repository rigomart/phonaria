import { readFile } from "node:fs/promises";
import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import { AZURE_JUDGE_THRESHOLDS } from "../azure/judge-thresholds";
import type { SoundVerdict } from "../contract";
import { LENIENT_MARGINS } from "../judge";
import { type SoundOccurrence, SWAP_MARGINS, tuneThresholds } from "./tune";
import { serializeThresholds, type ThresholdsFile } from "./tune-report";

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
