import {
	buildTrack,
	closedSplinePath,
	cubicAt,
	cubicTail,
	lerpPoints,
	type Outline,
	outlinePath,
	parseOutline,
	type Point,
	rotateAround,
	sampleSpline,
	type Track,
} from "./geometry";

/**
 * One head, cut down the middle and facing left, in a 500 by 500 box. The
 * shapes are a hand-drawn illustration: each part is its own outline, none is
 * stroked, and parts that touch overlap, so they join without a seam. The
 * jaw, lips, tongue and soft palate move; everything else is fixed.
 */
export const VIEW_BOX = "0 0 500 500";

/** Where the jaw hinges, behind the throat wall and level with the roof of the mouth. */
export const JAW_PIVOT: Point = [460, 125];

/** The illustration is drawn with the mouth open this far: degrees the jaw has dropped from clenched teeth. */
const JAW_DRAWN = 4;

/** The 9 tongue points a pose sets, from the root up over the top to the underside. */
export type TonguePoints = readonly [
	rootUpper: Point,
	back: Point,
	dorsum: Point,
	middle: Point,
	blade: Point,
	tipTop: Point,
	tip: Point,
	tipUnder: Point,
	underside: Point,
];

export type Pose = {
	/** Degrees the jaw has dropped from clenched teeth. */
	jaw: number;
	tongue: TonguePoints;
	/** 0 is raised, shutting off the nose; 1 is lowered, letting air into it. */
	velum: number;
	/** 0 to 1: lips pushed forward into a circle. */
	lipRound: number;
	/** 0 to 1: lips pressed together. */
	lipClose: number;
	/** 0 to 1: bottom lip drawn back and up against the top teeth. */
	lipTuck: number;
};

/** Skull, nose and the back wall of the throat. The space under its arch is the inside of the nose. */
export const HEAD_PATH =
	"M7.26672 114.988C47.6144 71.1718 72.419 51.5391 98.5439 1H499.544V499H474.544L464.935 321.617C453.813 248.34 442.458 154.098 399.923 84.1289C375.458 74.1953 368.411 69.1836 358.38 47.3203C333.704 15.039 310.689 11.7695 249.681 20.0156C135.083 6.15231 93.9425 51.2031 75.169 75.8438L32.3917 133.598C-3.89343 138.699 8.0714 124.258 7.26672 114.988Z";

/** Roof of the mouth, gum ridge and the gum the top teeth sit in. */
export const PALATE_PATH =
	"M222.949 120.355L224.727 120.304C237.176 119.792 283.535 119.422 296 119.5C302.248 119.539 301.61 131.749 296 134.5C292.5 136.216 237.825 136.718 237.825 136.718C226.469 137.788 215.274 139.913 204.059 141.847C192.875 143.604 175.98 144.513 166.137 157.507C156.294 170.501 160.5 177.001 135.137 183.007C133.481 191.402 129.242 216.89 121.137 221.507C120.238 213.73 119.297 210.308 118.637 202.507C118.867 200.218 116.063 190.616 113.899 188.983C92.2144 172.622 71.885 151.001 70.5001 136.718C69.7685 129.173 78.6058 123.302 86.0003 122.001C106.5 119.918 106.868 119.753 125.473 120.585C157.943 122.246 190.469 121.3 222.949 120.355Z";

/** Front of the neck, with the epiglottis rising behind the root of the tongue. */
export const NECK_PATH =
	"M375.596 499.759C373.596 491.259 373.596 494.759 370.952 485.521C368.198 460.224 374.977 426.918 393 396.5C435.801 340.648 419 309.5 400 343.5C389 357 382.31 353.223 372.5 361.5C354.005 377.105 315.411 397.715 335.5 411.206C344.797 417.45 350.195 427.106 350.241 441.568C351.683 464.423 333.515 480.388 332.597 499.759H375.596Z";

/** Back of the voice box, where the vocal folds are anchored. */
export const LARYNX_BACK_PATH =
	"M455.5 403.5C451 429.5 462.546 452.594 463.5 498H445.5C444.203 478.539 450.277 466.16 428.738 435.313C422.703 426.664 422.953 408.016 429.078 397.352C443.172 364.703 448.617 379.938 455.5 403.5Z";

