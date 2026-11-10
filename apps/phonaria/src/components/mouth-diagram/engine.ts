import { AirDots } from "./air-dots";
import type { AirDrawing, AirState } from "./air-path";
import { easeInOut, type Point } from "./geometry";
import {
	FOLDS,
	FOLDS_MIDDLE,
	lerpPose,
	type OralRoute,
	oralRouteFor,
	type Pose,
	type Shapes,
	shapesFor,
} from "./model";
import type { Step, Voice } from "./sounds";

/** Everything the drawing needs for one instant. */
export type Frame = {
	stepIndex: number;
	/** The step's pose has been reached and is being held. */
	holding: boolean;
	shapes: Shapes;
	air: AirDrawing;
	folds: string;
	voice: Voice;
	/** 0 to 1 strength of the buzz around the voice box, and of each ripple on the neck. */
	buzz: number;
	ripples: [number, number, number];
	/** Where the sound is shaped: the seal or the narrow gap, with a breathing radius. */
	contact: { point: Point; radius: number } | null;
};

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
	holding: boolean;
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
		holding: !moving,
	};
}

/**
 * Plays a sound's steps. It owns the clock, and turns each instant into a
 * `Frame`; it never touches the page.
 */
export class MouthEngine {
	private time = 0;
	/** Seconds that keep running through the loop, for the buzz and the wobble. */
	private clock = 0;
	private foldGap = 1;
	private burst = 0;
	private wasStopped = false;
	private readonly air = new AirDots();

	constructor(private readonly steps: readonly Step[]) {}

	/** Jumps to the moment `index` starts to hold, with the air already where it would be. */
	seek(index: number): Frame {
		this.time = holdStart(this.steps, index);
		const instant = instantAt(this.steps, this.time);
		const route = oralRouteFor(instant.pose, Boolean(instant.step.sides));
		this.foldGap = foldGapFor(instant.step);
		this.burst = 0;
		this.wasStopped = instant.stopped;
		const state = this.airState(instant, route);
		this.air.settle(state);
		return this.draw(instant, route, state);
	}

	/** Moves time on by `ms` and returns what to draw. */
	advance(ms: number): Frame {
		this.time += ms;
		this.clock += ms / 1000;
		const instant = instantAt(this.steps, this.time);
		const route = oralRouteFor(instant.pose, Boolean(instant.step.sides));
		const { step, stopped } = instant;

		if (this.wasStopped && !stopped) this.burst = 1;
		this.wasStopped = stopped;
		this.burst = Math.max(0, this.burst - ms / 320);

		const target = foldGapFor(step);
		const rate = step.voice === "shut" ? 0.03 : 0.012;
		this.foldGap += (target - this.foldGap) * Math.min(1, ms * rate);

		const state = this.airState(instant, route);
		this.air.advance(ms, state);
		return this.draw(instant, route, state);
	}

	private airState({ step, pose, stopped, hissing }: Instant, route: OralRoute): AirState {
		return {
			flow: step.flow,
			voice: step.voice,
			breath: Boolean(step.breath),
			hissing,
			sealed: stopped,
			nasal: pose.velum > 0.5,
			route,
			burst: this.burst,
			clock: this.clock,
		};
	}

	private draw(instant: Instant, route: OralRoute, state: AirState): Frame {
		const { step, pose, stopped, hissing, arrived } = instant;
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
			holding: instant.holding,
			shapes: shapesFor(pose),
			air: this.air.draw(state),
			folds: foldsPath(step.voice, this.foldGap, this.clock),
			voice: step.voice,
			buzz: buzzing ? 0.6 + 0.4 * Math.sin(this.clock * 30) : 0,
			ripples: [pulse(0), pulse(0.9), pulse(1.8)],
			contact,
		};
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
