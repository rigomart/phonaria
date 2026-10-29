import { geoCircle } from "d3-geo";
import { type RefCallback, useCallback, useLayoutEffect, useRef, useState } from "react";
import {
	type Bounds,
	type Camera,
	type Flight,
	fitCamera,
	flightCamera,
	type Insets,
	planFlight,
	type Viewport,
	zoomOf,
} from "@/lib/language-history/camera";
import {
	DRAG_THRESHOLD,
	type DragMode,
	decayVelocity,
	dragCamera,
	INERTIA_STOP,
	isAway,
	releaseVelocity,
} from "@/lib/language-history/drag";
import { type LandShape, loadLand } from "@/lib/language-history/land";
import { buildRoute } from "@/lib/language-history/route-path";
import {
	AREA_OPACITY,
	phaseOf,
	pinOpacity,
	ROUTE_LOOK,
	revealDelay,
	TIMING,
} from "@/lib/language-history/scene";
import type { PinHead } from "@/lib/language-history/scene";
import {
	EARTH_RADIUS_KM,
	orthographic,
	type Projected,
	RAD,
	wrapLongitude,
} from "@/lib/language-history/sphere";
import {
	nextThrottle,
	SPIN_RESUME_MS,
	spinAllowed,
	spinDegrees,
	spinWanted,
} from "@/lib/language-history/spin";
import {
	rest,
	restingTween,
	retarget,
	type Tween,
	tweenAt,
	tweenDone,
} from "@/lib/language-history/tween";
import type { Step, Stop } from "@/lib/language-history/types";
import { WORLD_LAND_COARSE, WORLD_LAND_FINE } from "@/lib/language-history/world-land";
import {
	type AreaShape,
	createGlobePainter,
	densityQuery,
	type Palette,
	type RouteShape,
	readPalette,
} from "./globe-painter";

type RouteState = RouteShape & { step: number; order: number; drawing: Tween; emphasizing: Tween };
type AreaState = AreaShape & { step: number; fading: Tween };
type PinPlace = {
	element: HTMLElement;
	lon: number;
	lat: number;
	/** Measured when it changes size, so frames don't read layout. */
	head: PinHead;
	shown: boolean | null;
};

const lazy = <T>(load: () => T) => {
	let value: T | undefined;
	return () => {
		value ??= load();
		return value;
	};
};

const coarseLand = lazy(() => loadLand(WORLD_LAND_COARSE));
const fineLand = lazy((): readonly LandShape[] => loadLand(WORLD_LAND_FINE));

function buildRoutes(steps: readonly Step[]): RouteState[] {
	return steps.flatMap((step, stepIndex) =>
		step.routes.map((waypoints, order) => ({
			step: stepIndex,
			order,
			path: buildRoute(waypoints),
			drawn: { type: "LineString" as const, coordinates: [] },
			tip: [0, 0] as [number, number],
			progress: 0,
			emphasis: 1,
			drawing: restingTween(0),
			emphasizing: restingTween(1),
		})),
	);
}

function buildAreas(steps: readonly Step[], stops: ReadonlyMap<string, Stop>): AreaState[] {
	return steps.flatMap((step, stepIndex) =>
		step.stops.flatMap((id) => {
			const stop = stops.get(id);
			if (!stop?.areaKm) return [];
			const radius = stop.areaKm / EARTH_RADIUS_KM;
			return [
				{
					step: stepIndex,
					at: stop.at,
					radius,
					circle: geoCircle()
						.center([stop.at[0], stop.at[1]])
						.radius(radius / RAD)
						.precision(4)(),
					opacity: 0,
					fading: restingTween(0),
				},
			];
		}),
	);
}

/**
 * The globe's moving parts: camera and flights, drags and glides, the arrows and areas of each
 * step, and the pins. One animation-frame loop runs while anything moves.
 */
