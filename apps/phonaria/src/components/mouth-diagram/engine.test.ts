import {
	getLanguagePhonemeIds,
	getPhonemeArticulationRegistryForLanguage,
} from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import { type Frame, MouthEngine } from "./engine";
import { getMouthSound, MOUTH_SOUNDS } from "./sounds";

const drawn = ({ shapes, air, folds }: Frame) =>
	[
		shapes.jaw,
		shapes.jawBody,
		shapes.tongue,
		shapes.upperLip,
		shapes.velum,
		air.bright,
		air.faint,
		folds,
	].join(" ");

describe("mouth diagrams", () => {
	it("has one for every American English consonant, and none for other accents", () => {
		const articulations = getPhonemeArticulationRegistryForLanguage("en-us");
		const consonants = getLanguagePhonemeIds("en-us").filter(
			(id) => articulations[id].category === "consonant",
		);
		expect(consonants.filter((id) => !getMouthSound("en-us", id))).toEqual([]);
		expect(getMouthSound("es-419", "S")).toBeUndefined();
	});

	it.each(MOUTH_SOUNDS.map((sound) => [sound.id, sound] as const))(
		"draws %s without a broken shape, still and through two loops",
		(_id, sound) => {
			const engine = new MouthEngine(sound.steps);
			const keyIndex = Math.max(
				0,
				sound.steps.findIndex((step) => step.key),
			);
			expect(drawn(engine.seek(keyIndex))).not.toMatch(/NaN|undefined|Infinity/);
			const length = sound.steps.reduce((sum, step) => sum + step.move + step.hold, 0);
			for (let time = 0; time < length * 2; time += 16) {
				expect(drawn(engine.advance(16))).not.toMatch(/NaN|undefined|Infinity/);
			}
		},
	);

	it("survives a first frame that steps time backwards", () => {
		const held = MOUTH_SOUNDS.find((sound) => sound.steps.length === 1);
		if (!held) throw new Error("no held sound");
		const engine = new MouthEngine(held.steps);
		engine.seek(0);
		expect(drawn(engine.advance(-5))).not.toMatch(/NaN/);
	});

	it("holds air behind a seal and lets it out on release", () => {
		const t = getMouthSound("en-us", "T");
		if (!t) throw new Error("no /t/");
		const engine = new MouthEngine(t.steps);
		const sealed = engine.seek(0);
		const furthestLeft = (frame: Frame) =>
			Math.min(...[...frame.air.bright.matchAll(/M(-?[\d.]+) /g)].map((match) => Number(match[1])));
		expect(furthestLeft(sealed)).toBeGreaterThan(130);
		let frame = sealed;
		for (let time = 0; time < 2500; time += 16) frame = engine.advance(16);
		expect(frame.stepIndex).toBe(1);
		expect(furthestLeft(frame)).toBeLessThan(60);
	});
});
