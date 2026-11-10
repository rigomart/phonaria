import {
	buildTrack,
	closedSplinePath,
	lerpPoints,
	lineTo,
	moveTo,
	openSplineSegments,
	type Point,
	rotateAround,
	sampleSpline,
	type Track,
} from "./geometry";

/**
 * One head, cut down the middle and facing left, in a 500 by 500 box. Tissue
 * is painted first, the air spaces are painted over it in the backdrop colour,
 * and the moving parts (jaw, lips, tongue, soft palate) go on top. Nothing is
 * outlined, so parts that overlap join without a seam.
 */
export const VIEW_BOX = "0 0 500 500";

/** Where the jaw hinges, just in front of the ear. */
export const JAW_PIVOT: Point = [410, 175];

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
};

// --- Fixed anatomy ---

const PROFILE: Point[] = [
	[128, -10],
	[112, 30],
	[104, 64],
	[84, 102],
	[54, 134],
	[30, 147],
	[26, 157],
	[34, 166],
	[52, 172],
	[70, 179],
	[80, 189],
	[84, 204],
];

const NECK_FRONT: Point[] = [
	[226, 393],
	[252, 403],
	[259, 428],
	[267, 470],
	[271, 512],
];

/** Skull, face above the mouth, back wall of the throat and the neck. */
export const HEAD_PATH = `${moveTo(PROFILE[0] as Point)}${openSplineSegments(PROFILE)}${lineTo([114, 214])}${lineTo(NECK_FRONT[0] as Point)}${openSplineSegments(NECK_FRONT)}${lineTo([512, 512], [512, -10])}Z`;

const PALATE: Point[] = [
	[120, 217],
	[130, 215],
	[141, 209],
	[156, 193],
	[176, 180],
	[205, 172],
	[240, 168],
	[275, 171],
	[298, 177],
	[305, 169],
	[298, 161],
];

const NASAL_FLOOR: Point[] = [
	[298, 161],
	[250, 158],
	[180, 160],
	[120, 166],
	[96, 170],
	[76, 171],
	[60, 172],
	[52, 177],
	[50, 186],
];

const NASAL_ROOF_AND_THROAT: Point[] = [
	[38, 182],
	[42, 169],
	[56, 157],
	[78, 146],
	[100, 135],
	[130, 118],
	[190, 101],
	[260, 99],
	[320, 112],
	[356, 138],
	[374, 168],
	[380, 215],
	[381, 280],
	[378, 340],
	[372, 390],
	[362, 418],
	[357, 440],
	[354, 470],
	[353, 512],
];

const WINDPIPE_FRONT: Point[] = [
	[311, 512],
	[310, 470],
	[308, 440],
	[306, 420],
	[310, 402],
	[314, 386],
];

/** Every air space as one shape: nose, mouth, throat and windpipe, open to the outside at the lips and the nostril. */
export const CAVITY_PATH = `${moveTo(PALATE[0] as Point)}${openSplineSegments(PALATE)}${openSplineSegments(NASAL_FLOOR)}${lineTo(NASAL_ROOF_AND_THROAT[0] as Point)}${openSplineSegments(NASAL_ROOF_AND_THROAT)}${lineTo(WINDPIPE_FRONT[0] as Point)}${openSplineSegments(WINDPIPE_FRONT)}${lineTo([226, 391], [100, 330], [-10, 330], [-10, 208], [84, 206], [114, 216])}Z`;

export const UPPER_TOOTH_PATH = closedSplinePath([
	[110, 213],
	[103, 233],
	[104, 249],
	[108, 251],
	[116, 236],
	[123, 218],
]);

export const UPPER_TOOTH_TIP: Point = [106, 251];

export const EPIGLOTTIS_PATH = closedSplinePath([
	[309, 401],
	[318, 378],
	[333, 353],
	[341, 348],
	[339, 362],
	[325, 391],
	[316, 405],
]);

/** The level of the vocal folds, and the walls of the voice box they stretch between. */
export const FOLDS = { y: 440, front: 308, back: 357 } as const;

// --- The jaw: drawn clenched, turned about the hinge ---