function createGlobe({
	container,
	canvas,
	pins,
	routes,
	areas,
	getInsets,
	onFocusLost,
	onReveal,
	onAwayChange,
	reducedMotion,
}: {
	container: HTMLElement;
	canvas: HTMLCanvasElement;
	pins: ReadonlyMap<string, PinPlace>;
	routes: RouteState[];
	areas: AreaState[];
	getInsets: (container: HTMLElement) => Insets;
	onFocusLost: () => void;
	onReveal: (index: number) => void;
	/** Called when the reader turns the globe away from the step's view, or it comes back. */
	onAwayChange: (away: boolean) => void;
	reducedMotion: () => boolean;
}) {
	const painter = createGlobePainter(canvas);
	const point: Projected = { x: 0, y: 0, z: 0 };
	let palette: Palette = readPalette(container);
	let viewport: Viewport | null = null;
	let target: Bounds | null = null;
	/** The step's own view, which the recenter button returns to. */
	let home: Camera | null = null;
	let camera: Camera | null = null;
	let flight: { plan: Flight; start: number } | null = null;
	let drag: {
		id: number;
		mode: DragMode;
		startX: number;
		startY: number;
		x: number;
		y: number;
		time: number;
		vx: number;
		vy: number;
		/** False until the pointer passes the threshold, while it may still be a click. */
		active: boolean;
	} | null = null;
	let glide: { vx: number; vy: number; mode: DragMode; last: number } | null = null;
	/** A press that stopped a glide settles the camera even if it turns out to be a click. */
	let caught = false;
	let suppressClick = false;
	let away = false;
	let revealed = -1;
	let pendingReveal: { index: number; at: number } | null = null;
	let frame = 0;
	let pinsStale = true;
	let routesDrawn = -1;
	let spinStep = false;
	let motionReduced = false;
	let throttle = 0;
	let spinLast = 0;
	/** When the reader last stopped holding the globe still. */
	let releasedAt = Number.NEGATIVE_INFINITY;
	const holds = { hover: false, focus: false, details: false };
	let pageHidden = document.hidden;
	let inView = true;
	let resumeTimer = 0;

	function measure(): Viewport | null {
		const { width, height } = container.getBoundingClientRect();
		if (!width || !height) return null;
		painter.resize(width, height);
		const insets = getInsets(container);
		viewport = { width, height, insets };
		const freeX = insets.left + (width - insets.left - insets.right) / 2;
		container.style.setProperty("--recenter-x", `${freeX}px`);
		container.style.setProperty("--recenter-bottom", `${insets.bottom}px`);
		return viewport;
	}

	/** Records where the camera landed, so verification can wait on it and read it. */
	function settle() {
		if (!camera || !viewport) return;
		container.dataset.camera = "settled";
		container.dataset.cameraCenter = `${camera.lon.toFixed(1)},${camera.lat.toFixed(1)}`;
		container.dataset.cameraZoom = zoomOf(camera, viewport).toFixed(2);
	}

	function setAway(next: boolean) {
		if (next === away) return;
		away = next;
		onAwayChange(next);
	}

	function checkAway() {
		if (camera && home && viewport) setAway(isAway(camera, home, viewport));
	}

	function placePin(pin: PinPlace, view: Camera, size: Viewport) {
		orthographic(pin.lon, pin.lat, [view.lon, view.lat], point);
		const x = view.x + point.x * view.radius;
		const y = view.y + point.y * view.radius;
		const opacity = pinOpacity(point.z, x, y, pin.head, size.width, size.height);
		const shown = opacity > 0;
		const style = pin.element.style;
		if (shown) {
			style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
			style.opacity = opacity < 1 ? opacity.toFixed(2) : "";
		}
		if (shown !== pin.shown) {
			// Browsers drop focus from a hidden element silently, so the page moves it first.
			if (!shown && pin.element.contains(document.activeElement)) onFocusLost();
			style.visibility = shown ? "" : "hidden";
			pin.element.inert = !shown;
			pin.shown = shown;
		}
	}

	function render() {
		if (!camera || !viewport) return;
		painter.draw({
			camera,
			zoom: zoomOf(camera, viewport),
			palette,
			coarseLand,
			fineLand,
			areas,
			routes,
		});
		if (pinsStale) {
			for (const pin of pins.values()) placePin(pin, camera, viewport);
			pinsStale = false;
		}
		let drawn = 0;
		for (const route of routes) if (route.progress >= 1) drawn += 1;
		if (drawn !== routesDrawn) {
			routesDrawn = drawn;
			container.dataset.routesDrawn = String(drawn);
		}
	}

	function tick(now: number) {
		frame = 0;
		let busy = false;
		if (flight) {
			const t = (now - flight.start) / flight.plan.duration;
			camera = flightCamera(flight.plan, t);
			pinsStale = true;
			if (t >= 1) {
				flight = null;
				settle();
			} else busy = true;
		}
		if (glide && camera) {
			const elapsed = Math.min(64, Math.max(0, now - glide.last));
			glide.last = now;
			camera = dragCamera(camera, glide.vx * elapsed, glide.vy * elapsed, glide.mode);
			glide.vx = decayVelocity(glide.vx, elapsed);
			glide.vy = decayVelocity(glide.vy, elapsed);
			pinsStale = true;
			checkAway();
			if (Math.hypot(glide.vx, glide.vy) < INERTIA_STOP) {
				glide = null;
				settle();
			} else busy = true;
		}
		busy = spin(now) || busy;
		if (throttle > 0 !== "spinning" in container.dataset) {
			if (throttle > 0) container.dataset.spinning = "";
			else delete container.dataset.spinning;
		}
		if (pendingReveal && now >= pendingReveal.at) {
			const { index } = pendingReveal;
			pendingReveal = null;
			onReveal(index);
		}
		busy ||= pendingReveal !== null;
		for (const route of routes) {
			route.progress = tweenAt(route.drawing, now);
			route.emphasis = tweenAt(route.emphasizing, now);
			busy ||= !tweenDone(route.drawing, now) || !tweenDone(route.emphasizing, now);
		}
		for (const area of areas) {
			area.opacity = tweenAt(area.fading, now);
			busy ||= !tweenDone(area.fading, now);
		}
		render();
		if (busy) frame = requestAnimationFrame(tick);
	}

	function renderNow() {
		cancelAnimationFrame(frame);
		tick(performance.now());
	}

	function scheduleFrame() {
		frame ||= requestAnimationFrame(tick);
	}

	const held = () => holds.hover || holds.focus || holds.details || drag !== null;
	const spinMayRun = () =>
		spinAllowed({
			stepSpins: spinStep,
			landed: flight === null && pendingReveal === null,
			reducedMotion: motionReduced,
			hidden: pageHidden,
			inView,
		});

	/** Starts the frame loop if the spin should turn now, or wakes up when it should. */
	function updateSpin() {
		window.clearTimeout(resumeTimer);
		const now = performance.now();
		if (throttle > 0 || spinWanted(spinMayRun(), held(), releasedAt, now)) scheduleFrame();
		else if (spinMayRun() && !held()) {
			// Frames are stamped when they start, a little before the timer fires; leave a frame's margin.
			resumeTimer = window.setTimeout(updateSpin, releasedAt + SPIN_RESUME_MS - now + 20);
		}
	}

	function hold(reason: keyof typeof holds, on: boolean) {
		if (holds[reason] === on) return;
		holds[reason] = on;
		if (reason === "focus" && on) throttle = 0;
		if (!held()) releasedAt = performance.now();
		updateSpin();
	}

	/** Turns the globe and the step's own view together, so the spin alone never shows Recenter. */
	function spin(now: number): boolean {
		const mayRun = spinMayRun();
		const wanted = spinWanted(mayRun, held(), releasedAt, now);
		if (throttle === 0 && !wanted) {
			spinLast = 0;
			return false;
		}
		const elapsed = spinLast ? Math.min(64, Math.max(0, now - spinLast)) : 0;
		spinLast = now;
		throttle = mayRun ? nextThrottle(throttle, wanted, elapsed) : 0;
		const turn = spinDegrees(throttle, elapsed);
		if (turn > 0 && camera) {
			// Eastward, as the Earth turns: the view drifts toward the west.
			camera = { ...camera, lon: wrapLongitude(camera.lon - turn) };
			if (home) home = { ...home, lon: wrapLongitude(home.lon - turn) };
			pinsStale = true;
		}
		return throttle > 0 || wanted;
	}

	/** Tells the page step `active` starts to appear: at `at`, or now. */
	function scheduleReveal(active: number, at: number | null) {
		if (active === revealed) return;
		// A step scrolled past before its reveal still counts as revealed.
		if (pendingReveal) onReveal(pendingReveal.index);
		revealed = active;
		pendingReveal = at === null ? null : { index: active, at };
		if (at === null) onReveal(active);
	}

	/** Frames `bounds` for step `active`, flying there unless this is the first view or motion is reduced. */
	function goTo(bounds: Bounds, active: number, reduced: boolean, spins: boolean) {
		target = bounds;
		spinStep = spins;
		motionReduced = reduced;
		throttle = 0;
		const size = measure();
		if (!size) return;
		const now = performance.now();
		home = fitCamera(bounds, size);
		glide = null;
		// A drag in progress keeps the globe; the step's view waits behind the recenter button.
		const from = reduced || drag?.active ? null : camera;
		const instant = !from;
		if (drag?.active) {
			flight = null;
			checkAway();
		} else if (!from) {
			camera = home;
			flight = null;
			pinsStale = true;
			setAway(false);
			settle();
		} else {
			flight = { plan: planFlight(from, home, size), start: now };
			setAway(false);
			// Lets tests and verification wait for a flight to land instead of sleeping.
			container.dataset.camera = "moving";
		}
		const reveal = flight ? revealDelay(flight.plan.duration) : 0;
		container.style.setProperty("--pin-delay", `${reveal}ms`);
		scheduleReveal(active, reveal > 0 ? now + reveal : null);

		for (const route of routes) {
			const phase = phaseOf(route.step, active);
			const look = ROUTE_LOOK[phase];
			if (instant) {
				rest(route.drawing, look.progress);
				if (look.emphasis !== undefined) rest(route.emphasizing, look.emphasis);
				continue;
			}
			retarget(route.drawing, look.progress, now, {
				delay: phase === "current" ? reveal + route.order * TIMING.routeStagger : 0,
				duration: phase === "current" ? TIMING.routeDraw : TIMING.routeQuick,
			});
			if (look.emphasis !== undefined) {
				retarget(route.emphasizing, look.emphasis, now, { duration: TIMING.emphasis });
			}
		}
		for (const area of areas) {
			const phase = phaseOf(area.step, active);
			if (instant) rest(area.fading, AREA_OPACITY[phase]);
			else {
				retarget(area.fading, AREA_OPACITY[phase], now, {
					delay: phase === "current" ? reveal : 0,
					duration: TIMING.areaFade,
				});
			}
		}
		renderNow();
	}

	/** Flies back to the step's own view, without pulling back. */
	function recenter(reduced: boolean) {
		if (!camera || !home || !viewport) return;
		glide = null;
		setAway(false);
		if (reduced) {
			camera = home;
			flight = null;
			pinsStale = true;
			settle();
			renderNow();
			return;
		}
		flight = { plan: planFlight(camera, home, viewport, { near: true }), start: performance.now() };
		container.dataset.camera = "moving";
		scheduleFrame();
	}

	/** Refits the view to a new size at once: a flight would land at the old fit. */
	function resize() {
		const size = measure();
		if (!size || !target || !camera) return;
		home = fitCamera(target, size);
		camera = away ? { ...home, lon: camera.lon, lat: camera.lat } : home;
		flight = null;
		glide = null;
		pinsStale = true;
		settle();
		renderNow();
	}

	function onPointerDown(event: PointerEvent) {
		if (drag) {
			// A second finger: leave pinching to the browser.
			if (event.pointerId !== drag.id) endDrag(event, false);
			return;
		}
		if (!event.isPrimary || event.button !== 0) return;
		suppressClick = false;
		caught = glide !== null;
		glide = null;
		drag = {
			id: event.pointerId,
			mode: event.pointerType === "touch" ? "spin" : "free",
			startX: event.clientX,
			startY: event.clientY,
			x: event.clientX,
			y: event.clientY,
			time: event.timeStamp,
			vx: 0,
			vy: 0,
			active: false,
		};
	}

	function onPointerMove(event: PointerEvent) {
		if (!drag || event.pointerId !== drag.id || !camera) return;
		if (!drag.active) {
			const moved = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
			if (moved < DRAG_THRESHOLD) return;
			drag.active = true;
			canvas.setPointerCapture(event.pointerId);
			throttle = 0;
			flight = null;
			container.dataset.camera = "dragging";
		}
		const dx = event.clientX - drag.x;
		const dy = event.clientY - drag.y;
		const elapsed = Math.max(1, event.timeStamp - drag.time);
		drag.vx = 0.8 * (dx / elapsed) + 0.2 * drag.vx;
		drag.vy = 0.8 * (dy / elapsed) + 0.2 * drag.vy;
		drag.x = event.clientX;
		drag.y = event.clientY;
		drag.time = event.timeStamp;
		camera = dragCamera(camera, dx, dy, drag.mode);
		pinsStale = true;
		checkAway();
		scheduleFrame();
	}

	function endDrag(event: PointerEvent, released: boolean) {
		if (!drag) return;
		const ended = drag;
		drag = null;
		releasedAt = performance.now();
		updateSpin();
		if (!ended.active) {
			if (caught) settle();
			return;
		}
		suppressClick = true;
		const heldStillBeforeRelease = event.timeStamp - ended.time > 80;
		if (released && !heldStillBeforeRelease && !reducedMotion()) {
			const [vx, vy] = releaseVelocity(ended.vx, ended.vy);
			glide = { vx, vy, mode: ended.mode, last: performance.now() };
			container.dataset.camera = "moving";
			scheduleFrame();
		} else settle();
	}

	const onPointerUp = (event: PointerEvent) => {
		if (drag && event.pointerId === drag.id) endDrag(event, true);
	};
	const onPointerCancel = (event: PointerEvent) => {
		if (drag && event.pointerId === drag.id) endDrag(event, false);
	};
	canvas.addEventListener("pointerdown", onPointerDown);
	canvas.addEventListener("pointermove", onPointerMove);
	canvas.addEventListener("pointerup", onPointerUp);
	canvas.addEventListener("pointercancel", onPointerCancel);

	const onHover = (event: PointerEvent) => {
		if (!spinStep || event.pointerType === "touch" || !camera) return;
		const target = event.target as Element;
		let over = target.closest("[data-stop]") !== null;
		if (target === canvas) {
			const box = canvas.getBoundingClientRect();
			const dx = event.clientX - box.left - camera.x;
			const dy = event.clientY - box.top - camera.y;
			over = Math.hypot(dx, dy) < camera.radius;
		}
		hold("hover", over);
	};
	const onLeave = () => hold("hover", false);
	const onFocusIn = () => hold("focus", true);
	const onFocusOut = (event: FocusEvent) =>
		hold("focus", container.contains(event.relatedTarget as Node | null));
	const onVisibility = () => {
		pageHidden = document.hidden;
		updateSpin();
	};
	const onScreen = new IntersectionObserver(
		([entry]) => {
			inView = (entry?.intersectionRatio ?? 1) >= 0.5;
			updateSpin();
		},
		{ threshold: 0.5 },
	);
	container.addEventListener("pointermove", onHover);
	container.addEventListener("pointerleave", onLeave);
	container.addEventListener("focusin", onFocusIn);
	container.addEventListener("focusout", onFocusOut);
	document.addEventListener("visibilitychange", onVisibility);
	onScreen.observe(container);

	function refreshPalette() {
		palette = readPalette(container);
		renderNow();
	}

	function placeNewPin(pin: PinPlace) {
		if (camera && viewport) placePin(pin, camera, viewport);
	}

	return {
		goTo,
		recenter,
		resize,
		refreshPalette,
		placeNewPin,
		setDetailsOpen: (open: boolean) => hold("details", open),
		/** Whether a click on the globe was the end of a drag, and so not a click. */
		consumeDragClick() {
			const was = suppressClick;
			suppressClick = false;
			return was;
		},
		destroy() {
			cancelAnimationFrame(frame);
			canvas.removeEventListener("pointerdown", onPointerDown);
			canvas.removeEventListener("pointermove", onPointerMove);
			canvas.removeEventListener("pointerup", onPointerUp);
			canvas.removeEventListener("pointercancel", onPointerCancel);
			container.removeEventListener("pointermove", onHover);
			container.removeEventListener("pointerleave", onLeave);
			container.removeEventListener("focusin", onFocusIn);
			container.removeEventListener("focusout", onFocusOut);
			document.removeEventListener("visibilitychange", onVisibility);
			onScreen.disconnect();
			window.clearTimeout(resumeTimer);
		},
	};
}

