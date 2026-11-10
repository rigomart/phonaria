import { easeInOut, type Point, trackAt } from "./geometry";
import {
	FOLDS,
	FOLDS_MIDDLE,
	lerpPose,
	NASAL,
	type OralRoute,
	oralRouteFor,
	type Pose,
	type Shapes,
	shapesFor,
	TRUNK,
	TRUNK_FOLDS_DISTANCE,
} from "./model";
import type { Step, Voice } from "./sounds";

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

/** Everything the drawing needs for one instant. */
export type Frame = {
	stepIndex: number;
	shapes: Shapes;
	airBright: string;
	airFaint: string;
	/** Air fades out when the lungs stop pushing. */
	airOpacity: number;
	folds: string;
	voice: Voice;
	/** 0 to 1 strength of the buzz around the voice box, and of each ripple on the neck. */
	buzz: number;
	ripples: [number, number, number];
	/** Where the sound is shaped: the seal or the narrow gap, with a breathing radius. */
	contact: { point: Point; radius: number } | null;
};

/** Units a second: air let go at the lungs is out of the mouth in a little over two seconds. */
const AIR_SPEED = 270;
/** How the air is drawn: a cloud of dots, or streaks that run in lanes. */
export type AirStyle = "dots" | "lines";

/**
 * Per style: how far apart moving puffs are, how tightly they pack behind a
 * seal, and how long a puff is drawn when it moves and when it is held.
 */
const AIR = {
	dots: { spacing: 5, queue: 2.6, length: 0, heldLength: 0 },
	lines: { spacing: 8, queue: 3.4, length: 20, heldLength: 5 },
} as const;

/** Where across the stream each lane of streaks runs, in the order they are filled. */
const LANES = [-0.78, 0.26, -0.26, 0.78];
/** Bursts of air a second while the folds buzz. */
const BUZZ_HZ = 8;
const BUZZ_SPACING = AIR_SPEED / BUZZ_HZ;

const duration = (step: Step) => step.move + step.hold;

export function timelineLength(steps: readonly Step[]): number {
	return steps.reduce((sum, step) => sum + duration(step), 0);
}

/** The time at which `index` has finished moving and starts to hold. */
export function holdStart(steps: readonly Step[], index: number): number {
	let time = 0;
	for (let i = 0; i < index; i++) time += duration(steps[i] as Step);
	return time + (steps[index] as Step).move;
}

type Instant = {
	index: number;
	step: Step;
	pose: Pose;
	/** The mouth is sealed right now. */
	stopped: boolean;
	hissing: boolean;
	arrived: boolean;
};

function instantAt(steps: readonly Step[], time: number): Instant {
	let local = Math.max(0, time) % timelineLength(steps);
	let index = 0;
	while (local >= duration(steps[index] as Step)) {
		local -= duration(steps[index] as Step);
		index++;
	}
	const step = steps[index] as Step;
	const previous = steps[(index - 1 + steps.length) % steps.length] as Step;
	const moving = local < step.move;
	const progress = moving ? easeInOut(local / step.move) : 1;
	const arrived = progress > 0.85;
	return {
		index,
		step,
		pose: moving ? lerpPose(previous.pose, step.pose, progress) : step.pose,
		// A seal holds from the moment the tongue or lips arrive until they start to leave.
		stopped: step.stop
			? arrived || Boolean(previous.stop)
			: Boolean(previous.stop) && moving && progress < 0.12,
		hissing: Boolean(step.hiss) && arrived,
		arrived,
	};
}

const at = ([x, y]: Point) => `${x.toFixed(1)} ${y.toFixed(1)}`;

/**
 * Plays a sound's steps. It owns the clock and the air particles, and turns
 * each instant into a `Frame`; it never touches the page.
 */
export class MouthEngine {
	private time = 0;
	/** Seconds that keep running through the loop, for the buzz and the wobble. */
	private clock = 0;
	private particles: Particle[] = [];
	private spawnDebt = 0;
	private foldGap = 1;
	private airOpacity = 1;
	private burst = 0;
	private wasStopped = false;
	private wasFlowing = false;

	private spawned = 0;

	constructor(
		private readonly steps: readonly Step[],
		private readonly style: AirStyle = "dots",
	) {}

