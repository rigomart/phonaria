import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildProbeProfiles, runProbes } from "./probes";

describe("half-size Azure voice probes", () => {
	it("compares four voices over six words, then two selected voices at two slower rates", () => {
		expect(buildProbeProfiles()).toEqual([
			{ id: "jenny-default", name: "Jenny", voiceId: "en-US-JennyNeural", ratePercent: 0 },
			{ id: "aria-default", name: "Aria", voiceId: "en-US-AriaNeural", ratePercent: 0 },
			{ id: "guy-default", name: "Guy", voiceId: "en-US-GuyNeural", ratePercent: 0 },
			{
				id: "christopher-default",
				name: "Christopher",
				voiceId: "en-US-ChristopherNeural",
				ratePercent: 0,
			},
		]);
		expect(
			buildProbeProfiles("rates", ["Aria", "Guy"]).map(({ voiceId, ratePercent }) => [
				voiceId,
				ratePercent,
			]),
		).toEqual([
			["en-US-AriaNeural", -10],
			["en-US-AriaNeural", -20],
			["en-US-GuyNeural", -10],
			["en-US-GuyNeural", -20],
		]);
	});
	it("requires two different shortlisted voices before the speed stage", () => {
		expect(() => buildProbeProfiles("rates")).toThrow(/two/);
		expect(() => buildProbeProfiles("rates", ["Jenny", "jenny"])).toThrow(/different/);
		expect(() => buildProbeProfiles("rates", ["Unknown", "Guy"])).toThrow(/voice/);
	});
	it("writes 24 distinct clips and a listening page, and resumes without re-requesting completed audio", async () => {
		const outputDir = await mkdtemp(path.join(tmpdir(), "phonaria-probes-"));
		try {
			await runProbes({
				outputDir,
				providerFactory: ({ voiceId }) => ({
					async synthesize(inputs) {
						return inputs.map(({ id }) => ({ id, audio: Buffer.from(`${voiceId}:${id}`) }));
					},
				}),
				wait: async () => {},
			});
			const first = JSON.parse(
				await readFile(path.join(outputDir, "jenny-default/plan.json"), "utf8"),
			);
			expect(first.samples.map(({ word }: { word: string }) => word)).toEqual([
				"seat",
				"seed",
				"sheep",
				"ship",
				"adapt",
				"adopt",
			]);
			const page = await readFile(path.join(outputDir, "index.html"), "utf8");
			expect(page.match(/<audio /g)).toHaveLength(24);
			expect(page).toContain('src="christopher-default/audio/adopt.mp3"');
			expect(await readFile(path.join(outputDir, "guy-default/audio/seat.mp3"), "utf8")).toBe(
				"en-US-GuyNeural:seat",
			);
			await runProbes({
				outputDir,
				resume: true,
				providerFactory: () => ({
					async synthesize() {
						throw new Error("must not generate again");
					},
				}),
				wait: async () => {},
			});
			await expect(runProbes({ outputDir, dryRun: true })).rejects.toThrow(/exists/);
		} finally {
			await rm(outputDir, { recursive: true, force: true });
		}
	});
	it("keeps speed comparisons separate from default voice recordings", async () => {
		const outputDir = await mkdtemp(path.join(tmpdir(), "phonaria-rate-probes-"));
		try {
			await runProbes({
				outputDir,
				stage: "rates",
				voices: ["Jenny", "Christopher"],
				dryRun: true,
			});
			const plan = JSON.parse(
				await readFile(path.join(outputDir, "jenny-slower-20/plan.json"), "utf8"),
			);
			expect(plan.samples).toHaveLength(6);
			expect(plan.settings.ratePercent).toBe(-20);
		} finally {
			await rm(outputDir, { recursive: true, force: true });
		}
	});
});
