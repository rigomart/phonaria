import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
	type Bounds,
	type Camera,
	easeCamera,
	fitCamera,
	type Insets,
	interpolateCamera,
	nearestCopy,
	normalizeCamera,
	toView,
	type Viewport,
} from "@/lib/language-spread/camera";
import { tiltedPlaneOverflow } from "@/lib/language-spread/plane";
import { MAP_WIDTH, unproject } from "@/lib/language-spread/projection";

const FLIGHT_MS = 1100;
/** How far the map tilts away from the reader, in degrees. */
const DESKTOP_TILT = 38;
const PHONE_TILT = 30;
/** Depth of the view, as a share of the screen's longer side. Smaller looks deeper. */
const PERSPECTIVE = 0.9;

type Placed = { element: HTMLElement; x: number; y: number };

/** Marks the flight as landed and records where, so verification can read it. Zoom 1 shows the whole map as wide as the screen. */
function settle(container: HTMLElement | null, camera: Camera) {
	if (!container) return;
	const { lon, lat } = unproject(camera.x, camera.y);
	container.dataset.camera = "settled";
	container.dataset.cameraCenter = `${lon.toFixed(1)},${lat.toFixed(1)}`;
	container.dataset.cameraZoom = (
		MAP_WIDTH /
		camera.unitsPerPixel /
		(viewportWidth(container) || 1)
	).toFixed(2);
}

const viewportWidth = (container: HTMLElement) => container.getBoundingClientRect().width;

/**
 * Flies the map camera to `target` whenever it changes. The map lies on a plane
 * tilted away from the reader; the camera works on that flat plane, and each
 * frame writes the SVG viewBox and pin positions straight to the DOM, so React
 * renders only when the story step changes.
 */
export function useMapCamera({
	target,
	getInsets,
	layout,
	reducedMotion,
}: {
	target: Bounds;
	getInsets: (container: HTMLElement) => Insets;
	/** Changes when the space the cards cover changes, so the camera refits. */
	layout: number;
	reducedMotion: boolean;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const planeRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const clipRef = useRef<SVGRectElement>(null);
	const markers = useRef(new Map<string, Placed>());
	const camera = useRef<Camera | null>(null);
	const flight = useRef(0);
	const viewport = useRef<Viewport | null>(null);
	const [ready, setReady] = useState(false);

	const place = useCallback(
		(placed: Placed, current: Camera, viewBoxX: number, viewBoxY: number) => {
			const u = current.unitsPerPixel;
			const left = (nearestCopy(placed.x, current.x) - viewBoxX) / u;
			const top = (placed.y - viewBoxY) / u;
			placed.element.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
		},
		[],
	);

	const apply = useCallback(
		(current: Camera) => {
			const svg = svgRef.current;
			const size = viewport.current;
			if (!svg || !size) return;
			const view = toView(current, size);
			svg.setAttribute("viewBox", `${view.x} ${view.y} ${view.width} ${view.height}`);
			svg.style.setProperty("--u", String(current.unitsPerPixel));
			// Show exactly one copy of the world, centered on the camera, so
			// every place appears once even though the map repeats.
			clipRef.current?.setAttribute("x", String(current.x - MAP_WIDTH / 2));
			for (const placed of markers.current.values()) place(placed, current, view.x, view.y);
		},
		[place],
	);

	const measure = useCallback((): Viewport | null => {
		const container = containerRef.current;
		const plane = planeRef.current;
		if (!container || !plane) return null;
		const { width, height } = container.getBoundingClientRect();
		if (!width || !height) return null;
		const insets = getInsets(container);
		const tilt = width >= height ? DESKTOP_TILT : PHONE_TILT;
		const perspective = Math.round(Math.max(width, height) * PERSPECTIVE);
		const anchorX = insets.left + (width - insets.left - insets.right) / 2;
		const anchorY = insets.top + (height - insets.top - insets.bottom) / 2;
		// The tilted plane recedes, so it reaches past the container just far
		// enough to keep the screen covered.
		const { side, above, below } = tiltedPlaneOverflow({
			width,
			height,
			anchorX,
			anchorY,
			tilt,
			perspective,
		});
		Object.assign(plane.style, {
			left: `${-side}px`,
			top: `${-above}px`,
			width: `${width + side * 2}px`,
			height: `${height + above + below}px`,
			// Tilting about the center of the free area keeps that point fixed, so
			// the camera can frame regions on the flat plane.
			transformOrigin: `${anchorX + side}px ${anchorY + above}px`,
		});
		container.style.setProperty("--tilt", `${tilt}deg`);
		container.style.perspective = `${perspective}px`;
		container.style.perspectiveOrigin = `${anchorX}px ${anchorY}px`;
		viewport.current = {
			width: width + side * 2,
			height: height + above + below,
			insets: {
				top: insets.top + above,
				right: insets.right + side,
				bottom: insets.bottom + below,
				left: insets.left + side,
			},
		};
		return viewport.current;
	}, [getInsets]);

	const targetRef = useRef(target);
	useLayoutEffect(() => {
		targetRef.current = target;
	}, [target]);

	useEffect(() => {
		const size = measure();
		if (!size) return;
		const to = fitCamera(target, size);
		const from = camera.current;
		const container = containerRef.current;
		if (!from || reducedMotion) {
			camera.current = to;
			apply(to);
			settle(container, to);
			setReady(true);
			return;
		}
		// Lets tests and verification wait for a flight to land instead of sleeping.
		container?.setAttribute("data-camera", "moving");
		let start: number | undefined;
		const tick = (now: number) => {
			start ??= now;
			const t = Math.min(1, (now - start) / FLIGHT_MS);
			const current = interpolateCamera(from, to, easeCamera(t));
			camera.current = t < 1 ? current : normalizeCamera(current);
			apply(camera.current);
			if (t < 1) flight.current = requestAnimationFrame(tick);
			else settle(container, camera.current);
		};
		flight.current = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(flight.current);
	}, [target, layout, reducedMotion, measure, apply]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const observer = new ResizeObserver(() => {
			const size = measure();
			if (!size) return;
			// A flight in progress would keep easing toward a camera fitted to the old size.
			cancelAnimationFrame(flight.current);
			camera.current = fitCamera(targetRef.current, size);
			apply(camera.current);
			settle(container, camera.current);
		});
		observer.observe(container);
		return () => observer.disconnect();
	}, [measure, apply]);

	/** Ref callback for a marker at map point (x, y). */
	const registerMarker = useCallback(
		(id: string, x: number, y: number) => (element: HTMLElement | null) => {
			if (!element) {
				markers.current.delete(id);
				return;
			}
			const placed = { element, x, y };
			markers.current.set(id, placed);
			const current = camera.current;
			const size = viewport.current;
			if (current && size) {
				const view = toView(current, size);
				place(placed, current, view.x, view.y);
			}
		},
		[place],
	);

	return { containerRef, planeRef, svgRef, clipRef, registerMarker, ready };
}