/** The top front tooth: the tip of the gum outline, cut out so it can be coloured. */
export const UPPER_TOOTH_PATH =
	"M135.1 183C133.5 191.4 129.2 216.9 121.1 221.5C120.2 213.7 119.3 210.3 118.6 202.5C118.9 200.2 116.1 190.6 113.9 189C120.5 184.6 128.5 182.6 135.1 183Z";

export const UPPER_TOOTH_TIP: Point = [121.1, 221.5];

/** The vocal folds, from where they meet at the front of the throat to their anchors at the back. */
export const FOLDS = { front: [372, 474.7], back: [437, 448.5] } as const satisfies Record<
	string,
	Point
>;

export const FOLDS_MIDDLE: Point = [
	(FOLDS.front[0] + FOLDS.back[0]) / 2,
	(FOLDS.front[1] + FOLDS.back[1]) / 2,
];

/** Lower lip, chin, floor of the mouth and the gum the bottom teeth sit in. Points 14 to 19 are the lip. */
const JAW: Outline = parseOutline(
	"M335.5 411.206C365 438.104 408 370.932 372.5 361.5C269 334 164.5 361.5 164.5 361.5C138.5 354.5 170 287.5 139 248.5C139 248.5 141 280 132 280C123 280 132.5 271.5 121.5 248.5C110.5 225.5 89.59 248.008 104.5 268.5C110.501 280 108.043 302.418 104.5 321.5C100.957 340.582 69.9997 375.5 121.5 410C190.519 418.35 306 384.309 335.5 411.206Z",
);

const LOWER_TOOTH_TIP = JAW[9] as Point;

/** The bottom front tooth, cut out of the jaw outline like the top one. */
export const LOWER_TOOTH_PATH = outlinePath([
	...cubicTail([JAW[6], JAW[7], JAW[8], JAW[9]] as [Point, Point, Point, Point], 0.7),
	...(JAW.slice(10, 13) as Point[]),
]);

/** Turns the jaw group from where it is drawn to `jaw` degrees open. */
export const jawTransform = (jaw: number) =>
	`rotate(${(JAW_DRAWN - jaw).toFixed(2)} ${JAW_PIVOT[0]} ${JAW_PIVOT[1]})`;

/** Moves a point drawn in the illustration to where the jaw carries it. */
const withJaw = (point: Point, jaw: number) => rotateAround(point, JAW_PIVOT, jaw - JAW_DRAWN);

type Offsets = Record<number, Point>;

const shift = (points: readonly Point[], offsets: Offsets, amount: number): Point[] =>
	points.map((point, index) => {
		const offset = offsets[index];
		return offset ? [point[0] + offset[0] * amount, point[1] + offset[1] * amount] : point;
	});

const UPPER_LIP: Outline = parseOutline(
	"M84.8681 225.649C78.8252 222.638 81.0761 213.724 82.3681 207.649C86.5474 188 85.4068 176.79 80.2313 158.144C77.4883 148.261 68.4463 141.227 70.2314 133.86C72.0166 126.493 83.7772 121.522 91.0473 123.397C96.8632 124.898 122.047 165.144 109.775 187.04C104.652 196.179 110.833 207.153 106.368 216.149C101.329 225.56 93.915 231.231 84.8681 225.649Z",
);
const UPPER_LIP_ROUND: Offsets = {
	0: [-12, 3],
	1: [-12, 3],
	2: [-11, 0],
	3: [-11, 0],
	4: [-11, 0],
	5: [-5, 0],
	16: [-2, 0],
	17: [-7, 3],
	18: [-7, 3],
	19: [-8, 3],
	20: [-12, 3],
	21: [-12, 3],
};
const UPPER_LIP_CLOSE: Offsets = {
	0: [0, 6],
	1: [0, 6],
	2: [0, 3],
	3: [0, 3],
	17: [0, 5],
	18: [0, 5],
	19: [0, 6],
	20: [0, 6],
	21: [0, 6],
};

const LOWER_LIP_ROUND: Offsets = {
	14: [-2, 0],
	15: [-3, -1],
	16: [-8, -3],
	17: [-13, -3],
	18: [-11, -1],
	19: [-8, 0],
};
const LOWER_LIP_CLOSE: Offsets = {
	14: [0, -3],
	15: [0, -6],
	16: [0, -9],
	17: [0, -9],
	18: [0, -4],
};

const LOWER_LIP_TUCK: Offsets = {
	14: [3, -2],
	15: [6, -5],
	16: [12, -10],
	17: [12, -10],
	18: [7, -3],
};

