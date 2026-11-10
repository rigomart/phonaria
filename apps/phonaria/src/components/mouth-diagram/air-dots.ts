import {
	AIR_SPEED,
	type AirDrawing,
	type AirState,
	airAt,
	at,
	FORK,
	pathLength,
	sealDistance,
} from "./air-path";
import { TRUNK_FOLDS_DISTANCE } from "./model";

/** A puff of air: how far it has travelled from the lungs, and which way it went. */
type Particle = {
	distance: number;
	/** -1 to 1: where across the air stream it rides. */
	lane: number;
	/** Null until it reaches the fork behind the tongue. */
	nasal: boolean | null;
	pastFolds: boolean;
	/** Buzzing folds let the air through in bursts; the air between bursts is drawn faint. */
	faint: boolean;
	/** Pressed against a seal this frame. */
	held: boolean;
};

/** How far apart moving puffs are, and how tightly they pack behind a seal. */
const FLOW_SPACING = 5;
const QUEUE_SPACING = 2.6;
/** Bursts of air a second while the folds buzz. */
const BUZZ_HZ = 8;
const BUZZ_SPACING = AIR_SPEED / BUZZ_HZ;

/** The air as a cloud of dots that crowd behind a seal and scatter where the air is rough. */
export class AirDots {
	private particles: Particle[] = [];
	private spawnDebt = 0;
	private opacity = 1;
	private wasFlowing = false;

	settle(state: AirState): void {
		this.particles = seed(state, true);
		this.wasFlowing = state.flow;
		this.opacity = 1;
	}

	advance(ms: number, state: AirState): void {
		// The air column is there the moment the lungs push: it fades in along the whole
		// path instead of creeping up from the bottom, and fades out when they stop.
		if (state.flow && !this.wasFlowing) {
			this.particles = seed(state, false);
			this.opacity = 0;
		}
		this.wasFlowing = state.flow;
		if (state.flow) this.opacity = Math.min(1, this.opacity + ms / 180);
		else {
			this.opacity = Math.max(0, this.opacity - ms / 260);
			if (this.opacity === 0) this.particles = [];
		}

		const last = this.particles[this.particles.length - 1];
		if (state.flow && (!last || last.distance > QUEUE_SPACING)) {
			// Faster air needs more puffs to stay as dense.
			this.spawnDebt += ((ms * AIR_SPEED) / FLOW_SPACING / 1000) * (1 + 1.2 * state.burst);
			while (this.spawnDebt >= 1) {
				this.spawnDebt -= 1;
				this.particles.push({
					distance: 0,
					lane: Math.random() * 2 - 1,
					nasal: null,
					pastFolds: false,
					faint: false,
					held: false,
				});
			}
		} else {
			this.spawnDebt = 0;
		}

		const narrowest = FORK + state.route.narrowest.distance;
		for (const particle of this.particles) {
			let speed = AIR_SPEED * (1 + 1.2 * state.burst);
			const beyond = particle.distance - narrowest;
			if (state.hissing && particle.nasal === false && beyond > 0 && beyond < 110) speed *= 1.4;
			particle.distance += (speed * ms) / 1000;
			particle.held = false;
		}

		// Air that meets a seal queues up behind it, oldest first.
		const seal = sealDistance(state);
		if (seal !== null) {
			const atFolds = state.voice === "shut";
			this.particles.sort((a, b) => b.distance - a.distance);
			let limit = seal;
			for (const particle of this.particles) {
				const past = atFolds
					? particle.pastFolds
					: particle.nasal === true || particle.distance > seal + 14;
				if (past) continue;
				particle.held = particle.distance >= limit;
				particle.distance = Math.min(particle.distance, limit);
				limit = particle.distance - QUEUE_SPACING;
			}
		}

		const buzzOpen = Math.sin(state.clock * Math.PI * 2 * BUZZ_HZ) > -0.1;
		for (const particle of this.particles) {
			if (!particle.pastFolds && particle.distance >= TRUNK_FOLDS_DISTANCE) {
				particle.pastFolds = true;
				particle.faint = state.voice === "on" && !buzzOpen;
			}
			if (particle.nasal === null && particle.distance >= FORK) particle.nasal = state.nasal;
		}
		this.particles = this.particles.filter(
			(particle) =>
				particle.distance < pathLength({ ...state, nasal: Boolean(particle.nasal) }) - 1,
		);
	}

	draw(state: AirState): AirDrawing {
		let bright = "";
		let faint = "";
		for (const particle of this.particles) {
			// Air under pressure is never still: held puffs jostle, and a ripple runs
			// through the crowd toward the seal.
			const seedPhase = particle.lane * 40;
			const push = particle.held
				? -2.5 +
					1.6 * Math.sin(state.clock * 9 + seedPhase) +
					1.8 * Math.sin(state.clock * 5.5 + particle.distance * 0.07)
				: 0;
			const sway = particle.held ? 0.3 * Math.sin(state.clock * 6.3 + seedPhase * 1.7) : 0;
			const { point, normal, width, rough } = airAt(
				particle.distance + push,
				Boolean(particle.nasal),
				state,
			);
			// Rough air: each puff shakes to its own fast rhythm. No random numbers, so a
			// still frame comes out the same on the server and in the browser.
			const shake = rough * 5 * Math.sin(particle.lane * 127.1 + state.clock * 311.7);
			const offset = (particle.lane + sway) * (width + shake);
			const d = `M${at([point[0] + normal[0] * offset, point[1] + normal[1] * offset])}h0`;
			if (particle.faint) faint += d;
			else bright += d;
		}
		return { opacity: this.opacity, bright, faint };
	}
}

/**
 * Air laid out along its whole path. `packed` crowds it against a seal, as it
 * is once things have settled; without it the crowd has yet to build.
 */
function seed(state: AirState, packed: boolean): Particle[] {
	if (!state.flow) return [];
	const seal = sealDistance(state);
	const end = seal ?? pathLength(state);
	const particles: Particle[] = [];
	let distance = end;
	let index = 0;
	while (distance > 0) {
		const pastFolds = distance >= TRUNK_FOLDS_DISTANCE;
		particles.push({
			distance,
			// A fixed scatter, so a still frame is the same on every render.
			lane: ((Math.abs(Math.sin(index * 12.9898) * 43758.5453) % 1) * 2 - 1) * 0.95,
			nasal: distance >= FORK ? state.nasal : null,
			pastFolds,
			held: false,
			faint: state.voice === "on" && pastFolds && distance % BUZZ_SPACING > BUZZ_SPACING * 0.45,
		});
		// Held air is packed tight near the seal and thins out further back.
		distance -= packed && seal !== null && end - distance < 60 ? QUEUE_SPACING : FLOW_SPACING;
		index++;
	}
	return particles;
}