	/** Jumps to the moment `index` starts to hold, with the air already where it would be. */
	seek(index: number): Frame {
		this.time = holdStart(this.steps, index);
		const instant = instantAt(this.steps, this.time);
		const route = oralRouteFor(instant.pose, Boolean(instant.step.sides));
		this.foldGap = foldGapFor(instant.step);
		this.burst = 0;
		this.wasStopped = instant.stopped;
		this.wasFlowing = instant.step.flow;
		this.particles = seedParticles(instant, route, true, this.style);
		this.airOpacity = 1;
		return this.draw(instant, route);
	}

	/** Moves time on by `ms` and returns what to draw. */
	advance(ms: number): Frame {
		this.time += ms;
		this.clock += ms / 1000;
		const instant = instantAt(this.steps, this.time);
		const route = oralRouteFor(instant.pose, Boolean(instant.step.sides));
		const { step, pose, stopped, hissing } = instant;
		const nasalOpen = pose.velum > 0.5;
		const forkDistance = TRUNK.total;

		if (this.wasStopped && !stopped) this.burst = 1;
		this.wasStopped = stopped;
		this.burst = Math.max(0, this.burst - ms / 320);

		const target = foldGapFor(step);
		const rate = step.voice === "shut" ? 0.03 : 0.012;
		this.foldGap += (target - this.foldGap) * Math.min(1, ms * rate);

		// The air column is there the moment the lungs push: it fades in along the whole
		// path instead of creeping up from the bottom, and fades out when they stop.
		if (step.flow && !this.wasFlowing) {
			this.particles = seedParticles(instant, route, false, this.style);
			this.airOpacity = 0;
		}
		this.wasFlowing = step.flow;
		if (step.flow) this.airOpacity = Math.min(1, this.airOpacity + ms / 180);
		else {
			this.airOpacity = Math.max(0, this.airOpacity - ms / 260);
			if (this.airOpacity === 0) this.particles = [];
		}

		const last = this.particles[this.particles.length - 1];
		const air = AIR[this.style];
		if (step.flow && (!last || last.distance > air.queue)) {
			// Faster air needs more puffs to stay as dense.
			this.spawnDebt += ((ms * AIR_SPEED) / air.spacing / 1000) * (1 + 1.2 * this.burst);
			while (this.spawnDebt >= 1) {
				this.spawnDebt -= 1;
				this.particles.push({
					distance: 0,
					lane:
						this.style === "lines"
							? (LANES[this.spawned++ % LANES.length] as number)
							: Math.random() * 2 - 1,
					nasal: null,
					pastFolds: false,
					faint: false,
					held: false,
				});
			}
		} else {
			this.spawnDebt = 0;
		}

		const narrowestDistance = forkDistance + route.narrowest.distance;
		for (const particle of this.particles) {
			let speed = AIR_SPEED * (1 + 1.2 * this.burst);
			const beyond = particle.distance - narrowestDistance;
			if (hissing && particle.nasal === false && beyond > 0 && beyond < 110) speed *= 1.4;
			particle.distance += (speed * ms) / 1000;
			particle.held = false;
		}

		// Air that meets a seal queues up behind it, oldest first.
		this.particles.sort((a, b) => b.distance - a.distance);
		if (step.voice === "shut") {
			let limit = TRUNK_FOLDS_DISTANCE - 6;
			for (const particle of this.particles) {
				if (particle.pastFolds) continue;
				particle.held = particle.distance >= limit;
				particle.distance = Math.min(particle.distance, limit);
				limit = particle.distance - air.queue;
			}
		}
		if (stopped && !nasalOpen) {
			const seal = narrowestDistance - 5;
			let limit = seal;
			for (const particle of this.particles) {
				if (particle.nasal === true || particle.distance > seal + 14) continue;
				particle.held ||= particle.distance >= limit;
				particle.distance = Math.min(particle.distance, limit);
				limit = particle.distance - air.queue;
			}
		}

		const buzzOpen = Math.sin(this.clock * Math.PI * 2 * BUZZ_HZ) > -0.1;
		for (const particle of this.particles) {
			if (!particle.pastFolds && particle.distance >= TRUNK_FOLDS_DISTANCE) {
				particle.pastFolds = true;
				particle.faint = step.voice === "on" && !buzzOpen;
			}
			if (particle.nasal === null && particle.distance >= forkDistance) {
				particle.nasal = nasalOpen;
			}
		}
		this.particles = this.particles.filter(
			(particle) =>
				particle.distance < forkDistance + (particle.nasal ? NASAL.total : route.track.total) - 1,
		);

		return this.draw(instant, route);
	}

