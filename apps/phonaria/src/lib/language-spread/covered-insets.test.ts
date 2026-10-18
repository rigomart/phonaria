import { describe, expect, it } from "vitest";
import { coveredInsets } from "./covered-insets";

const rect = (left: number, top: number, right: number, bottom: number) => ({
	left,
	top,
	right,
	bottom,
});

describe("coveredInsets", () => {
	const desktopMapUnderHeader = rect(0, 48, 1280, 800);
	const centredDial = rect(512, 72, 768, 152);

	it("keeps the margin and clears the dial when there is no card", () => {
		expect(
			coveredInsets({ container: desktopMapUnderHeader, dial: centredDial, margin: 24, gap: 24 }),
		).toEqual({
			top: 128,
			right: 24,
			bottom: 24,
			left: 24,
		});
	});

	it("cuts off the side a tall card sits on", () => {
		const left = rect(24, 200, 408, 650);
		expect(
			coveredInsets({
				container: desktopMapUnderHeader,
				dial: centredDial,
				card: left,
				margin: 24,
				gap: 24,
			}),
		).toMatchObject({
			left: 432,
			right: 24,
		});
		const right = rect(872, 200, 1256, 650);
		expect(
			coveredInsets({
				container: desktopMapUnderHeader,
				dial: centredDial,
				card: right,
				margin: 24,
				gap: 24,
			}),
		).toMatchObject({
			left: 24,
			right: 432,
		});
	});

	it("cuts off the bottom for a full-width card on a phone", () => {
		const phone = rect(0, 48, 390, 844);
		const card = rect(12, 532, 378, 832);
		expect(
			coveredInsets({ container: phone, dial: rect(12, 60, 378, 140), card, margin: 12, gap: 24 }),
		).toEqual({ top: 116, right: 12, bottom: 336, left: 12 });
	});

	it("cuts off the bottom for a short, wide card low on the map", () => {
		const card = rect(24, 600, 1000, 776);
		expect(
			coveredInsets({
				container: desktopMapUnderHeader,
				dial: centredDial,
				card,
				margin: 24,
				gap: 24,
			}),
		).toMatchObject({
			bottom: 224,
			left: 24,
		});
	});
});
