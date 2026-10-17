export type Point = { x: number; y: number };

/** How far a two-point route bows to the side, as a share of its length. */
const BOW = 0.18;

const round = (value: number) => Math.round(value * 10) / 10;
const pair = ({ x, y }: Point) => `${round(x)} ${round(y)}`;

/**
 * The control points of a smooth route through `points`: a gentle arc for two
 * points, a Catmull-Rom curve through every waypoint otherwise.
 */
function segments(points: readonly Point[]): { c1: Point; c2: Point; end: Point }[] {
	if (points.length === 2) {
		const [a, b] = points;
		const bow = { x: (a.y - b.y) * BOW, y: (b.x - a.x) * BOW };
		const middle = { x: (a.x + b.x) / 2 + bow.x, y: (a.y + b.y) / 2 + bow.y };
		// Cubic form of the quadratic arc through `middle`'s control point.
		const c1 = { x: a.x + ((middle.x - a.x) * 2) / 3, y: a.y + ((middle.y - a.y) * 2) / 3 };
		const c2 = { x: b.x + ((middle.x - b.x) * 2) / 3, y: b.y + ((middle.y - b.y) * 2) / 3 };
		return [{ c1, c2, end: b }];
	}
	return points.slice(1).map((end, index) => {
		const start = points[index];
		const before = points[index - 1] ?? start;
		const after = points[index + 2] ?? end;
		return {
			c1: { x: start.x + (end.x - before.x) / 6, y: start.y + (end.y - before.y) / 6 },
			c2: { x: end.x - (after.x - start.x) / 6, y: end.y - (after.y - start.y) / 6 },
			end,
		};
	});
}

/** SVG path data for a route through at least two points. */
export function routePath(points: readonly Point[]): string {
	if (points.length < 2) throw new Error("A route needs at least two points.");
	return [
		`M${pair(points[0])}`,
		...segments(points).map(({ c1, c2, end }) => `C${pair(c1)} ${pair(c2)} ${pair(end)}`),
	].join("");
}

/** Where the route ends and the direction it points there, in degrees clockwise from east. */
export function routeHead(points: readonly Point[]): Point & { angle: number } {
	const last = segments(points).at(-1);
	if (!last) throw new Error("A route needs at least two points.");
	const { c2, end } = last;
	const angle = (Math.atan2(end.y - c2.y, end.x - c2.x) * 180) / Math.PI;
	// Rounded so the server and browser render identical markup.
	return { x: round(end.x), y: round(end.y), angle: round(angle) };
}