const upperLipPoints = (pose: Pose) =>
	shift(shift(UPPER_LIP, UPPER_LIP_ROUND, pose.lipRound), UPPER_LIP_CLOSE, pose.lipClose);
/** As drawn: turn with the jaw to place them. */
const jawPoints = (pose: Pose) =>
	shift(
		shift(shift(JAW, LOWER_LIP_ROUND, pose.lipRound), LOWER_LIP_CLOSE, pose.lipClose),
		LOWER_LIP_TUCK,
		pose.lipTuck,
	);

/** As drawn: hanging, with the way into the nose open. */
const VELUM_LOWERED: Outline = parseOutline(
	"M377.5 151.5C407.5 186 412.5 228.5 377.5 175.5C369.906 162.016 359.102 153.612 336 145.5C308.079 135.696 302 134.242 289 135.5C278.666 136.5 274.003 119.827 290 119.5C314.5 119 331.894 119.418 377.5 151.5Z",
);
/** Lifted until its end presses on the back wall of the throat. */
const VELUM_RAISED: Outline = parseOutline(
	"M395 131C432 134 448 176 400 158C385 152 365 150 340 146.5C310 137 302 134.242 289 135.5C278.666 136.5 274.003 119.827 290 119.5C314.5 119 350 120 395 131Z",
);

const velumPoints = (pose: Pose) => lerpPoints(VELUM_RAISED, VELUM_LOWERED, pose.velum);

const TONGUE_ROOT_LOW: Point = [373.2, 362.5];
const TONGUE_BASE_BACK: Point = [267.3, 385.8];
/** As drawn: the front of the tongue's base rides on the jaw. */
const TONGUE_FRONT: Point[] = [
	[140.7, 311],
	[136.7, 346.1],
	[152.7, 373],
];

function tongueOutline(pose: Pose): Point[] {
	// The underside is given as drawn; it sits on the floor of the mouth, so the jaw carries it.
	const free = pose.tongue.slice(0, 8);
	const underside = withJaw(pose.tongue[8], pose.jaw);
	return [
		TONGUE_ROOT_LOW,
		...free,
		underside,
		...TONGUE_FRONT.map((point) => withJaw(point, pose.jaw)),
		TONGUE_BASE_BACK,
	];
}

export type Shapes = {
	/** Transform that turns the jaw group about its hinge. */
	jaw: string;
	jawBody: string;
	tongue: string;
	upperLip: string;
	velum: string;
};

export function shapesFor(pose: Pose): Shapes {
	return {
		jaw: jawTransform(pose.jaw),
		jawBody: outlinePath(jawPoints(pose)),
		tongue: closedSplinePath(tongueOutline(pose)),
		upperLip: outlinePath(upperLipPoints(pose)),
		velum: outlinePath(velumPoints(pose)),
	};
}

export function lerpPose(a: Pose, b: Pose, t: number): Pose {
	const mix = (x: number, y: number) => x + (y - x) * t;
	return {
		jaw: mix(a.jaw, b.jaw),
		tongue: lerpPoints(a.tongue, b.tongue, t) as unknown as TonguePoints,
		velum: mix(a.velum, b.velum),
		lipRound: mix(a.lipRound, b.lipRound),
		lipClose: mix(a.lipClose, b.lipClose),
		lipTuck: mix(a.lipTuck, b.lipTuck),
	};
}

/** From the lungs up through the voice box to the back of the mouth. */
export const TRUNK: Track = buildTrack(
	sampleSpline([
		[408, 512],
		[406, 480],
		[404, 462],
		[403, 440],
		[404, 417],
		[411, 397],
		[426, 370],
		[440, 335],
		[436, 295],
		[427, 258],
		[424, 240],
	]),
);

export const TRUNK_FOLDS_DISTANCE = 50;

/** Up behind the soft palate, through the nose and out of the nostril. */
export const NASAL: Track = buildTrack(
	sampleSpline([
		[424, 240],
		[428, 205],
		[424, 172],
		[411, 136],
		[385, 100],
		[330, 78],
		[250, 70],
		[170, 78],
		[112, 97],
		[72, 118],
		[52, 137],
		[40, 160],
		[22, 192],
		[-8, 224],
	]),
);

