import type { Polygon } from "geojson";
import { decodeLand } from "./land-codec";
import { toVector, type Vector } from "./sphere";

/** A land polygon with a bounding cap (`center`, `radius` in radians) for culling. */
export type LandShape = { polygon: Polygon; center: Vector; radius: number };

export function loadLand(encoded: string): LandShape[] {
	return decodeLand(encoded).map((rings) => {
		const vectors = rings[0].map(([lon, lat]) => toVector(lon, lat));
		const sum: Vector = [0, 0, 0];
		for (const [x, y, z] of vectors) {
			sum[0] += x;
			sum[1] += y;
			sum[2] += z;
		}
		const norm = Math.hypot(...sum) || 1;
		const center: Vector = [sum[0] / norm, sum[1] / norm, sum[2] / norm];
		let radius = 0;
		for (const [x, y, z] of vectors) {
			const dot = x * center[0] + y * center[1] + z * center[2];
			radius = Math.max(radius, Math.acos(Math.max(-1, Math.min(1, dot))));
		}
		return { polygon: { type: "Polygon", coordinates: rings }, center, radius };
	});
}

/**
 * Whether any of `shape` may be on screen when the view's center is `view`
 * (a unit vector) and the screen reaches `reach` radians from it.
 */
export function mayBeVisible(shape: LandShape, view: Vector, reach: number): boolean {
	const dot = shape.center[0] * view[0] + shape.center[1] * view[1] + shape.center[2] * view[2];
	return Math.acos(Math.max(-1, Math.min(1, dot))) - shape.radius < reach;
}