/**
 * Draws the story's globe on a canvas and flies it to `target` whenever the
 * step changes. Returns refs for the map's container and canvas, a ref
 * callback for each pin, and whether pins have been placed yet.
 */
export function useGlobe({
	steps,
	stops,
	active,
	target,
	getInsets,
	layout,
	reducedMotion,
	onFocusLost,
	onReveal,
	detailsOpen = false,
}: {
	steps: readonly Step[];
	stops: ReadonlyMap<string, Stop>;
	active: number;
	target: Bounds;
	getInsets: (container: HTMLElement) => Insets;
	/** Changes when the space the cards cover changes, so the camera refits. */
	layout: number;
	reducedMotion: boolean;
	/** Called when the focused pin or recenter button is about to be hidden. */
	onFocusLost?: () => void;
	/** Called once per step as its arrows, areas and pins start to appear. */
	onReveal?: (index: number) => void;
	/** A stop's details are open, which holds a spinning globe still. */
	detailsOpen?: boolean;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const pins = useRef(new Map<string, PinPlace>());
	const pinRefs = useRef(new Map<string, RefCallback<HTMLElement>>());
	const globe = useRef<ReturnType<typeof createGlobe> | null>(null);
	const insetsRef = useRef(getInsets);
	const [ready, setReady] = useState(false);
	const [away, setAway] = useState(false);

	const focusLostRef = useRef(onFocusLost);
	const revealRef = useRef(onReveal);
	const reducedMotionRef = useRef(reducedMotion);
	useLayoutEffect(() => {
		insetsRef.current = getInsets;
		focusLostRef.current = onFocusLost;
		revealRef.current = onReveal;
		reducedMotionRef.current = reducedMotion;
	}, [getInsets, onFocusLost, onReveal, reducedMotion]);

	useLayoutEffect(() => {
		const container = containerRef.current;
		const canvas = canvasRef.current;
		if (!container || !canvas) return;
		const created = createGlobe({
			container,
			canvas,
			pins: pins.current,
			routes: buildRoutes(steps),
			areas: buildAreas(steps, stops),
			getInsets: (element) => insetsRef.current(element),
			onFocusLost: () => focusLostRef.current?.(),
			onReveal: (index) => revealRef.current?.(index),
			onAwayChange: (next) => {
				// The recenter button is about to go; let the page move focus first.
				if (!next && document.activeElement?.closest("[data-recenter]")) {
					focusLostRef.current?.();
				}
				setAway(next);
			},
			reducedMotion: () => reducedMotionRef.current,
		});
		globe.current = created;
		const resizes = new ResizeObserver(() => created.resize());
		resizes.observe(container);
		const themes = new MutationObserver(() => created.refreshPalette());
		themes.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
		// Moving the window to a display of another density may not resize the
		// container, so watch the density itself; the query only matches one ratio.
		let density: MediaQueryList | null = null;
		const onDensity = () => {
			created.resize();
			watchDensity();
		};
		const watchDensity = () => {
			density?.removeEventListener("change", onDensity);
			density = window.matchMedia(densityQuery(window.devicePixelRatio));
			density.addEventListener("change", onDensity);
		};
		watchDensity();
		return () => {
			density?.removeEventListener("change", onDensity);
			resizes.disconnect();
			themes.disconnect();
			created.destroy();
			globe.current = null;
		};
	}, [steps, stops]);

	useLayoutEffect(() => {
		// Layout effects run child first, so the page may still be pointing
		// `getInsets` at the previous step's card. A microtask runs once the
		// whole commit is done but still before the browser paints.
		let cancelled = false;
		queueMicrotask(() => {
			if (!cancelled)
				globe.current?.goTo(target, active, reducedMotion, steps[active]?.spin ?? false);
		});
		setReady(true);
		return () => {
			cancelled = true;
		};
	}, [target, active, layout, reducedMotion, steps, stops]);

	// Heads grow when their label shows, so re-check whether each still fits on the map.
	const heads = useRef<ResizeObserver | null>(null);
	const measureHeads = useCallback((entries: ResizeObserverEntry[]) => {
		for (const entry of entries) {
			const element = entry.target.parentElement;
			for (const pin of pins.current.values()) {
				if (pin.element !== element) continue;
				const [box] = entry.borderBoxSize;
				pin.head = box
					? { width: box.inlineSize, height: box.blockSize }
					: { width: entry.contentRect.width, height: entry.contentRect.height };
				globe.current?.placeNewPin(pin);
			}
		}
	}, []);
	useLayoutEffect(() => () => heads.current?.disconnect(), []);

	const pinRef = useCallback(
		(id: string, lon: number, lat: number) => {
			let callback = pinRefs.current.get(id);
			if (!callback) {
				callback = (element) => {
					if (!element) {
						const head = pins.current.get(id)?.element.lastElementChild;
						if (head) heads.current?.unobserve(head);
						pins.current.delete(id);
						return;
					}
					const pin: PinPlace = { element, lon, lat, head: { width: 0, height: 0 }, shown: null };
					pins.current.set(id, pin);
					// Pin markup in history-map.tsx must keep the head as the last child.
					const head = element.lastElementChild;
					if (head) {
						heads.current ??= new ResizeObserver(measureHeads);
						heads.current.observe(head);
					}
					globe.current?.placeNewPin(pin);
				};
				pinRefs.current.set(id, callback);
			}
			return callback;
		},
		[measureHeads],
	);

	useLayoutEffect(() => {
		globe.current?.setDetailsOpen(detailsOpen);
	}, [detailsOpen]);

	const recenter = useCallback(() => globe.current?.recenter(reducedMotion), [reducedMotion]);

	/** A click on the globe, unless it ended a drag. */
	const isClick = useCallback(() => !globe.current?.consumeDragClick(), []);

	return { containerRef, canvasRef, pinRef, ready, away, recenter, isClick };
}