/** Points on the roof of the mouth that the gap to the tongue is measured from, back to front. */
const ROOF_ANCHORS: Point[] = [
	[296, 135.5],
	[255, 136.7],
	[215, 140],
	[190, 144],
	[170, 153.5],
	[156.5, 172.9],
	[140, 182],
	[130.6, 203.7],
];

const SAMPLES_PER_CONTROL = 5;

/** How far onto the tongue the air's line dips when it goes round the sides. */
const SIDE_DEPTH = 16;

export type OralRoute = {
	track: Track;
	/** Distance along the track of the narrowest point, and how wide the gap is there. */
	narrowest: { distance: number; gap: number; point: Point };
	/** How wide the air stream is at the narrowest point. */
	squeeze: number;
	/** Distance along the track at which the air leaves the lips. */
	lipsDistance: number;
};

/**
 * The line air follows through the mouth for a pose: halfway between the roof
 * and the tongue, between the teeth, between the lips and out. With `sides`,
 * the air goes round a tongue that touches the roof: the line dips onto the
 * tongue there, since the sides of the tongue can't be seen from here.
 */
export function oralRouteFor(pose: Pose, sides = false): OralRoute {
	const surface = sampleSpline(pose.tongue.slice(0, 7), 5);
	const velum = velumPoints(pose);
	const lowerToothTip = withJaw(LOWER_TOOTH_TIP, pose.jaw);
	const upperLip = upperLipPoints(pose);
	const jaw = jawPoints(pose);

	const stations: { point: Point; gap: number; path: Point }[] = [];
	const between = (roof: Point, floor: Point) => {
		const gap = Math.hypot(roof[0] - floor[0], roof[1] - floor[1]);
		const point: Point = [(roof[0] + floor[0]) / 2, (roof[1] + floor[1]) / 2];
		// Round the sides: step down past the tongue's surface where it is close to the roof.
		const dip = sides ? Math.max(0, SIDE_DEPTH - gap / 2) : 0;
		stations.push({ point, gap, path: [point[0] + dip * 0.35, point[1] + dip] });
	};
	const nearest = (target: Point, candidates: readonly Point[]) =>
		candidates.reduce((best, candidate) =>
			Math.hypot(candidate[0] - target[0], candidate[1] - target[1]) <
			Math.hypot(best[0] - target[0], best[1] - target[1])
				? candidate
				: best,
		);

	for (const anchor of [velum[3] as Point, velum[6] as Point, ...ROOF_ANCHORS]) {
		between(anchor, nearest(anchor, surface));
	}
	const lipTop = cubicAt(
		[upperLip[18], upperLip[19], upperLip[20], upperLip[21]] as [Point, Point, Point, Point],
		0.6,
	);
	const lipBottom = withJaw(
		cubicAt([jaw[15], jaw[16], jaw[17], jaw[18]] as [Point, Point, Point, Point], 0.3),
		pose.jaw,
	);
	between(UPPER_TOOTH_TIP, nearest(UPPER_TOOTH_TIP, [...surface, lowerToothTip, lipBottom]));
	between(lipTop, lipBottom);
	// Lips that overlap are shut, however far apart their middles are.
	const lipStation = stations[stations.length - 1] as { gap: number };
	if (lipBottom[1] <= lipTop[1]) lipStation.gap = 0;

	const lips = stations[stations.length - 1] as { point: Point };
	const start = TRUNK.points[TRUNK.points.length - 1] as Point;
	const controls: Point[] = [
		start,
		...stations.map((station) => station.path),
		[lips.point[0] - 40, lips.point[1] + 4],
		[-8, lips.point[1] + 12],
	];
	const track = buildTrack(sampleSpline(controls, SAMPLES_PER_CONTROL));
	let narrowestIndex = 0;
	stations.forEach((station, index) => {
		if (station.gap < (stations[narrowestIndex] as { gap: number }).gap) narrowestIndex = index;
	});
	const narrowest = stations[narrowestIndex] as { point: Point; gap: number };
	return {
		track,
		narrowest: {
			distance: track.lengths[(narrowestIndex + 1) * SAMPLES_PER_CONTROL] as number,
			gap: narrowest.gap,
			point: narrowest.point,
		},
		squeeze: sides ? SIDE_DEPTH : narrowest.gap,
		lipsDistance: track.lengths[stations.length * SAMPLES_PER_CONTROL] as number,
	};
}
