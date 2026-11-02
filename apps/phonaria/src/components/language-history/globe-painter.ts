import { geoOrthographic, geoPath } from "d3-geo";
import type { LineString, MultiLineString, Polygon } from "geojson";
import type { Camera } from "@/lib/language-history/camera";
import { type LandShape, mayBeVisible } from "@/lib/language-history/land";
import { partialRoute, pointAt, type RoutePath } from "@/lib/language-history/route-path";
import { orthographic, type Projected, toVector } from "@/lib/language-history/sphere";

export type Rgb = readonly [number, number, number];

const TOKENS = {
	water: "--map-water",
	land: "--map-land",
	coast: "--map-coast",
	graticule: "--map-graticule",
	atmosphere: "--map-atmosphere",
	limb: "--map-limb",
	route: "--map-route",
	routePast: "--map-route-past",
	area: "--map-area",
} as const;

export type Palette = Record<keyof typeof TOKENS, Rgb>;

/** Resolves the map's colour tokens to sRGB by painting each into a one-pixel canvas. */
export function readPalette(element: Element): Palette {
	const style = getComputedStyle(element);
	const probe = document.createElement("canvas");
	probe.width = 1;
	probe.height = 1;
	const context = probe.getContext("2d", { willReadFrequently: true });
	const read = (token: string): Rgb => {
		if (!context) return [128, 128, 128];
		context.clearRect(0, 0, 1, 1);
		context.fillStyle = "#808080";
		context.fillStyle = style.getPropertyValue(token).trim() || "#808080";
		context.fillRect(0, 0, 1, 1);
		const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
		return [r, g, b];
	};
	return Object.fromEntries(
		Object.entries(TOKENS).map(([name, token]) => [name, read(token)]),
	) as Palette;
}

const rgba = ([r, g, b]: Rgb, alpha = 1) => `rgba(${r},${g},${b},${alpha})`;
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
	Math.round(a[0] + (b[0] - a[0]) * t),
	Math.round(a[1] + (b[1] - a[1]) * t),
	Math.round(a[2] + (b[2] - a[2]) * t),
];

export type AreaShape = {
	/** The area as a circle on the globe, drawn clipped at the horizon. */
	circle: Polygon;
	at: readonly [number, number];
	/** Angular radius, in radians. */
	radius: number;
	opacity: number;
};

export type RouteShape = {
	path: RoutePath;
	/** Holds the drawn part of the arrow, rewritten in place while it draws. */
	drawn: LineString & { coordinates: [number, number][] };
	tip: [number, number];
	/** How much is drawn, 0 to 1. */
	progress: number;
	/** 0 for a route from an earlier step, 1 for the current step's; in between while changing. */
	emphasis: number;
};

export type GlobeScene = {
	camera: Camera;
	/** 1 when the whole globe exactly fits the free area. */
	zoom: number;
	palette: Palette;
	coarseLand: () => readonly LandShape[];
	fineLand: () => readonly LandShape[];
	areas: readonly AreaShape[];
	routes: readonly RouteShape[];
};

/** Globe radius in CSS pixels past which the fine coastline is drawn (coarse errs by about 1.5 px here). */
const FINE_LAND_RADIUS = 420;
const GRATICULE = graticule(30);
/** The graticule shows on the whole globe and fades out by this zoom. */
const GRATICULE_ZOOM = { full: 1.2, gone: 2.5 };
const ROUTE_WIDTH = { past: 1.5, current: 2.25 };
/** Arrowhead length per pixel of line width. */
const HEAD = 4.5;
/** How far the atmosphere reaches past the edge, as a share of the radius. */
const ATMOSPHERE = 0.06;
/** Where the shading toward the globe's edge starts, as a share of the radius. */
const LIMB_START = 0.7;
/** Area opacities are rounded to this many steps, so their gradients can be reused. */
const AREA_STEPS = 40;

const MAX_PIXEL_RATIO = 2;

/**
 * Meridians and parallels every `step` degrees, one point per degree because
 * the projection's resampling is off and it joins points with straight lines.
 * Meridians on multiples of 90° reach the poles; the rest stop at 80° so the
 * poles stay clear.
 */
export function graticule(step: number): MultiLineString {
	const span = (from: number, to: number) =>
		Array.from({ length: to - from + 1 }, (_, i) => from + i);
	const meridians = [];
	for (let lon = -180; lon < 180; lon += step) {
		const top = lon % 90 === 0 ? 90 : 80;
		meridians.push(span(-top, top).map((lat): [number, number] => [lon, lat]));
	}
	const parallels = [];
	for (let lat = -90 + step; lat < 90; lat += step) {
		parallels.push(span(-180, 180).map((lon): [number, number] => [lon, lat]));
	}
	return { type: "MultiLineString", coordinates: [...meridians, ...parallels] };
}

