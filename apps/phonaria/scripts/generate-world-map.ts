#!/usr/bin/env bun
/**
 * Generate `src/lib/language-spread/world-land.ts` from Natural Earth 1:110m
 * land (public domain). Pass a local GeoJSON path to skip the download:
 *
 *   bun apps/phonaria/scripts/generate-world-map.ts [path/to/ne_110m_land.geojson]
 */
import { mkdtempSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MAP_HEIGHT, MAP_WIDTH, project } from "../src/lib/language-spread/projection";

const SOURCE_URL =
	"https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson";
const OUTPUT_PATH = new URL("../src/lib/language-spread/world-land.ts", import.meta.url);

/** Polygons that lie entirely south of this latitude (Antarctica) are dropped. */
const CROP_SOUTH_LAT = -60;
/** Douglas-Peucker tolerance, in viewbox units (the world is 1000 wide). */
const SIMPLIFY_TOLERANCE = 0.3;
/** Rings smaller than this area, in square viewbox units, are dropped. */
const MIN_RING_AREA = 1;

type Position = [number, number];
type Ring = Position[];
type Polygon = Ring[];
type LandGeoJson = {
	features: {
		geometry:
			| { type: "Polygon"; coordinates: Polygon }
			| { type: "MultiPolygon"; coordinates: Polygon[] };
	}[];
};

function ringArea(ring: Ring): number {
	let sum = 0;
	for (let i = 0; i < ring.length; i += 1) {
		const [x1, y1] = ring[i];
		const [x2, y2] = ring[(i + 1) % ring.length];
		sum += x1 * y2 - x2 * y1;
	}
	return Math.abs(sum) / 2;
}

function distanceToSegment(p: Position, a: Position, b: Position): number {
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	const lengthSquared = dx * dx + dy * dy;
	const t =
		lengthSquared === 0
			? 0
			: Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lengthSquared));
	return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/** Natural Earth cuts rings at +/-180, so these points must survive for tiled copies to meet. */
function isOnEdge([x]: Position): boolean {
	return Math.abs(x) < 1e-6 || Math.abs(x - MAP_WIDTH) < 1e-6;
}

/** Douglas-Peucker over an open polyline; keeps both endpoints and every point on the edge. */
function simplifyLine(points: Position[], tolerance: number): Position[] {
	if (points.length < 3) return points;
	const pinned = points.findIndex((point, i) => i > 0 && i < points.length - 1 && isOnEdge(point));
	if (pinned !== -1) {
		return [
			...simplifyLine(points.slice(0, pinned + 1), tolerance).slice(0, -1),
			...simplifyLine(points.slice(pinned), tolerance),
		];
	}
	const first = points[0];
	const last = points[points.length - 1];
	let farthest = -1;
	let farthestDistance = 0;
	for (let i = 1; i < points.length - 1; i += 1) {
		const distance = distanceToSegment(points[i], first, last);
		if (distance > farthestDistance) {
			farthest = i;
			farthestDistance = distance;
		}
	}
	if (farthest === -1 || farthestDistance <= tolerance) return [first, last];
	return [
		...simplifyLine(points.slice(0, farthest + 1), tolerance).slice(0, -1),
		...simplifyLine(points.slice(farthest), tolerance),
	];
}

/** Closed rings have identical endpoints, so split at the point farthest from the start first. */
function simplifyRing(ring: Ring, tolerance: number): Ring {
	let split = 0;
	let splitDistance = 0;
	for (let i = 1; i < ring.length; i += 1) {
		const distance = Math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]);
		if (distance > splitDistance) {
			split = i;
			splitDistance = distance;
		}
	}
	if (split === 0) return [];
	return [
		...simplifyLine(ring.slice(0, split + 1), tolerance).slice(0, -1),
		...simplifyLine([...ring.slice(split), ring[0]], tolerance).slice(0, -1),
	];
}

function round1(value: number): number {
	return Math.round(value * 10) / 10;
}

function formatNumber(value: number): string {
	return String(Math.round(value * 10) / 10);
}

function projectRing(ring: Ring): Ring {
	ring.forEach(([lon], i) => {
		if (i > 0 && Math.abs(lon - ring[i - 1][0]) > 180) {
			throw new Error(`Ring crosses the antimeridian at index ${i}; split it first.`);
		}
	});
	return ring.slice(0, -1).map(([lon, lat]) => {
		const { x, y } = project(lon, lat);
		return [x, y] as Position;
	});
}

function ringToPath(ring: Ring): string {
	const rounded = ring.map(([x, y]) => [round1(x), round1(y)] as Position);
	const distinct = rounded.filter(
		(point, i) => i === 0 || point[0] !== rounded[i - 1][0] || point[1] !== rounded[i - 1][1],
	);
	if (distinct.length < 3) return "";
	const [startX, startY] = distinct[0];
	const steps = distinct
		.slice(1)
		.map(([x, y], i) => `${formatNumber(x - distinct[i][0])} ${formatNumber(y - distinct[i][1])}`);
	return `M${formatNumber(startX)} ${formatNumber(startY)}l${steps.join(" ")}z`;
}

export function buildLandPath(geojson: LandGeoJson): string {
	const polygons = geojson.features.flatMap(({ geometry }) =>
		geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates,
	);
	const commands: string[] = [];
	for (const polygon of polygons) {
		const [outer] = polygon;
		if (Math.max(...outer.map(([, lat]) => lat)) < CROP_SOUTH_LAT) continue;
		for (const ring of polygon) {
			const simplified = simplifyRing(projectRing(ring), SIMPLIFY_TOLERANCE);
			if (simplified.length < 3 || ringArea(simplified) < MIN_RING_AREA) continue;
			const command = ringToPath(simplified);
			if (command) commands.push(command);
		}
	}
	return commands.join("");
}

async function loadGeoJson(localPath: string | undefined): Promise<LandGeoJson> {
	if (localPath) return JSON.parse(await readFile(localPath, "utf8")) as LandGeoJson;
	const response = await fetch(SOURCE_URL);
	if (!response.ok) throw new Error(`Download failed: ${response.status} ${SOURCE_URL}`);
	const text = await response.text();
	const downloadDir = mkdtempSync(join(tmpdir(), "world-land-"));
	const downloadPath = join(downloadDir, "ne_110m_land.geojson");
	writeFileSync(downloadPath, text);
	console.log(`Downloaded ${downloadPath}`);
	return JSON.parse(text) as LandGeoJson;
}

function renderModule(path: string): string {
	return `/**
 * GENERATED by apps/phonaria/scripts/generate-world-map.ts. Do not edit by hand.
 *
 * Source: Natural Earth 1:110m land, public domain, naturalearthdata.com.
 * Projection: Gall stereographic (see ./projection.ts), Antarctica cropped, simplified.
 * Tiles seamlessly: copies offset by the viewbox width meet at the antimeridian.
 * Regenerate: bun apps/phonaria/scripts/generate-world-map.ts [local-geojson-path]
 */

export const WORLD_VIEWBOX = { width: ${MAP_WIDTH}, height: ${MAP_HEIGHT} } as const;

export const WORLD_LAND_PATH =
	${JSON.stringify(path)};
`;
}

if (import.meta.main) {
	const geojson = await loadGeoJson(process.argv[2]);
	const path = buildLandPath(geojson);
	writeFileSync(OUTPUT_PATH, renderModule(path));
	console.log(`Wrote ${OUTPUT_PATH.pathname} (${path.length} path bytes)`);
}
