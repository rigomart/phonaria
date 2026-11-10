import type { Pose, TonguePoints } from "./model";

/** What the vocal folds are doing: apart, buzzing, or pressed shut. */
export type Voice = "off" | "on" | "shut";

export type Step = {
	caption: string;
	pose: Pose;
	/** Milliseconds to move into the pose, then to stay in it. */
	move: number;
	hold: number;
	voice: Voice;
	/** Air is pushed up from the lungs. */
	flow: boolean;
	/** The mouth is sealed at its narrowest point, so air piles up behind it. */
	stop?: boolean;
	/** Air is forced through the narrowest point and turns rough. */
	hiss?: boolean;
	/** The step that stands for the sound when nothing moves. */
	key?: boolean;
};

export type LabelId = "nose" | "ridge" | "roof" | "softPalate" | "tongue" | "lips" | "folds";

export type MouthSound = {
	id: string;
	ipa: string;
	/** A word or phrase the animation plays out. */
	example: string;
	/** One step for a sound that is held still; several for one that has to move. */
	steps: Step[];
	/** The parts to name even when the labels are off. */
	focus: LabelId[];
};

const TONGUE = {
	/** As the illustration is drawn. */
	rest: [
		[406, 305],
		[388.1, 248.5],
		[358.4, 224.4],
		[302.4, 206.2],
		[240.1, 205.9],
		[190, 217],
		[157.8, 241.6],
		[169.5, 263.3],
		[161.9, 290],
	],
	/** A wide-open vowel, as in "uh". */
	open: [
		[408, 308],
		[392, 256],
		[360, 234],
		[304, 218],
		[242, 220],
		[192, 232],
		[160, 256],
		[171, 276],
		[164, 300],
	],
	/** A back, rounded vowel, as in "oh". */
	backVowel: [
		[414, 304],
		[402, 246],
		[366, 214],
		[308, 208],
		[246, 224],
		[196, 240],
		[164, 258],
		[174, 276],
		[166, 300],
	],
	alveolarStop: [
		[406, 305],
		[388, 250],
		[356, 222],
		[300, 196],
		[238, 172],
		[188, 158],
		[153, 174],
		[146, 192],
		[158, 240],
	],
	alveolarGap: [
		[406, 305],
		[388, 250],
		[356, 222],
		[300, 198],
		[238, 176],
		[188, 163],
		[153, 181],
		[144, 198],
		[158, 244],
	],
	dental: [
		[406, 305],
		[388, 249],
		[358, 225],
		[300, 207],
		[236, 207],
		[140, 221],
		[112, 230],
		[134, 240],
		[160, 272],
	],
	postalveolarStop: [
		[406, 305],
		[388, 250],
		[354, 222],
		[296, 192],
		[226, 162],
		[172, 153],
		[150, 182],
		[148, 198],
		[160, 244],
	],
	postalveolarGap: [
		[406, 305],
		[388, 250],
		[354, 222],
		[296, 196],
		[228, 168],
		[174, 160],
		[150, 189],
		[148, 204],
		[160, 248],
	],
	velarStop: [
		[412, 300],
		[402, 205],
		[360, 152],
		[300, 172],
		[240, 212],
		[192, 232],
		[160, 248],
		[170, 266],
		[162, 292],
	],
	velarNear: [
		[410, 302],
		[398, 215],
		[358, 168],
		[300, 186],
		[240, 216],
		[192, 234],
		[160, 250],
		[170, 268],
		[162, 294],
	],
} satisfies Record<string, TonguePoints>;

const pose = (tongue: TonguePoints, rest: Partial<Omit<Pose, "tongue">> = {}): Pose => ({
	jaw: 4,
	velum: 0,
	lipRound: 0,
	lipClose: 0,
	...rest,
	tongue,
});

/** The relaxed, slightly open mouth every sound starts from. */
export const REST = pose(TONGUE.rest);

const relaxed = (caption = "The mouth starts relaxed and slightly open."): Step => ({
	caption,
	pose: REST,
	move: 450,
	hold: 600,
	voice: "off",
	flow: false,
});

/**
 * A sound that can be held: the mouth stays in one position, and only the air
 * and the vocal folds move.
 */
const held = (
	id: string,
	ipa: string,
	example: string,
	focus: LabelId[],
	step: Omit<Step, "move" | "hold" | "key">,
): MouthSound => ({
	id,
	ipa,
	example,
	focus,
	steps: [{ ...step, move: 0, hold: 1000, key: true }],
});

const ALVEOLAR_GAP = pose(TONGUE.alveolarGap, { jaw: 2 });