/** Lower lip, chin and floor of the mouth as one outline; points 2 to 6 are the lip. */
const JAW_BODY: Point[] = [
	[131, 268],
	[114, 262],
	[107, 253],
	[91, 249],
	[76, 254],
	[70, 268],
	[76, 284],
	[84, 298],
	[78, 318],
	[76, 340],
	[88, 360],
	[116, 368],
	[172, 386],
	[232, 398],
	[262, 399],
	[266, 380],
	[246, 356],
	[200, 330],
	[162, 306],
	[140, 288],
];

export const LOWER_TOOTH_PATH = closedSplinePath([
	[126, 284],
	[116, 262],
	[112, 247],
	[116, 245],
	[123, 258],
	[134, 282],
]);

const LOWER_TOOTH_TIP: Point = [114, 245];

export const jawTransform = (jaw: number) =>
	`rotate(${(-jaw).toFixed(2)} ${JAW_PIVOT[0]} ${JAW_PIVOT[1]})`;

// --- Lips ---

type Offsets = Record<number, Point>;

const shift = (points: readonly Point[], offsets: Offsets, amount: number): Point[] =>
	points.map((point, index) => {
		const offset = offsets[index];
		return offset ? [point[0] + offset[0] * amount, point[1] + offset[1] * amount] : point;
	});

const UPPER_LIP: Point[] = [
	[90, 190],
	[75, 197],
	[66, 214],
	[63, 231],
	[71, 245],
	[88, 244],
	[104, 234],
	[110, 210],
];
const UPPER_LIP_ROUND: Offsets = {
	2: [-5, 2],
	3: [-12, 4],
	4: [-13, 4],
	5: [-9, 3],
	6: [-2, 1],
};
const UPPER_LIP_CLOSE: Offsets = { 3: [0, 2], 4: [1, 4], 5: [0, 4] };

const LOWER_LIP_ROUND: Offsets = {
	2: [-6, -1],
	3: [-10, -2],
	4: [-13, -3],
	5: [-13, -2],
	6: [-7, 0],
};
const LOWER_LIP_CLOSE: Offsets = { 2: [0, -6], 3: [0, -9], 4: [-1, -9], 5: [-2, -4] };

const upperLipPoints = (pose: Pose) =>
	shift(shift(UPPER_LIP, UPPER_LIP_ROUND, pose.lipRound), UPPER_LIP_CLOSE, pose.lipClose);
/** In jaw space: turn with the jaw to place them. */
const jawBodyPoints = (pose: Pose) =>
	shift(shift(JAW_BODY, LOWER_LIP_ROUND, pose.lipRound), LOWER_LIP_CLOSE, pose.lipClose);

// --- Soft palate ---

const VELUM_RAISED: Point[] = [
	[292, 160],
	[325, 158],
	[356, 165],
	[377, 180],
	[370, 203],
	[348, 196],
	[322, 188],
	[294, 180],
];
const VELUM_LOWERED: Point[] = [
	[292, 160],
	[318, 164],
	[338, 180],
	[350, 208],
	[352, 246],
	[340, 236],
	[322, 204],
	[294, 180],
];

const velumPoints = (pose: Pose) => lerpPoints(VELUM_RAISED, VELUM_LOWERED, pose.velum);

// --- Tongue ---

const TONGUE_ROOT_LOW: Point = [314, 384];
const TONGUE_BASE_BACK: Point = [272, 396];
/** In jaw space: the tongue's front anchor rides on the jaw. */
const TONGUE_BASE_FRONT: Point = [200, 345];

function tongueOutline(pose: Pose): Point[] {
	return [
		TONGUE_ROOT_LOW,
		...pose.tongue,
		rotateAround(TONGUE_BASE_FRONT, JAW_PIVOT, pose.jaw),
		TONGUE_BASE_BACK,
	];
}

// --- Shapes for a pose ---

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
		tongue: closedSplinePath(tongueOutline(pose)),
		jawBody: closedSplinePath(jawBodyPoints(pose)),
		upperLip: closedSplinePath(upperLipPoints(pose)),
		velum: closedSplinePath(velumPoints(pose)),
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
	};
}

// --- Where the air goes ---