	private draw(instant: Instant, route: OralRoute): Frame {
		const { step, pose, stopped, hissing, arrived } = instant;
		const air = AIR[this.style];
		let airBright = "";
		let airFaint = "";
		for (const particle of this.particles) {
			// Air under pressure is never still: held puffs jostle, and a ripple runs
			// through the crowd toward the seal.
			const seed = particle.lane * 40;
			const push = particle.held
				? -2.5 +
					1.6 * Math.sin(this.clock * 9 + seed) +
					1.8 * Math.sin(this.clock * 5.5 + particle.distance * 0.07)
				: 0;
			const sway = particle.held ? 0.3 * Math.sin(this.clock * 6.3 + seed * 1.7) : 0;
			const head = particle.distance + push;
			const spot = (distance: number) => this.spot(particle, distance, sway, instant, route);

			let d: string;
			if (this.style === "dots") {
				d = `M${at(spot(head))}h0`;
			} else {
				// A streak: the puff's path over the last moment, bent wherever the air is rough.
				const length = particle.held ? air.heldLength : air.length * (1 + 0.6 * this.burst);
				d = `M${at(spot(head))}`;
				for (let step = 1; step <= 4; step++) {
					d += `L${at(spot(Math.max(0, head - (length * step) / 4)))}`;
				}
			}
			if (particle.faint) airFaint += d;
			else airBright += d;
		}

		const buzzing = step.voice === "on";
		const pulse = (phase: number) => (buzzing ? Math.max(0, Math.sin(this.clock * 9 - phase)) : 0);

		let contact: Frame["contact"] = null;
		const radius = 11 + 1.5 * Math.sin(this.clock * 5);
		if (step.voice === "shut" || step.breath) {
			contact = { point: FOLDS_MIDDLE, radius: radius + 22 };
		} else if (step.sides && arrived) {
			contact = { point: route.narrowest.point, radius };
		} else if ((step.stop || step.hiss) && arrived && (stopped || hissing)) {
			contact = { point: route.narrowest.point, radius };
		}

		return {
			stepIndex: instant.index,
			shapes: shapesFor(pose),
			airBright,
			airFaint,
			airOpacity: this.airOpacity,
			folds: foldsPath(step.voice, this.foldGap, this.clock),
			voice: step.voice,
			buzz: buzzing ? 0.6 + 0.4 * Math.sin(this.clock * 30) : 0,
			ripples: [pulse(0), pulse(0.9), pulse(1.8)],
			contact,
		};
	}
	/** Where one puff is drawn when it is `distance` along its path. */
	private spot(
		particle: Particle,
		distance: number,
		sway: number,
		{ step, hissing }: Instant,
		route: OralRoute,
	): Point {
		const forkDistance = TRUNK.total;
		let width: number;
		let place: { point: Point; normal: Point };
		// How rough the air is here: 0 for smooth, up to 1 just past where it turns rough.
		let rough = 0;
		if (distance < forkDistance) {
			place = trackAt(TRUNK, distance);
			width = 11;
			const pastFolds = distance - TRUNK_FOLDS_DISTANCE;
			if (step.breath && pastFolds > 0) rough = Math.max(0, 1 - pastFolds / 130);
		} else if (particle.nasal) {
			const local = distance - forkDistance;
			place = trackAt(NASAL, local);
			// The nose is roomy: the stream spreads out inside it and again as it leaves.
			width = 8 + 8 * Math.sin(Math.min(1, local / (NASAL.total - 110)) * Math.PI);
			width += Math.max(0, local - (NASAL.total - 80)) * 0.14;
		} else {
			const local = distance - forkDistance;
			place = trackAt(route.track, local);
			const fromNarrowest = Math.abs(local - route.narrowest.distance);
			width = Math.min(9, Math.max(0.6, route.squeeze / 2 - 3) + fromNarrowest * 0.12);
			width += Math.max(0, local - route.lipsDistance) * 0.16;
			const beyond = local - route.narrowest.distance;
			if (hissing && beyond > 0) rough = Math.max(0, 1 - beyond / 130);
		}
		let offset = (particle.lane + sway) * width;
		if (rough > 0) {
			// Dots shake, each to its own fast rhythm; streaks carry a ripple along their
			// length. No random numbers, so a still frame is the same on the server and here.
			offset +=
				this.style === "dots"
					? particle.lane * 5 * rough * Math.sin(particle.lane * 127.1 + this.clock * 311.7)
					: 4.5 * rough * Math.sin(distance * 0.32 - this.clock * 30 + particle.lane * 9);
		}
		return [place.point[0] + place.normal[0] * offset, place.point[1] + place.normal[1] * offset];
	}
}

