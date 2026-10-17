import { describe, expect, it } from "vitest";
import { routeHead, routePath } from "./route-path";

describe("routePath", () => {
	it("draws a bowed arc between two points", () => {
		const path = routePath([
			{ x: 0, y: 0 },
			{ x: 100, y: 0 },
		]);
		expect(path).toMatch(/^M0 0C/);
		expect(path.endsWith("100 0")).toBe(true);
		const controlYs =
			path
				.match(/C(\S+) (\S+) (\S+) (\S+)/)
				?.slice(1, 5)
				.map(Number) ?? [];
		expect(controlYs[1]).not.toBe(0);
	});

	it("passes through every waypoint", () => {
		const points = [
			{ x: 0, y: 0 },
			{ x: 50, y: 20 },
			{ x: 100, y: 0 },
		];
		const path = routePath(points);
		expect(path.match(/C/g)).toHaveLength(2);
		expect(path).toContain(" 50 20C");
		expect(path).not.toContain("NaN");
	});

	it("rejects a route without a destination", () => {
		expect(() => routePath([{ x: 0, y: 0 }])).toThrow();
	});
});

describe("routeHead", () => {
	it("points along the end of the route", () => {
		const head = routeHead([
			{ x: 0, y: 0 },
			{ x: 0, y: 50 },
			{ x: 0, y: 100 },
		]);
		expect(head).toMatchObject({ x: 0, y: 100 });
		expect(head.angle).toBeCloseTo(90);
	});
});