export const MOUTH_SOUNDS: MouthSound[] = [
	{
		id: "T",
		ipa: "t",
		example: "top",
		focus: ["ridge"],
		steps: [
			relaxed(),
			{
				caption: "The tongue tip seals against the gum ridge behind the top teeth.",
				pose: pose(TONGUE.alveolarStop, { jaw: 3 }),
				move: 320,
				hold: 500,
				voice: "off",
				flow: false,
				stop: true,
			},
			{
				caption: "Air builds up behind the tongue. The voice is off.",
				pose: pose(TONGUE.alveolarStop, { jaw: 3 }),
				move: 0,
				hold: 1300,
				voice: "off",
				flow: true,
				stop: true,
				key: true,
			},
			{
				caption: "The tongue drops and the air bursts out.",
				pose: pose(TONGUE.open, { jaw: 6 }),
				move: 130,
				hold: 1100,
				voice: "off",
				flow: true,
			},
		],
	},
	held("S", "s", "sun", ["ridge"], {
		caption:
			"The tongue tip sits close to the gum ridge. Air hisses through the narrow gap, and the voice is off.",
		pose: ALVEOLAR_GAP,
		voice: "off",
		flow: true,
		hiss: true,
	}),
	held("Z", "z", "zoo", ["ridge", "folds"], {
		caption:
			"The tongue tip sits close to the gum ridge. Air hisses through the narrow gap while the vocal folds buzz.",
		pose: ALVEOLAR_GAP,
		voice: "on",
		flow: true,
		hiss: true,
	}),
	held("TH", "θ", "thin", ["tongue"], {
		caption:
			"The tongue tip rests between the teeth. Air hisses out over it, and the voice is off.",
		pose: pose(TONGUE.dental, { jaw: 3.5 }),
		voice: "off",
		flow: true,
		hiss: true,
	}),
	held("M", "m", "ram", ["lips", "softPalate", "nose"], {
		caption:
			"The lips are closed and the soft palate hangs low, so the buzzing air leaves through the nose.",
		pose: pose(TONGUE.rest, { jaw: 2, lipClose: 1, velum: 1 }),
		voice: "on",
		flow: true,
		stop: true,
	}),
	held("NG", "ŋ", "sing", ["softPalate", "nose"], {
		caption:
			"The back of the tongue presses on the soft palate, which hangs low. The mouth is blocked, so the buzzing air leaves through the nose.",
		pose: pose(TONGUE.velarStop, { velum: 1 }),
		voice: "on",
		flow: true,
		stop: true,
	}),
	{
		id: "W",
		ipa: "w",
		example: "west",
		focus: ["lips"],
		steps: [
			relaxed(),
			{
				caption: "The lips push forward into a small circle, and the back of the tongue rises.",
				pose: pose(TONGUE.velarNear, { jaw: 3, lipRound: 1, lipClose: 0.4 }),
				move: 420,
				hold: 1300,
				voice: "on",
				flow: true,
				key: true,
			},
			{
				caption: "The lips open quickly and the tongue glides into the next vowel.",
				pose: pose(TONGUE.open, { jaw: 6 }),
				move: 260,
				hold: 1100,
				voice: "on",
				flow: true,
			},
		],
	},
	{
		id: "CH",
		ipa: "tʃ",
		example: "cheap",
		focus: ["ridge"],
		steps: [
			relaxed(),
			{
				caption: "The tongue seals just behind the gum ridge, and air builds up.",
				pose: pose(TONGUE.postalveolarStop, { jaw: 3, lipRound: 0.45 }),
				move: 340,
				hold: 1300,
				voice: "off",
				flow: true,
				stop: true,
				key: true,
			},
			{
				caption: "The tongue lets go slowly, so the air escapes as a hiss.",
				pose: pose(TONGUE.postalveolarGap, { jaw: 3, lipRound: 0.45 }),
				move: 160,
				hold: 1500,
				voice: "off",
				flow: true,
				hiss: true,
			},
		],
	},
	{
		id: "GLOTTAL",
		ipa: "ʔ",
		example: "uh-oh",
		focus: ["folds"],
		steps: [
			{
				caption: "For “uh”, the vocal folds buzz and air flows out.",
				pose: pose(TONGUE.open, { jaw: 6 }),
				move: 450,
				hold: 1100,
				voice: "on",
				flow: true,
			},
			{
				caption: "The vocal folds snap shut, and the air stops in the throat.",
				pose: pose(TONGUE.open, { jaw: 5.5 }),
				move: 120,
				hold: 1300,
				voice: "shut",
				flow: true,
				key: true,
			},
			{
				caption: "They open again for “oh”, with the lips rounded.",
				pose: pose(TONGUE.backVowel, { jaw: 5, lipRound: 0.7 }),
				move: 260,
				hold: 1200,
				voice: "on",
				flow: true,
			},
			relaxed("The mouth relaxes again."),
		],
	},
];

export const getMouthSound = (id: string): MouthSound | undefined =>
	MOUTH_SOUNDS.find((sound) => sound.id === id);
