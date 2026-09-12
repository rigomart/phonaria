import { describe, expect, it } from "vitest";
import { getTopic, listTopics } from "./index";

/**
 * Contracts, not an inventory: these loop over the registry so a new topic
 * inherits them instead of editing this file. Guarantees that need the
 * shipped word data live in `pool-depth.test.ts` and each topic's own test.
 */
describe("topic registry", () => {
	const topics = listTopics();

	it("registers at least one topic", () => {
		expect(topics.length).toBeGreaterThan(0);
	});

	it("resolves every registered topic by its slug", () => {
		for (const topic of topics) {
			expect(getTopic(topic.id)).toBe(topic);
		}
	});

	it("returns undefined for unknown slugs", () => {
		expect(getTopic("clusters")).toBeUndefined();
	});

	it("gives every topic a unique slug", () => {
		expect(new Set(topics.map((topic) => topic.id)).size).toBe(topics.length);
	});

	it("keeps every slug usable as a URL segment", () => {
		for (const topic of topics) {
			expect(topic.id, topic.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
		}
	});

	it("gives every topic at least one topic sound", () => {
		for (const topic of topics) {
			expect(topic.topicSounds.length, topic.id).toBeGreaterThan(0);
		}
	});

	it("gives every topic at least one session slot", () => {
		for (const topic of topics) {
			expect(topic.slotSpec.length, topic.id).toBeGreaterThan(0);
		}
	});

	it("orders every slot band from min to max", () => {
		for (const topic of topics) {
			for (const band of topic.slotSpec) {
				expect(band.min, topic.id).toBeGreaterThan(0);
				if (band.max !== null) expect(band.max, topic.id).toBeGreaterThanOrEqual(band.min);
			}
		}
	});

	it("gives every topic the copy the picker and reveal need", () => {
		for (const topic of topics) {
			expect(topic.display.name.trim(), topic.id).not.toBe("");
			expect(topic.display.blurb.trim(), topic.id).not.toBe("");
			expect(topic.display.topicStatLabel.trim(), topic.id).not.toBe("");
		}
	});
});