/** The capped pixel ratio and the backing size in device pixels. */
export function backingStore(cssWidth: number, cssHeight: number, devicePixelRatio: number) {
	const ratio = Math.min(MAX_PIXEL_RATIO, devicePixelRatio || 1);
	return { ratio, width: Math.round(cssWidth * ratio), height: Math.round(cssHeight * ratio) };
}

/** A media query that stops matching when the display's pixel ratio changes from `ratio`. */
export const densityQuery = (ratio: number) => `(resolution: ${ratio}dppx)`;

/** Draws the globe on a canvas: atmosphere, ocean, graticule, land, soft areas and spread arrows. */
export function createGlobePainter(canvas: HTMLCanvasElement) {
	const context = canvas.getContext("2d");
	const projection = geoOrthographic().precision(0);
	const path = context ? geoPath(projection, context) : null;
	const point: Projected = { x: 0, y: 0, z: 0 };
	const tip: Projected = { x: 0, y: 0, z: 0 };
	const back: [number, number] = [0, 0];
	const areaGradients = new Map<number, CanvasGradient>();
	let gradientPalette: Palette | null = null;
	let width = 0;
	let height = 0;
	let ratio = 1;

	function resize(cssWidth: number, cssHeight: number) {
		const store = backingStore(cssWidth, cssHeight, window.devicePixelRatio);
		ratio = store.ratio;
		width = cssWidth;
		height = cssHeight;
		if (canvas.width !== store.width || canvas.height !== store.height) {
			canvas.width = store.width;
			canvas.height = store.height;
		}
	}

	function cornerDistance({ x, y }: Camera): number {
		return Math.max(
			Math.hypot(x, y),
			Math.hypot(width - x, y),
			Math.hypot(x, height - y),
			Math.hypot(width - x, height - y),
		);
	}

	/** In a frame where the area is the unit circle. */
	function areaGradient(palette: Palette, opacity: number): CanvasGradient | null {
		if (!context) return null;
		if (gradientPalette !== palette) {
			areaGradients.clear();
			gradientPalette = palette;
		}
		const key = Math.round(opacity * AREA_STEPS);
		let gradient = areaGradients.get(key);
		if (!gradient) {
			const alpha = key / AREA_STEPS;
			gradient = context.createRadialGradient(0, 0, 0, 0, 0, 1);
			gradient.addColorStop(0, rgba(palette.area, alpha));
			gradient.addColorStop(0.55, rgba(palette.area, alpha * 0.55));
			gradient.addColorStop(1, rgba(palette.area, 0));
			areaGradients.set(key, gradient);
		}
		return gradient;
	}

	function drawAreas(areas: readonly AreaShape[], camera: Camera, palette: Palette) {
		if (!context || !path) return;
		const center = [camera.lon, camera.lat] as const;
		for (const area of areas) {
			if (area.opacity < 1 / AREA_STEPS) continue;
			orthographic(area.at[0], area.at[1], center, point);
			const behindHorizon = point.z < -Math.sin(area.radius);
			if (behindHorizon) continue;
			const gradient = areaGradient(palette, area.opacity);
			if (!gradient) continue;
			context.beginPath();
			path(area.circle);
			const r = camera.radius * Math.sin(area.radius);
			const foreshortening = Math.max(0.05, Math.abs(point.z));
			context.save();
			context.translate(
				camera.x + point.x * camera.radius * Math.cos(area.radius),
				camera.y + point.y * camera.radius * Math.cos(area.radius),
			);
			context.rotate(Math.atan2(point.y, point.x));
			context.scale(Math.max(0.01, r * foreshortening), Math.max(0.01, r));
			context.fillStyle = gradient;
			context.fill();
			context.restore();
		}
	}

	function arrowhead(route: RouteShape, camera: Camera, lineWidth: number) {
		if (!context) return;
		const center = [camera.lon, camera.lat] as const;
		const distance = route.progress * route.path.length;
		const length = lineWidth * HEAD;
		const end = pointAt(route.path, distance, back);
		orthographic(end[0], end[1], center, tip);
		if (tip.z < 0.02) return;
		const behind = pointAt(route.path, distance - length / camera.radius, back);
		orthographic(behind[0], behind[1], center, point);
		const angle = Math.atan2(tip.y - point.y, tip.x - point.x);
		const x = camera.x + tip.x * camera.radius;
		const y = camera.y + tip.y * camera.radius;
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		const half = length * 0.55;
		context.moveTo(x + cos * length * 0.3, y + sin * length * 0.3);
		context.lineTo(x - cos * length * 0.7 - sin * half, y - sin * length * 0.7 + cos * half);
		context.lineTo(x - cos * length * 0.7 + sin * half, y - sin * length * 0.7 - cos * half);
		context.closePath();
	}

	function strokeRoutes(
		group: readonly RouteShape[],
		camera: Camera,
		color: Rgb,
		emphasis: number,
	) {
		if (!context || !path || !group.length) return;
		const lineWidth = ROUTE_WIDTH.past + (ROUTE_WIDTH.current - ROUTE_WIDTH.past) * emphasis;
		context.strokeStyle = rgba(color);
		context.lineWidth = lineWidth;
		context.beginPath();
		for (const route of group) {
			partialRoute(route.path, route.progress, route.drawn.coordinates, route.tip);
			path(route.drawn);
		}
		context.stroke();
		context.fillStyle = rgba(color);
		context.beginPath();
		for (const route of group) arrowhead(route, camera, lineWidth);
		context.fill();
	}

	const past: RouteShape[] = [];
	const current: RouteShape[] = [];

	function draw({ camera, zoom, palette, coarseLand, fineLand, areas, routes }: GlobeScene) {
		if (!context || !path) return;
		const { x, y, radius } = camera;
		context.setTransform(ratio, 0, 0, ratio, 0, 0);
		context.clearRect(0, 0, width, height);
		projection.rotate([-camera.lon, -camera.lat]).scale(radius).translate([x, y]);
		const corner = cornerDistance(camera);
		const covers = corner < radius;

		if (!covers) {
			const rim = radius * (1 + ATMOSPHERE);
			const glow = context.createRadialGradient(x, y, radius, x, y, rim);
			glow.addColorStop(0, rgba(palette.atmosphere, 0.8));
			glow.addColorStop(0.3, rgba(palette.atmosphere, 0.3));
			glow.addColorStop(1, rgba(palette.atmosphere, 0));
			context.fillStyle = glow;
			context.beginPath();
			context.arc(x, y, rim, 0, Math.PI * 2);
			context.fill();
		}

		context.fillStyle = rgba(palette.water);
		if (covers) context.fillRect(0, 0, width, height);
		else {
			context.beginPath();
			context.arc(x, y, radius, 0, Math.PI * 2);
			context.fill();
		}

		const graticule = Math.min(
			1,
			Math.max(0, (GRATICULE_ZOOM.gone - zoom) / (GRATICULE_ZOOM.gone - GRATICULE_ZOOM.full)),
		);
		if (graticule > 0) {
			context.strokeStyle = rgba(palette.graticule, graticule);
			context.lineWidth = 0.75;
			context.beginPath();
			path(GRATICULE);
			context.stroke();
		}

		const view = toVector(camera.lon, camera.lat);
		const reach = covers ? Math.asin(corner / radius) : Math.PI / 2;
		const land = radius > FINE_LAND_RADIUS ? fineLand() : coarseLand();
		context.beginPath();
		for (const shape of land) {
			if (mayBeVisible(shape, view, reach)) path(shape.polygon);
		}
		context.fillStyle = rgba(palette.land);
		context.fill();
		context.strokeStyle = rgba(palette.coast);
		context.lineWidth = 0.75;
		context.lineJoin = "round";
		context.stroke();

		drawAreas(areas, camera, palette);

		if (corner > radius * LIMB_START) {
			const limb = context.createRadialGradient(x, y, radius * LIMB_START, x, y, radius);
			limb.addColorStop(0, rgba(palette.limb, 0));
			limb.addColorStop(1, rgba(palette.limb, 0.35));
			context.fillStyle = limb;
			context.beginPath();
			context.arc(x, y, radius, 0, Math.PI * 2);
			context.fill();
		}

		context.lineCap = "round";
		context.lineJoin = "round";
		past.length = 0;
		current.length = 0;
		for (const route of routes) {
			if (route.progress <= 0) continue;
			if (route.emphasis <= 0) past.push(route);
			else if (route.emphasis >= 1) current.push(route);
			else {
				const color = mix(palette.routePast, palette.route, route.emphasis);
				strokeRoutes([route], camera, color, route.emphasis);
			}
		}
		strokeRoutes(past, camera, palette.routePast, 0);
		strokeRoutes(current, camera, palette.route, 1);
	}

	return { resize, draw };
}
