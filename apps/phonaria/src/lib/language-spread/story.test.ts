import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { eraYear } from "./era";
import { MAIN_SOURCES, SOURCES, STEPS, STOPS } from "./story";

const stopIds = STOPS.map((stop) => stop.id);
const sourceIds = new Set(SOURCES.map((source) => source.id));
const revealed = STEPS.flatMap((step) => step.stops);
const researchDir = resolve(import.meta.dirname, "../../../../../docs/research/language-spread");

const validPlace = ([lon, lat]: readonly [number, number]) =>
	lon >= -180 && lon <= 360 && lat >= -58 && lat <= 84;

describe("language spread story", () => {
	it("gives every stop, step and source a unique id", () => {
		expect(new Set(stopIds).size).toBe(stopIds.length);
		expect(new Set(STEPS.map((step) => step.id)).size).toBe(STEPS.length);
		expect(sourceIds.size).toBe(SOURCES.length);
	});

	it("reveals every stop exactly once, from a step that exists", () => {
		expect([...revealed].sort()).toEqual([...stopIds].sort());
	});

	it("opens with the out-of-Africa story and ends today", () => {
		expect(STEPS[0].stops).toEqual([]);
		expect(STEPS[1].stops).toContain("humans-in-africa");
		expect(STEPS.at(-1)?.era).toBe("today");
	});

	it("moves forward in time", () => {
		const years = STEPS.map((step) => eraYear(step.era));
		expect([...years].sort((a, b) => a - b)).toEqual(years);
	});

	it("backs every stop with listed sources, and lists only sources in use", () => {
		const used = new Set<string>();
		const cite = (owner: string, ids: readonly string[]) => {
			for (const id of ids) {
				expect(sourceIds.has(id), `${owner} cites ${id}`).toBe(true);
				used.add(id);
			}
		};
		for (const stop of STOPS) {
			expect(stop.sources.length, stop.id).toBeGreaterThan(0);
			cite(stop.id, stop.sources);
		}
		for (const step of STEPS) cite(step.id, step.sources ?? []);
		expect([...sourceIds].filter((id) => !used.has(id))).toEqual([]);
	});

	it("backs every card after the introduction with a stop or its own sources", () => {
		for (const step of STEPS.slice(1)) {
			expect(step.stops.length + (step.sources?.length ?? 0), step.id).toBeGreaterThan(0);
		}
	});

	it("lists only known works as the page's main sources", () => {
		for (const id of MAIN_SOURCES) expect(sourceIds.has(id), id).toBe(true);
	});

	it("links every source over https", () => {
		for (const source of SOURCES) expect(source.url, source.id).toMatch(/^https:\/\//);
	});

	it("records the research behind every stop", () => {
		const index = readFileSync(resolve(researchDir, "README.md"), "utf8");
		for (const id of [...stopIds, ...STEPS.map((step) => step.id)]) {
			expect(index, `index row for ${id}`).toContain(`\`${id}\``);
		}
		for (const name of ["africa", "western-eurasia", "asia-pacific", "americas", "modern"]) {
			expect(readFileSync(resolve(researchDir, `${name}.md`), "utf8").length, name).toBeGreaterThan(
				0,
			);
		}
	});

	it("places stops and routes on the map", () => {
		for (const stop of STOPS) {
			expect(validPlace(stop.at), stop.id).toBe(true);
			if (stop.areaKm !== undefined) expect(stop.areaKm).toBeGreaterThan(0);
		}
		for (const step of STEPS) {
			const { west, south, east, north } = step.camera;
			expect(west, step.id).toBeLessThan(east);
			expect(south, step.id).toBeLessThan(north);
			for (const route of step.routes) {
				expect(route.length, step.id).toBeGreaterThanOrEqual(2);
				for (const place of route) expect(validPlace(place), step.id).toBe(true);
			}
		}
	});

	it("keeps copy short enough for a card or a marker", () => {
		for (const stop of STOPS) {
			expect(stop.description.length, stop.id).toBeLessThanOrEqual(320);
			expect(stop.where.length, stop.id).toBeGreaterThan(0);
		}
		for (const step of STEPS) {
			expect(step.paragraphs.join(" ").length, step.id).toBeLessThanOrEqual(600);
		}
	});

	it("gives every undated stop a reason in its copy", () => {
		for (const stop of STOPS.filter((stop) => !stop.era)) {
			expect(`${stop.where} ${stop.description}`, stop.id).toMatch(
				/debated|argue|unknown|not known|uncertain|no agreed|disagree|favour/i,
			);
		}
	});
});