/** How far apart the folds are: wide for plain breath, narrowed for a breathy hiss, together otherwise. */
const foldGapFor = (step: Step) => {
	if (step.voice !== "off") return 0;
	return step.breath ? 0.4 : 1;
};

const FOLDS_LENGTH = Math.hypot(FOLDS.back[0] - FOLDS.front[0], FOLDS.back[1] - FOLDS.front[1]);

/** A point `along` the folds (0 at the front, 1 at the back), pushed `across` them. */
function onFolds(along: number, across = 0): string {
	const dx = (FOLDS.back[0] - FOLDS.front[0]) / FOLDS_LENGTH;
	const dy = (FOLDS.back[1] - FOLDS.front[1]) / FOLDS_LENGTH;
	const x = FOLDS.front[0] + dx * along * FOLDS_LENGTH - dy * across;
	const y = FOLDS.front[1] + dy * along * FOLDS_LENGTH + dx * across;
	return `${x.toFixed(1)} ${y.toFixed(1)}`;
}

/** The folds in the side view: two stubs when apart, a rippling line when buzzing, a bar when shut. */
function foldsPath(voice: Voice, gap: number, clock: number): string {
	if (voice === "on" && gap < 0.35) {
		let d = `M${onFolds(0)}`;
		for (let along = 0.05; along <= 1.001; along += 0.05) {
			const wave = Math.sin(along * FOLDS_LENGTH * 0.55 + clock * 38);
			d += `L${onFolds(along, 3 * Math.sin(along * Math.PI) * wave)}`;
		}
		return d;
	}
	const half = gap * 0.17;
	if (half < 0.01) return `M${onFolds(0)}L${onFolds(1)}`;
	return `M${onFolds(0)}L${onFolds(0.5 - half)}M${onFolds(0.5 + half)}L${onFolds(1)}`;
}

/**
 * Air laid out along its whole path. `packed` crowds it against a seal, as it
 * is once a step has settled; without it the crowd has yet to build.
 */
function seedParticles(
	instant: Instant,
	route: OralRoute,
	packed: boolean,
	style: AirStyle,
): Particle[] {
	const { step, pose, stopped } = instant;
	if (!step.flow) return [];
	const nasal = pose.velum > 0.5;
	const forkDistance = TRUNK.total;
	let end = forkDistance + (nasal ? NASAL.total : route.track.total);
	if (step.voice === "shut") end = TRUNK_FOLDS_DISTANCE - 6;
	else if (stopped && !nasal) end = forkDistance + route.narrowest.distance - 5;
	const held = step.voice === "shut" || (stopped && !nasal);

	const particles: Particle[] = [];
	let distance = end;
	let index = 0;
	while (distance > 0) {
		const pastFolds = distance >= TRUNK_FOLDS_DISTANCE;
		particles.push({
			distance,
			// A fixed scatter, so a still frame is the same on every render.
			lane:
				style === "lines"
					? (LANES[index % LANES.length] as number)
					: ((Math.abs(Math.sin(index * 12.9898) * 43758.5453) % 1) * 2 - 1) * 0.95,
			nasal: distance >= forkDistance ? nasal : null,
			pastFolds,
			held: false,
			faint: step.voice === "on" && pastFolds && distance % BUZZ_SPACING > BUZZ_SPACING * 0.45,
		});
		// Held air is packed tight near the seal and thins out further back.
		distance -= packed && held && end - distance < 60 ? AIR[style].queue : AIR[style].spacing;
		index++;
	}
	return particles;
}