/** From the lungs up through the voice box to the back of the mouth. */
export const TRUNK: Track = buildTrack(
	sampleSpline([
		[332, 512],
		[332, 470],
		[333, 440],
		[340, 405],
		[352, 370],
		[357, 320],
		[355, 285],
		[352, 266],
	]),
);

/** How far up the trunk the vocal folds sit. */
export const TRUNK_FOLDS_DISTANCE = 72;

/** Up behind the soft palate, through the nose and out of the nostril. */
export const NASAL: Track = buildTrack(
	sampleSpline([
		[352, 266],
		[362, 232],
		[365, 196],
		[352, 158],
		[310, 139],
		[240, 133],
		[170, 139],
		[118, 153],
		[84, 160],
		[58, 165],
		[46, 176],
		[38, 198],
		[22, 226],
		[-6, 252],
	]),
);

/** Points on the roof of the mouth that the gap to the tongue is measured from, back to front. */
const ROOF_ANCHORS: Point[] = [
	[285, 173],
	[235, 168],
	[190, 175],
	[158, 192],
	[137, 211],
	[119, 230],
];

export type OralRoute = {
	track: Track;
	/** Distance along the track of the narrowest point, and how wide the gap is there. */
	narrowest: { distance: number; gap: number; point: Point };
	/** Distance along the track at which the air leaves the lips. */
	lipsDistance: number;
};

/**
 * The line air follows through the mouth for a pose: halfway between the roof
 * and the tongue, between the teeth, between the lips and out.
 */
export function oralRouteFor(pose: Pose): OralRoute {
	const surface = sampleSpline(pose.tongue.slice(0, 7), 5);
	const velum = velumPoints(pose);
	const lowerToothTip = rotateAround(LOWER_TOOTH_TIP, JAW_PIVOT, pose.jaw);
	const upperLip = upperLipPoints(pose);
	const lowerLip = jawBodyPoints(pose).map((point) => rotateAround(point, JAW_PIVOT, pose.jaw));

	const stations: { point: Point; gap: number }[] = [];
	const between = (roof: Point, floor: Point) => {
		stations.push({
			point: [(roof[0] + floor[0]) / 2, (roof[1] + floor[1]) / 2],
			gap: Math.hypot(roof[0] - floor[0], roof[1] - floor[1]),
		});
	};
	const nearest = (target: Point, candidates: readonly Point[]) =>
		candidates.reduce((best, candidate) =>
			Math.hypot(candidate[0] - target[0], candidate[1] - target[1]) <
			Math.hypot(best[0] - target[0], best[1] - target[1])
				? candidate
				: best,
		);

	// Under the soft palate, then along the roof of the mouth.
	for (const anchor of [velum[5] as Point, velum[6] as Point, ...ROOF_ANCHORS]) {
		between(anchor, nearest(anchor, surface));
	}
	between(UPPER_TOOTH_TIP, nearest(UPPER_TOOTH_TIP, [...surface, lowerToothTip]));
	const lipTop = [(upperLip[4] as Point)[0] + 6, (upperLip[4] as Point)[1]] as Point;
	const lipBottom = [(lowerLip[4] as Point)[0] + 4, (lowerLip[4] as Point)[1]] as Point;
	between(lipTop, lipBottom);

	const lips = stations[stations.length - 1] as { point: Point; gap: number };
	const start = TRUNK.points[TRUNK.points.length - 1] as Point;
	const controls: Point[] = [
		start,
		...stations.map((station) => station.point),
		[lips.point[0] - 34, lips.point[1] + 3],
		[-8, lips.point[1] + 10],
	];
	const track = buildTrack(sampleSpline(controls, 5));
	// Each control point after the start sits 5 samples further along.
	let narrowestIndex = 0;
	stations.forEach((station, index) => {
		if (station.gap < (stations[narrowestIndex] as { gap: number }).gap) narrowestIndex = index;
	});
	const narrowest = stations[narrowestIndex] as { point: Point; gap: number };
	return {
		track,
		narrowest: {
			distance: track.lengths[(narrowestIndex + 1) * 5] as number,
			gap: narrowest.gap,
			point: narrowest.point,
		},
		lipsDistance: track.lengths[stations.length * 5] as number,
	};
}
