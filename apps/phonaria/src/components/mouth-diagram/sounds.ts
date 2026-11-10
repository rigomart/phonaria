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

export type LabelId =
	| "nose"
	| "ridge"
	| "roof"
	| "softPalate"
	| "tongue"
	| "lips"
	| "folds"
	| "foldsAbove";

export type MouthSound = {
	id: string;
	ipa: string;
	/** A word or phrase the animation plays out. */
	example: string;
	steps: Step[];
	/** The parts to name even when the labels are off. */
	focus: LabelId[];
};

const TONGUE = {
	rest: [
		[326, 330],
		[310, 272],
		[268, 238],
		[218, 230],
		[172, 240],
		[144, 256],
		[128, 268],
		[138, 280],
		[162, 298],
	],
	/** A wide-open vowel, as in "uh". */
	open: [
		[330, 332],
		[314, 280],
		[270, 250],
		[220, 244],
		[176, 256],
		[148, 272],
		[132, 284],
		[142, 296],
		[166, 312],
	],
	/** A back, rounded vowel, as in "oh". */
	backVowel: [
		[334, 326],
		[324, 268],
		[288, 232],
		[240, 234],
		[194, 256],
		[158, 272],
		[136, 282],
		[146, 294],
		[168, 310],
	],
	alveolarStop: [
		[326, 330],
		[308, 275],
		[266, 240],
		[218, 222],
		[176, 206],
		[151, 204],
		[135, 213],
		[128, 226],
		[150, 262],
	],
	alveolarGap: [
		[326, 330],
		[308, 275],
		[266, 240],
		[218, 224],
		[178, 210],
		[152, 210],
		[135, 221],
		[127, 233],
		[150, 266],
	],
	dental: [
		[326, 330],
		[310, 274],
		[268, 240],
		[216, 232],
		[166, 238],
		[124, 247],
		[100, 256],
		[115, 264],
		[152, 290],
	],
	postalveolarStop: [
		[326, 330],
		[310, 272],
		[270, 232],
		[220, 205],
		[174, 187],
		[151, 200],
		[133, 220],
		[133, 234],
		[152, 266],
	],
	postalveolarGap: [
		[326, 330],
		[310, 272],
		[270, 234],
		[220, 211],
		[176, 196],
		[152, 208],
		[133, 228],
		[135, 240],
		[154, 270],
	],
	velarStop: [
		[332, 320],
		[338, 224],
		[300, 185],
		[250, 215],
		[200, 246],
		[160, 264],
		[134, 272],
		[144, 284],
		[166, 300],
	],
	velarNear: [
		[330, 322],
		[322, 256],
		[292, 212],
		[246, 220],
		[198, 248],
		[158, 266],
		[132, 274],
		[142, 286],
		[165, 302],
	],
} satisfies Record<string, TonguePoints>;

const pose = (tongue: TonguePoints, rest: Partial<Omit<Pose, "tongue">> = {}): Pose => ({
	jaw: 3,
	velum: 0,
	lipRound: 0,
	lipClose: 0,
	...rest,
	tongue,
});

const REST = pose(TONGUE.rest);

const relaxed = (caption = "The mouth starts relaxed and slightly open."): Step => ({
	caption,
	pose: REST,
	move: 450,
	hold: 600,
	voice: "off",
	flow: false,
});

const fricative = (
	id: string,
	ipa: string,
	example: string,
	voiced: boolean,
	shape: Pose,
	approach: string,
	focus: LabelId[],
): MouthSound => ({
	id,
	ipa,
	example,
	focus,
	steps: [
		relaxed(),
		{ caption: approach, pose: shape, move: 380, hold: 500, voice: "off", flow: false },
		{
			caption: voiced
				? "Air hisses through the gap while the vocal folds buzz."
				: "Air hisses through the gap. The vocal folds stay apart, so the voice is off.",
			pose: shape,
			move: 0,
			hold: 2200,
			voice: voiced ? "on" : "off",
			flow: true,
			hiss: true,
			key: true,
		},
	],
});

