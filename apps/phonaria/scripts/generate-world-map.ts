#!/usr/bin/env bun
/**
 * Generate `src/lib/language-history/world-land.ts` from Natural Earth 1:50m land
 * (public domain): a coarse outline for whole-globe views and a fine one for
 * close-ups, both in longitude/latitude and encoded by `land-codec.ts`.
 * Pass a local GeoJSON path to skip the download:
 *
 *   bun apps/phonaria/scripts/generate-world-map.ts [path/to/ne_50m_land.geojson]
 */
import { mkdtempSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { geoArea } from "d3-geo";
import { encodeLand, type LandPolygon, type Ring } from "../src/lib/language-history/land-codec";

const SOURCE_URL =
	"https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_land.geojson";
const OUTPUT_PATH = new URL("../src/lib/language-history/world-land.ts", import.meta.url);

const EARTH_RADIUS_KM = 6371;
const RAD = Math.PI / 180;

/** Tolerance is in degrees of arc. */
const LEVELS = {
	coarse: { tolerance: 0.2, minAreaKm2: 2500 },
	fine: { tolerance: 0.025, minAreaKm2: 40 },
} as const;

type Position = [number, number];
type LandGeoJson = {
	features: {
		geometry:
			| { type: "Polygon"; coordinates: Position[][] }
			| { type: "MultiPolygon"; coordinates: Position[][][] };
	}[];
};

/** Natural Earth places a few cut points a hair off the meridian, so allow for that. */
const onMeridian = ([lon]: Position, side: 1 | -1) => Math.abs(lon - side * 180) < 1e-4;
const areaKm2 = (polygon: LandPolygon) =>
	geoArea({ type: "Polygon", coordinates: polygon }) * EARTH_RADIUS_KM ** 2;
const close = (ring: Position[]): Ring => [...ring, ring[0]];

/**
 * Antarctica is cut along the antimeridian down to the pole. Dropping the cut
 * leaves its coast as one ring around the pole, so no seam is drawn.
 */
function joinAroundPole(ring: Position[]): Position[] {
	return ring.filter(([lon, lat]) => lat > -89.99 && Math.abs(lon) !== 180);
}

function meridianRun(ring: Position[], side: 1 | -1): number[] | null {
	const n = ring.length;
	const start = ring.findIndex(
		(point, i) => onMeridian(point, side) && !onMeridian(ring[(i - 1 + n) % n], side),
	);
	if (start === -1) return null;
	const run: number[] = [];
	for (let i = start; onMeridian(ring[i % n], side) && run.length < n; i += 1) run.push(i % n);
	return run.length >= 2 ? run : null;
}

function rotateToRun(ring: Position[], run: number[]): Position[] {
	const after = (run[run.length - 1] + 1) % ring.length;
	return [...ring.slice(after), ...ring.slice(0, after)];
}

/**
 * Natural Earth cuts land at ±180°. Pieces that share a cut are merged back into
 * one ring, so the coastline has no straight seam along the antimeridian.
 * Returns how many cuts were joined.
 */
function joinAcrossAntimeridian(outers: Position[][]): number {
	let joined = 0;
	for (let a = 0; a < outers.length; a += 1) {
		const runA = meridianRun(outers[a], 1);
		if (!runA) continue;
		for (let b = 0; b < outers.length; b += 1) {
			const runB = b === a ? null : meridianRun(outers[b], -1);
			if (!runB) continue;
			const ringA = rotateToRun(outers[a], runA);
			const ringB = rotateToRun(outers[b], runB);
			const k = runA.length;
			const l = runB.length;
			const enterA = ringA[ringA.length - k];
			const leaveA = ringA[ringA.length - 1];
			const enterB = ringB[ringB.length - l];
			const leaveB = ringB[ringB.length - 1];
			// Neighbours walk a shared edge in opposite directions.
			if (Math.abs(enterA[1] - leaveB[1]) > 1e-6 || Math.abs(leaveA[1] - enterB[1]) > 1e-6)
				continue;
			outers[a] = [
				...ringA.slice(0, ringA.length - k),
				enterA,
				...ringB.slice(0, ringB.length - l),
				leaveA,
			];
			outers[b] = [];
			joined += 1;
			a -= 1;
			break;
		}
	}
	return joined;
}

function toVector([lon, lat]: Position): [number, number, number] {
	const cosLat = Math.cos(lat * RAD);
	return [cosLat * Math.cos(lon * RAD), cosLat * Math.sin(lon * RAD), Math.sin(lat * RAD)];
}

/** Distance from p to the chord a–b on the unit sphere; close to the angle in radians for short chords. */
function distanceToChord(p: number[], a: number[], b: number[]): number {
	const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
	const lengthSquared = d[0] ** 2 + d[1] ** 2 + d[2] ** 2;
	const t =
		lengthSquared === 0
			? 0
			: Math.max(
					0,
					Math.min(
						1,
						((p[0] - a[0]) * d[0] + (p[1] - a[1]) * d[1] + (p[2] - a[2]) * d[2]) / lengthSquared,
					),
				);
	return Math.hypot(p[0] - a[0] - t * d[0], p[1] - a[1] - t * d[1], p[2] - a[2] - t * d[2]);
}

function simplifyLine(points: Position[], tolerance: number): Position[] {
	const vectors = points.map(toVector);
	const keep = new Uint8Array(points.length);
	keep[0] = 1;
	keep[points.length - 1] = 1;
	const stack: [number, number][] = [[0, points.length - 1]];
	while (stack.length) {
		const [first, last] = stack.pop() as [number, number];
		let farthest = -1;
		let farthestDistance = tolerance;
		for (let i = first + 1; i < last; i += 1) {
			const distance = distanceToChord(vectors[i], vectors[first], vectors[last]);
			if (distance > farthestDistance) {
				farthest = i;
				farthestDistance = distance;
			}
		}
		if (farthest === -1) continue;
		keep[farthest] = 1;
		stack.push([first, farthest], [farthest, last]);
	}
	return points.filter((_, i) => keep[i]);
}

/** Splits at the point farthest from the start, so both halves are open lines. */
function simplifyRing(ring: Position[], toleranceDegrees: number): Position[] {
	const tolerance = toleranceDegrees * RAD;
	const [x, y, z] = toVector(ring[0]);
	let split = 0;
	let splitDistance = 0;
	ring.forEach((point, i) => {
		const [px, py, pz] = toVector(point);
		const distance = Math.hypot(px - x, py - y, pz - z);
		if (distance > splitDistance) {
			split = i;
			splitDistance = distance;
		}
	});
	if (split === 0) return [];
	return [
		...simplifyLine(ring.slice(0, split + 1), tolerance).slice(0, -1),
		...simplifyLine([...ring.slice(split), ring[0]], tolerance).slice(0, -1),
	];
}

/** Drops points the rounding collapses together. */
function quantize(ring: Position[]): Position[] {
	const rounded = ring.map(
		([lon, lat]) => [Math.round(lon * 100) / 100, Math.round(lat * 100) / 100] as Position,
	);
	return rounded.filter((point, i) => {
		const previous = rounded[(i - 1 + rounded.length) % rounded.length];
		return rounded.length === 1 || point[0] !== previous[0] || point[1] !== previous[1];
	});
}

/** True when d3-geo would read the ring as everything but itself, which a collapsed sliver can cause. */
const isInverted = (ring: Position[]) =>
	ring.length >= 3 && geoArea({ type: "Polygon", coordinates: [close(ring)] }) > 2 * Math.PI;

function simplifyKeepingWinding(ring: Position[], tolerance: number): Position[] {
	let simplified = quantize(simplifyRing(ring, tolerance));
	for (let t = tolerance / 2; isInverted(simplified); t /= 2) {
		simplified = quantize(simplifyRing(ring, t));
	}
	return simplified;
}

function buildLevel(
	polygons: Position[][][],
	{ tolerance, minAreaKm2 }: { tolerance: number; minAreaKm2: number },
) {
	const kept: LandPolygon[] = [];
	for (const [outerRing, ...holeRings] of polygons) {
		const outer = simplifyKeepingWinding(outerRing, tolerance);
		if (outer.length < 3 || areaKm2([close(outer)]) < minAreaKm2) continue;
		const holes = holeRings
			.map((hole) => quantize(simplifyRing(hole, tolerance)))
			.filter((hole) => hole.length >= 3 && areaKm2([close([...hole].reverse())]) >= minAreaKm2)
			.map(close);
		kept.push([close(outer), ...holes]);
	}
	return kept;
}

export function buildLand(geojson: LandGeoJson) {
	const polygons = geojson.features.flatMap(({ geometry }) =>
		geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates,
	);
	const open = polygons.map((polygon) =>
		polygon.map((ring) => {
			const points = ring.slice(0, -1);
			return points.some(([, lat]) => lat <= -89.99) ? joinAroundPole(points) : points;
		}),
	);
	const outers = open.map((polygon) => polygon[0]);
	const joined = joinAcrossAntimeridian(outers);
	const merged = open
		.map((polygon, i) => [outers[i], ...polygon.slice(1)])
		.filter((polygon) => polygon[0].length >= 3);
	return {
		joined,
		coarse: buildLevel(merged, LEVELS.coarse),
		fine: buildLevel(merged, LEVELS.fine),
	};
}

async function loadGeoJson(localPath: string | undefined): Promise<LandGeoJson> {
	if (localPath) return JSON.parse(await readFile(localPath, "utf8")) as LandGeoJson;
	const response = await fetch(SOURCE_URL);
	if (!response.ok) throw new Error(`Download failed: ${response.status} ${SOURCE_URL}`);
	const text = await response.text();
	const downloadDir = mkdtempSync("/tmp/world-land-");
	const downloadPath = join(downloadDir, "ne_50m_land.geojson");
	writeFileSync(downloadPath, text);
	console.log(`Downloaded ${downloadPath}`);
	return JSON.parse(text) as LandGeoJson;
}

const countPoints = (polygons: LandPolygon[]) =>
	polygons.reduce((sum, polygon) => sum + polygon.reduce((s, ring) => s + ring.length - 1, 0), 0);

function renderModule(coarse: string, fine: string): string {
	const { coarse: c, fine: f } = LEVELS;
	return `/**
 * GENERATED by apps/phonaria/scripts/generate-world-map.ts. Do not edit by hand.
 *
 * Source: Natural Earth 1:50m land, public domain, naturalearthdata.com.
 * Longitude/latitude, encoded by ./land-codec.ts. Pieces cut at the antimeridian are rejoined.
 * Coarse: simplified to ${c.tolerance}°, islands under ${c.minAreaKm2} km² dropped.
 * Fine: simplified to ${f.tolerance}°, islands under ${f.minAreaKm2} km² dropped.
 * Regenerate: bun apps/phonaria/scripts/generate-world-map.ts [local-geojson-path]
 */

export const WORLD_LAND_COARSE =
	${JSON.stringify(coarse)};

export const WORLD_LAND_FINE =
	${JSON.stringify(fine)};
`;
}

if (import.meta.main) {
	const geojson = await loadGeoJson(process.argv[2]);
	const { joined, coarse, fine } = buildLand(geojson);
	const encoded = { coarse: encodeLand(coarse), fine: encodeLand(fine) };
	const module = renderModule(encoded.coarse, encoded.fine);
	writeFileSync(OUTPUT_PATH, module);
	console.log(`Joined ${joined} antimeridian cuts.`);
	console.log(
		`Coarse: ${coarse.length} polygons, ${countPoints(coarse)} points, ${encoded.coarse.length} bytes.`,
	);
	console.log(
		`Fine: ${fine.length} polygons, ${countPoints(fine)} points, ${encoded.fine.length} bytes.`,
	);
	console.log(`Wrote ${OUTPUT_PATH.pathname} (${module.length} bytes)`);
}
