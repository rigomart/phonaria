import {
	AIR_SPEED,
	type Air,
	type AirDrawing,
	type AirState,
	airAt,
	at,
	pathLength,
	sealDistance,
} from "./air-path";
import { TRUNK_FOLDS_DISTANCE } from "./model";

/**
 * The lines of a stream: where across it each one runs, how far apart the
 * glints that slide along it are, and how far along its first glint starts.
 */
const LANES = [
	{ across: 0, gap: 64, lead: 0 },
	{ across: -0.62, gap: 78, lead: 37 },
	{ across: 0.62, gap: 71, lead: 61 },
] as const;

/** A glint: long while air flows freely, a short pulse while the voice chops it, a speck when held. */
const GLINT = { flowing: 34, voiced: 13, held: 5 } as const;
/** How far apart pulses and specks are. */
const VOICED_GAP = 25;
const HELD_GAP = 9;

/** How far apart the points of a line are. Close enough that ripples stay smooth. */
const STEP = 3;

/**
 * The air as a stream: a few unbroken lines that follow the path all the way
 * out, with glints sliding along them to show which way it moves. The lines
 * sway gently while the voice is on and ripple where the air is rough. A seal
 * cuts the stream short; when it lets go, the front rushes out.
 */
export class AirStreams implements Air {
	/** How far the stream reaches. */
	private front = 0;
	/** Air cut off beyond a seal that has just closed: it runs on out and is gone. */
	private cutOff: { from: number; to: number } | null = null;
	/** How far the strokes have slid. */
	private slide = 0;
	private opacity = 1;
	private wasFlowing = false;

	settle(state: AirState): void {
		this.front = sealDistance(state) ?? pathLength(state);
		this.cutOff = null;
		this.wasFlowing = state.flow;
		this.opacity = 1;
	}

	advance(ms: number, state: AirState): void {
		const seconds = ms / 1000;
		const end = pathLength(state);
		const seal = sealDistance(state);

		// The air column is there the moment the lungs push, and fades when they stop.
		if (state.flow && !this.wasFlowing) {
			this.front = seal ?? end;
			this.cutOff = null;
			this.opacity = 0;
		}
		this.wasFlowing = state.flow;
		this.opacity = state.flow
			? Math.min(1, this.opacity + ms / 180)
			: Math.max(0, this.opacity - ms / 260);
		if (!state.flow) return;

		this.slide += AIR_SPEED * (1 + 1.2 * state.burst) * seconds;
		if (seal !== null) {
			if (this.front > seal + 2 && !this.cutOff) this.cutOff = { from: seal, to: this.front };
			this.front = seal;
		} else {
			// Let go: the front rushes for the way out.
			this.front = Math.min(end, this.front + AIR_SPEED * (1.6 + 2.2 * state.burst) * seconds);
		}
		if (this.cutOff) {
			this.cutOff.from += AIR_SPEED * 1.5 * seconds;
			this.cutOff.to = Math.min(this.cutOff.to, end);
			// Gone once it has run out, or once the stream behind catches it up.
			if (this.cutOff.from >= this.cutOff.to) this.cutOff = null;
			else if (seal === null && this.front >= this.cutOff.from) {
				this.front = Math.max(this.front, this.cutOff.to);
				this.cutOff = null;
			}
		}
	}

	draw(state: AirState): AirDrawing {
		const held = sealDistance(state) !== null;
		const streams = LANES.map((lane, index) => {
			let d = this.line(lane.across, index, 0, this.front, state);
			if (this.cutOff) d += this.line(lane.across, index, this.cutOff.from, this.cutOff.to, state);
			if (held) {
				// Pressed against the seal: specks creep toward it and jostle.
				const creep = (state.clock * 12) % (GLINT.held + HELD_GAP);
				return {
					d,
					dash: `${GLINT.held} ${HELD_GAP}`,
					offset: -creep + 1.6 * Math.sin(state.clock * 9 + index * 2.1),
				};
			}
			const glint = state.voice === "on" ? GLINT.voiced : GLINT.flowing;
			const gap = state.voice === "on" ? VOICED_GAP : lane.gap;
			return { d, dash: `${glint} ${gap}`, offset: -((this.slide + lane.lead) % (glint + gap)) };
		});
		return { opacity: this.opacity, bright: "", faint: "", streams };
	}

	/** One line of the stream between two distances from the lungs. */
	private line(across: number, index: number, from: number, to: number, state: AirState): string {
		if (to - from < 1) return "";
		let d = "";
		for (let distance = from; ; distance = Math.min(to, distance + STEP)) {
			const { point, normal, width, rough } = airAt(distance, state.nasal, state);
			// Spread wider than the dots do, so the lines read as separate where there is room
			// and squeeze together where the path narrows.
			let offset = across * width * 1.45;
			// Voice: a slow sway that sets in above the vocal folds and travels up.
			const pastFolds = distance - TRUNK_FOLDS_DISTANCE;
			if (state.voice === "on" && pastFolds > 0) {
				const swell = Math.min(1, pastFolds / 40);
				offset += 2.2 * swell * Math.sin(distance * 0.13 - state.clock * 16 + index * 0.7);
			}
			// Rough air: a tighter, uneven ripple. No random numbers, so a still frame
			// comes out the same on the server and in the browser.
			if (rough > 0) {
				offset +=
					rough *
					(3.4 * Math.sin(distance * 0.34 - state.clock * 24 + index * 4) +
						1.5 * Math.sin(distance * 0.61 + state.clock * 29 + index * 2.3));
			}
			d += `${d ? "L" : "M"}${at([point[0] + normal[0] * offset, point[1] + normal[1] * offset])}`;
			if (distance >= to) break;
		}
		return d;
	}
}
