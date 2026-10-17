import { describe, expect, it } from "vitest";
import { tiltedPlaneOverflow } from "./plane";

/** Where a plane point (dx, dy) from the anchor lands on screen, relative to the anchor. */
function onScreen(dx: number, dy: number, tilt: number, p: number) {
	const radians = (tilt * Math.PI) / 180;
	const depth = -dy * Math.sin(radians);
	const scale = p / (p + depth);
	return { x: dx * scale, y: dy * Math.cos(radians) * scale };
}

describe("tiltedPlaneOverflow", () => {
	const screen = {
		width: 1280,
		height: 752,
		anchorX: 860,
		anchorY: 420,
		tilt: 38,
		perspective: 1152,
	};

	it("reaches the top corners of the screen", () => {
		const { above, side } = tiltedPlaneOverflow(screen);
		const topLeft = onScreen(-(screen.anchorX + side), -(screen.anchorY + above), 38, 1152);
		const topRight = onScreen(
			screen.width - screen.anchorX + side,
			-(screen.anchorY + above),
			38,
			1152,
		);
		expect(topLeft.y).toBeLessThanOrEqual(-screen.anchorY);
		expect(topLeft.x).toBeLessThanOrEqual(-screen.anchorX);
		expect(topRight.x).toBeGreaterThanOrEqual(screen.width - screen.anchorX);
	});

	it("reaches the bottom of the screen", () => {
		const { below } = tiltedPlaneOverflow(screen);
		const bottom = onScreen(0, screen.height - screen.anchorY + below, 38, 1152);
		expect(bottom.y).toBeGreaterThanOrEqual(screen.height - screen.anchorY);
	});

	it("stays far smaller than a fixed generous margin", () => {
		const { above, side, below } = tiltedPlaneOverflow(screen);
		const area = (screen.width + 2 * side) * (screen.height + above + below);
		expect(area).toBeLessThan(screen.width * screen.height * 2.5);
	});

	it("caps the reach when the horizon comes into view", () => {
		const { above } = tiltedPlaneOverflow({ ...screen, tilt: 80, perspective: 400 });
		expect(above).toBeLessThanOrEqual(screen.height * 1.5 + 16);
	});

	it("needs nothing extra without a tilt", () => {
		expect(tiltedPlaneOverflow({ ...screen, tilt: 0 })).toEqual({ above: 16, below: 16, side: 16 });
	});
});