const ALVEOLAR_GAP = pose(TONGUE.alveolarGap, { jaw: 1.3 });

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
				pose: pose(TONGUE.alveolarStop, { jaw: 2 }),
				move: 320,
				hold: 500,
				voice: "off",
				flow: false,
				stop: true,
			},
			{
				caption: "Air builds up behind the tongue. The voice is off.",
				pose: pose(TONGUE.alveolarStop, { jaw: 2 }),
				move: 0,
				hold: 1300,
				voice: "off",
				flow: true,
				stop: true,
				key: true,
			},
			{
				caption: "The tongue drops and the air bursts out.",
				pose: pose(TONGUE.open, { jaw: 5 }),
				move: 130,
				hold: 1100,
				voice: "off",
				flow: true,
			},
		],
	},
	fricative(
		"S",
		"s",
		"sun",
		false,
		ALVEOLAR_GAP,
		"The tongue tip rises close to the gum ridge and leaves a narrow gap.",
		["ridge"],
	),
	fricative(
		"Z",
		"z",
		"zoo",
		true,
		ALVEOLAR_GAP,
		"The tongue tip rises close to the gum ridge and leaves a narrow gap.",
		["ridge", "folds"],
	),
	fricative(
		"TH",
		"θ",
		"thin",
		false,
		pose(TONGUE.dental, { jaw: 3 }),
		"The tongue tip comes forward between the teeth.",
		["tongue"],
	),
	{
		id: "M",
		ipa: "m",
		example: "ram",
		focus: ["lips", "softPalate", "nose"],
		steps: [
			relaxed(),
			{
				caption: "The lips close, and the soft palate drops to open the way into the nose.",
				pose: pose(TONGUE.rest, { jaw: 1.5, lipClose: 1, velum: 1 }),
				move: 380,
				hold: 500,
				voice: "off",
				flow: false,
				stop: true,
			},
			{
				caption: "The vocal folds buzz, and the air leaves through the nose.",
				pose: pose(TONGUE.rest, { jaw: 1.5, lipClose: 1, velum: 1 }),
				move: 0,
				hold: 2200,
				voice: "on",
				flow: true,
				stop: true,
				key: true,
			},
		],
	},
	{
		id: "NG",
		ipa: "ŋ",
		example: "sing",
		focus: ["softPalate", "nose"],
		steps: [
			relaxed(),
			{
				caption: "The back of the tongue rises to meet the soft palate, which hangs low.",
				pose: pose(TONGUE.velarStop, { velum: 1 }),
				move: 400,
				hold: 500,
				voice: "off",
				flow: false,
				stop: true,
			},
			{
				caption: "The mouth is blocked at the back, so the buzzing air leaves through the nose.",
				pose: pose(TONGUE.velarStop, { velum: 1 }),
				move: 0,
				hold: 2200,
				voice: "on",
				flow: true,
				stop: true,
				key: true,
			},
		],
	},
	{
		id: "W",
		ipa: "w",
		example: "west",
		focus: ["lips"],
		steps: [
			relaxed(),
			{
				caption: "The lips push forward into a small circle, and the back of the tongue rises.",
				pose: pose(TONGUE.velarNear, { jaw: 2, lipRound: 1, lipClose: 0.4 }),
				move: 420,
				hold: 1300,
				voice: "on",
				flow: true,
				key: true,
			},
			{
				caption: "The lips open quickly and the tongue glides into the next vowel.",
				pose: pose(TONGUE.open, { jaw: 5 }),
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
				pose: pose(TONGUE.postalveolarStop, { jaw: 2, lipRound: 0.45 }),
				move: 340,
				hold: 1300,
				voice: "off",
				flow: true,
				stop: true,
				key: true,
			},
			{
				caption: "The tongue lets go slowly, so the air escapes as a hiss.",
				pose: pose(TONGUE.postalveolarGap, { jaw: 2, lipRound: 0.45 }),
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
				pose: pose(TONGUE.open, { jaw: 5 }),
				move: 450,
				hold: 1100,
				voice: "on",
				flow: true,
			},
			{
				caption: "The vocal folds snap shut, and the air stops in the throat.",
				pose: pose(TONGUE.open, { jaw: 4.5 }),
				move: 120,
				hold: 1300,
				voice: "shut",
				flow: true,
				key: true,
			},
			{
				caption: "They open again for “oh”, with the lips rounded.",
				pose: pose(TONGUE.backVowel, { jaw: 4, lipRound: 0.7 }),
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
