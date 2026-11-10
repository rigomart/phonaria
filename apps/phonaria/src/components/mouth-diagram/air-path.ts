import { type Point, trackAt } from "./geometry";
import { NASAL, type OralRoute, TRUNK, TRUNK_FOLDS_DISTANCE } from "./model";
import type { Voice } from "./sounds";

/** Units a second: air let go at the lungs is out of the mouth in a little over two seconds. */
export const AIR_SPEED = 270;

/** How far up from the lungs the path splits into mouth and nose. */
export const FORK = TRUNK.total;

/** What the air has to deal with at one instant. */
export type AirState = {
	/** The lungs are pushing. */
	flow: boolean;
	voice: Voice;
	/** Air turns rough at the vocal folds. */
	breath: boolean;
	/** Air turns rough at the narrowest point of the mouth. */
	hissing: boolean;
	/** The mouth is sealed at its narrowest point. */
	sealed: boolean;
	/** The soft palate is down, so the air goes through the nose. */
	nasal: boolean;
	route: OralRoute;
	/** 1 just after a seal lets go, falling to 0. */
	burst: number;
	/** Seconds that never stop, for anything that shakes or ripples. */
	clock: number;
};

/** How far along its path the air gets before something holds it back, or null if nothing does. */
export function sealDistance(state: AirState): number | null {
	if (state.voice === "shut") return TRUNK_FOLDS_DISTANCE - 5;
	if (state.sealed && !state.nasal) return FORK + state.route.narrowest.distance - 4;
	return null;
}

export const pathLength = (state: AirState) =>
	FORK + (state.nasal ? NASAL.total : state.route.track.total);

/**
 * The air's path at `distance` from the lungs: its middle, the direction across
 * it, half its width, and how rough the air is there (0 smooth, 1 roughest).
 */
export function airAt(
	distance: number,
	nasal: boolean,
	state: AirState,
): { point: Point; normal: Point; width: number; rough: number } {
	if (distance < FORK) {
		const pastFolds = distance - TRUNK_FOLDS_DISTANCE;
		return {
			...trackAt(TRUNK, distance),
			width: 11,
			rough: state.breath && pastFolds > 0 ? Math.max(0, 1 - pastFolds / 130) : 0,
		};
	}
	const local = distance - FORK;
	if (nasal) {
		const inside = 8 + 8 * Math.sin(Math.min(1, local / (NASAL.total - 110)) * Math.PI);
		return {
			...trackAt(NASAL, local),
			width: inside + Math.max(0, local - (NASAL.total - 80)) * 0.14,
			rough: 0,
		};
	}
	const { route } = state;
	const fromNarrowest = Math.abs(local - route.narrowest.distance);
	const beyond = local - route.narrowest.distance;
	return {
		...trackAt(route.track, local),
		width:
			Math.min(9, Math.max(0.6, route.squeeze / 2 - 3) + fromNarrowest * 0.12) +
			Math.max(0, local - route.lipsDistance) * 0.16,
		rough: state.hissing && beyond > 0 ? Math.max(0, 1 - beyond / 130) : 0,
	};
}

/** The air as two paths of dots: the bright puffs, and the faint ones between bursts of voice. */
export type AirDrawing = { opacity: number; bright: string; faint: string };

export const at = ([x, y]: Point) => `${x.toFixed(1)} ${y.toFixed(1)}`;
