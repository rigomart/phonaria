/** Spherical helpers for the globe, in degrees unless a name says radians. */

export const RAD = Math.PI / 180;
export const EARTH_RADIUS_KM = 6371;

export type Vector = [number, number, number];

/** Longitude wrapped to [-180, 180). */
export function wrapLongitude(lon: number): number {
	return ((((lon + 180) % 360) + 360) % 360) - 180;
}

export function toVector(lon: number, lat: number): Vector {
	const cosLat = Math.cos(lat * RAD);
	return [cosLat * Math.cos(lon * RAD), cosLat * Math.sin(lon * RAD), Math.sin(lat * RAD)];
}

export function toLonLat([x, y, z]: Vector): [number, number] {
	return [Math.atan2(y, x) / RAD, Math.atan2(z, Math.hypot(x, y)) / RAD];
}

/** Great-circle distance between two places, in radians. */
export function angularDistance(
	[lon1, lat1]: readonly [number, number],
	[lon2, lat2]: readonly [number, number],
): number {
	const dLat = (lat2 - lat1) * RAD;
	const dLon = (lon2 - lon1) * RAD;
	const h =
		Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(dLon / 2) ** 2;
	return 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Orthographic view of a place from above `center`, on a unit globe: x grows
 * east and y grows down the screen. `z` is the cosine of the angle from the
 * center, so the place faces the reader when it is positive and lies on the
 * far side when it is negative.
 */
export type Projected = { x: number; y: number; z: number };

export function orthographic(
	lon: number,
	lat: number,
	[centerLon, centerLat]: readonly [number, number],
	out: Projected = { x: 0, y: 0, z: 0 },
): Projected {
	const dLon = (lon - centerLon) * RAD;
	const sinLat = Math.sin(lat * RAD);
	const cosLat = Math.cos(lat * RAD);
	const sinCenter = Math.sin(centerLat * RAD);
	const cosCenter = Math.cos(centerLat * RAD);
	const cosDLon = Math.cos(dLon);
	out.x = cosLat * Math.sin(dLon);
	out.y = -(cosCenter * sinLat - sinCenter * cosLat * cosDLon);
	out.z = sinCenter * sinLat + cosCenter * cosLat * cosDLon;
	return out;
}

/** Pins fade out over the last stretch before the horizon: where `z` drops below this. */
export const HORIZON_FADE = 0.2;

/** Opacity of a pin whose place has orthographic `z`: hidden on the far side, fading near the horizon. */
export function horizonOpacity(z: number): number {
	if (z <= 0) return 0;
	if (z >= HORIZON_FADE) return 1;
	const t = z / HORIZON_FADE;
	return t * t * (3 - 2 * t);
}

/** The place at unit-globe point (x, y) seen from above `center`. Points off the disc land on its edge. */
export function invertOrthographic(
	x: number,
	y: number,
	[centerLon, centerLat]: readonly [number, number],
): [number, number] {
	const rho = Math.hypot(x, y);
	if (rho < 1e-12) return [centerLon, centerLat];
	const c = Math.asin(Math.min(1, rho));
	const sinC = Math.sin(c);
	const cosC = Math.cos(c);
	const sinCenter = Math.sin(centerLat * RAD);
	const cosCenter = Math.cos(centerLat * RAD);
	const lat = Math.asin(cosC * sinCenter - (y * sinC * cosCenter) / rho);
	const lon = centerLon * RAD + Math.atan2(x * sinC, rho * cosCenter * cosC + y * sinCenter * sinC);
	return [wrapLongitude(lon / RAD), lat / RAD];
}
