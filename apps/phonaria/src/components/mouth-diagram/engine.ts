import { easeInOut, type Point, trackAt } from "./geometry";
import {
	FOLDS,
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
	/** The vocal folds seen from above: half the width of the opening at its back end. */
	glottisHalfWidth: number;
	/** Where the sound is shaped: the seal or the narrow gap, with a breathing radius. */
	contact: { point: Point; radius: number } | null;
};

const AIR_SPEED = 190;
const SPAWN_PER_MS = 0.06;
const QUEUE_SPACING = 2.6;
const BUZZ_HZ = 5;
const FOLDS_MIDDLE = (FOLDS.front + FOLDS.back) / 2;

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
	let local = time % timelineLength(steps);
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

const dot = (x: number, y: number) => `M${x.toFixed(1)} ${y.toFixed(1)}h0`;

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

	constructor(private readonly steps: readonly Step[]) {}

	/** Jumps to the moment `index` starts to hold, with the air already where it would be. */
	seek(index: number): Frame {
		this.time = holdStart(this.steps, index);
		const instant = instantAt(this.steps, this.time);
		const route = oralRouteFor(instant.pose);
		this.foldGap = foldGapFor(instant.step.voice);
		this.burst = 0;
		this.wasStopped = instant.stopped;
		this.particles = seedParticles(instant, route);
		this.airOpacity = 1;
		return this.draw(instant, route);
	}

	/** Moves time on by `ms` and returns what to draw. */
	advance(ms: number): Frame {
		this.time += ms;
		this.clock += ms / 1000;
		const instant = instantAt(this.steps, this.time);
		const route = oralRouteFor(instant.pose);
		const { step, pose, stopped, hissing } = instant;
		const nasalOpen = pose.velum > 0.5;
		const forkDistance = TRUNK.total;

		if (this.wasStopped && !stopped) this.burst = 1;
		this.wasStopped = stopped;
		this.burst = Math.max(0, this.burst - ms / 320);

		const target = foldGapFor(step.voice);
		const rate = step.voice === "shut" ? 0.03 : 0.012;
		this.foldGap += (target - this.foldGap) * Math.min(1, ms * rate);

		if (step.flow) this.airOpacity = 1;
		else {
			this.airOpacity = Math.max(0, this.airOpacity - ms / 260);
			if (this.airOpacity === 0) this.particles = [];
		}

		const last = this.particles[this.particles.length - 1];
		if (step.flow && (!last || last.distance > QUEUE_SPACING)) {
			this.spawnDebt += ms * SPAWN_PER_MS;
			while (this.spawnDebt >= 1) {
				this.spawnDebt -= 1;
				this.particles.push({
					distance: 0,
					lane: Math.random() * 2 - 1,
					nasal: null,
					pastFolds: false,
					faint: false,
				});
			}
		} else {
			this.spawnDebt = 0;
		}

		const narrowestDistance = forkDistance + route.narrowest.distance;
		for (const particle of this.particles) {
			let speed = AIR_SPEED * (1 + 2.2 * this.burst);
			const beyond = particle.distance - narrowestDistance;
			if (hissing && particle.nasal === false && beyond > 0 && beyond < 110) speed *= 1.5;
			particle.distance += (speed * ms) / 1000;
		}

		// Air that meets a seal queues up behind it, oldest first.
		this.particles.sort((a, b) => b.distance - a.distance);
		if (step.voice === "shut") {
			let limit = TRUNK_FOLDS_DISTANCE - 6;
			for (const particle of this.particles) {
				if (particle.pastFolds) continue;
				particle.distance = Math.min(particle.distance, limit);
				limit = particle.distance - QUEUE_SPACING;
			}
		}
		if (stopped && !nasalOpen) {
			const seal = narrowestDistance - 5;
			let limit = seal;
			for (const particle of this.particles) {
				if (particle.nasal === true || particle.distance > seal + 14) continue;
				particle.distance = Math.min(particle.distance, limit);
				limit = particle.distance - QUEUE_SPACING;
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
		const forkDistance = TRUNK.total;
		let airBright = "";
		let airFaint = "";
		for (const particle of this.particles) {
			let width: number;
			let place: { point: Point; normal: Point };
			if (particle.distance < forkDistance) {
				place = trackAt(TRUNK, particle.distance);
				width = 11;
			} else if (particle.nasal) {
				const local = particle.distance - forkDistance;
				place = trackAt(NASAL, local);
				width = 8 + Math.max(0, local - (NASAL.total - 80)) * 0.14;
			} else {
				const local = particle.distance - forkDistance;
				place = trackAt(route.track, local);
				const fromNarrowest = Math.abs(local - route.narrowest.distance);
				width = Math.min(9, Math.max(0.6, route.narrowest.gap / 2 - 3) + fromNarrowest * 0.12);
				width += Math.max(0, local - route.lipsDistance) * 0.16;
				const beyond = local - route.narrowest.distance;
				if (hissing && beyond > 0) {
					// Rough air: each puff shakes to its own fast rhythm. No random numbers, so a
					// still frame comes out the same on the server and in the browser.
					const shake = Math.sin(particle.lane * 127.1 + this.clock * 311.7);
					width += shake * 5 * Math.max(0, 1 - beyond / 130);
				}
			}
			const offset = particle.lane * width;
			const d = dot(
				place.point[0] + place.normal[0] * offset,
				place.point[1] + place.normal[1] * offset,
			);
			if (particle.faint) airFaint += d;
			else airBright += d;
		}

		const buzzing = step.voice === "on";
		const pulse = (phase: number) => (buzzing ? Math.max(0, Math.sin(this.clock * 9 - phase)) : 0);

		let contact: Frame["contact"] = null;
		const radius = 11 + 1.5 * Math.sin(this.clock * 5);
		if (step.voice === "shut") contact = { point: [FOLDS_MIDDLE, FOLDS.y], radius: radius + 16 };
		else if ((step.stop || step.hiss) && arrived && (stopped || hissing)) {
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
			glottisHalfWidth: buzzing
				? 0.8 + 2.4 * Math.abs(Math.sin(this.clock * 19))
				: 0.6 + this.foldGap * 15,
			contact,
		};
	}
}

const foldGapFor = (voice: Voice) => (voice === "off" ? 1 : 0);

/** The folds in the side view: two stubs when apart, a rippling line when buzzing, a bar when shut. */
function foldsPath(voice: Voice, gap: number, clock: number): string {
	if (voice === "on" && gap < 0.35) {
		let d = `M${FOLDS.front} ${FOLDS.y}`;
		for (let x = FOLDS.front + 3.5; x <= FOLDS.back; x += 3.5) {
			const taper = Math.sin(((x - FOLDS.front) / (FOLDS.back - FOLDS.front)) * Math.PI);
			d += `L${x.toFixed(1)} ${(FOLDS.y + 3 * taper * Math.sin(x * 0.55 + clock * 38)).toFixed(1)}`;
		}
		return d;
	}
	const half = gap * 11;
	if (half < 0.5) return `M${FOLDS.front} ${FOLDS.y}H${FOLDS.back}`;
	return `M${FOLDS.front} ${FOLDS.y}H${(FOLDS_MIDDLE - half).toFixed(1)}M${(FOLDS_MIDDLE + half).toFixed(1)} ${FOLDS.y}H${FOLDS.back}`;
}

/** Air laid out along its path as it would be once the step has settled. */
function seedParticles(instant: Instant, route: OralRoute): Particle[] {
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
			lane: ((Math.abs(Math.sin(index * 12.9898) * 43758.5453) % 1) * 2 - 1) * 0.95,
			nasal: distance >= forkDistance ? nasal : null,
			pastFolds,
			faint: step.voice === "on" && pastFolds && distance % 38 > 17,
		});
		// Held air is packed tight near the seal and thins out further back.
		distance -= held && end - distance < 60 ? QUEUE_SPACING : AIR_SPEED / (SPAWN_PER_MS * 1000);
		index++;
	}
	return particles;
}
