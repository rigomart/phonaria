import type { TargetAccent } from "@phonaria/phonetics-data";
import type { Pose, TonguePoints } from "./model";

/** What the vocal folds are doing: apart, buzzing, or pressed shut. */
export type Voice = "off" | "on" | "shut";

export type Step = {
	/** What happens in this step, in plain words. */
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
	/** The tongue touches the roof, and the air goes round its sides. */
	sides?: boolean;
	/** Air turns rough at the vocal folds, which are apart but close. */
	breath?: boolean;
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
	/** The middle of the tongue close to the roof of the mouth, as for "y". */
	palatalNear: [
		[402, 305],
		[392, 240],
		[350, 190],
		[290, 151],
		[232, 160],
		[188, 196],
		[158, 236],
		[169, 258],
		[162, 288],
	],
	/** Bunched and pulled back with the tip lifted, as for an American "r". */
	bunched: [
		[416, 300],
		[400, 238],
		[354, 198],
		[292, 176],
		[238, 168],
		[204, 166],
		[182, 170],
		[186, 196],
		[172, 266],
	],
} satisfies Record<string, TonguePoints>;

const pose = (tongue: TonguePoints, rest: Partial<Omit<Pose, "tongue">> = {}): Pose => ({
	jaw: 4,
	velum: 0,
	lipRound: 0,
	lipClose: 0,
	lipTuck: 0,
	...rest,
	tongue,
});

/** The relaxed, slightly open mouth every sound starts from. */
export const REST = pose(TONGUE.rest);

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

/** A sound that stops the air and lets it go: the seal with pressure building behind it, then the burst. */
const stop = (
	id: string,
	ipa: string,
	example: string,
	focus: LabelId[],
	{
		voiced,
		seal,
		sealed,
		behind,
		released,
	}: { voiced: boolean; seal: Pose; sealed: string; behind: string; released: string },
): MouthSound => ({
	id,
	ipa,
	example,
	focus,
	steps: [
		{
			caption: voiced
				? `${sealed} Air builds up behind the ${behind} while the vocal folds buzz.`
				: `${sealed} Air builds up behind the ${behind}, and the voice is off.`,
			pose: seal,
			move: 320,
			hold: 1700,
			voice: voiced ? "on" : "off",
			flow: true,
			stop: true,
			key: true,
		},
		{
			caption: released,
			pose: OPEN,
			move: 130,
			hold: 1100,
			voice: voiced ? "on" : "off",
			flow: true,
		},
	],
});

/** A stop let go slowly, so it ends in a hiss. */
const affricate = (id: string, ipa: string, example: string, voiced: boolean): MouthSound => ({
	id,
	ipa,
	example,
	focus: ["ridge"],
	steps: [
		{
			caption: voiced
				? "The tongue seals just behind the gum ridge. Air builds up while the vocal folds buzz."
				: "The tongue seals just behind the gum ridge, and air builds up.",
			pose: pose(TONGUE.postalveolarStop, { jaw: 3, lipRound: 0.45 }),
			move: 340,
			hold: 1500,
			voice: voiced ? "on" : "off",
			flow: true,
			stop: true,
			key: true,
		},
		{
			caption: "The tongue lets go slowly, so the air escapes as a hiss.",
			pose: POSTALVEOLAR_GAP,
			move: 160,
			hold: 1500,
			voice: voiced ? "on" : "off",
			flow: true,
			hiss: true,
		},
	],
});

const OPEN = pose(TONGUE.open, { jaw: 6 });
const LIPS_SHUT = pose(TONGUE.rest, { jaw: 2, lipClose: 1 });
const ALVEOLAR_SEAL = pose(TONGUE.alveolarStop, { jaw: 3 });
const ALVEOLAR_GAP = pose(TONGUE.alveolarGap, { jaw: 2.6 });
const VELAR_SEAL = pose(TONGUE.velarStop);
const DENTAL = pose(TONGUE.dental, { jaw: 3.5 });
const LIP_ON_TEETH = pose(TONGUE.rest, { jaw: 3, lipTuck: 1 });
const POSTALVEOLAR_GAP = pose(TONGUE.postalveolarGap, { jaw: 3, lipRound: 0.45 });

const HISS_OFF = "Air hisses through the gap, and the voice is off.";
const HISS_ON = "Air hisses through the gap while the vocal folds buzz.";

export const MOUTH_SOUNDS: MouthSound[] = [
	stop("P", "p", "pat", ["lips"], {
		voiced: false,
		seal: LIPS_SHUT,
		sealed: "The lips press together.",
		behind: "lips",
		released: "The lips part and the air bursts out.",
	}),
	stop("B", "b", "bat", ["lips", "folds"], {
		voiced: true,
		seal: LIPS_SHUT,
		sealed: "The lips press together.",
		behind: "lips",
		released: "The lips part and the air bursts out.",
	}),
	stop("T", "t", "top", ["ridge"], {
		voiced: false,
		seal: ALVEOLAR_SEAL,
		sealed: "The tongue tip seals against the gum ridge behind the top teeth.",
		behind: "tongue",
		released: "The tongue drops and the air bursts out.",
	}),
	stop("D", "d", "day", ["ridge", "folds"], {
		voiced: true,
		seal: ALVEOLAR_SEAL,
		sealed: "The tongue tip seals against the gum ridge behind the top teeth.",
		behind: "tongue",
		released: "The tongue drops and the air bursts out.",
	}),
	stop("K", "k", "kid", ["softPalate"], {
		voiced: false,
		seal: VELAR_SEAL,
		sealed: "The back of the tongue seals against the soft palate.",
		behind: "tongue",
		released: "The tongue drops and the air bursts out.",
	}),
	stop("G", "g", "gum", ["softPalate", "folds"], {
		voiced: true,
		seal: VELAR_SEAL,
		sealed: "The back of the tongue seals against the soft palate.",
		behind: "tongue",
		released: "The tongue drops and the air bursts out.",
	}),
	affricate("CH", "tʃ", "cheap", false),
	affricate("J", "dʒ", "jeep", true),
	held("F", "f", "fan", ["lips"], {
		caption: `The bottom lip rests against the top teeth. ${HISS_OFF}`,
		pose: LIP_ON_TEETH,
		voice: "off",
		flow: true,
		hiss: true,
	}),
	held("V", "v", "van", ["lips", "folds"], {
		caption: `The bottom lip rests against the top teeth. ${HISS_ON}`,
		pose: LIP_ON_TEETH,
		voice: "on",
		flow: true,
		hiss: true,
	}),
	held("TH", "θ", "thin", ["tongue"], {
		caption: `The tongue tip rests between the teeth. ${HISS_OFF}`,
		pose: DENTAL,
		voice: "off",
		flow: true,
		hiss: true,
	}),
	held("DH", "ð", "this", ["tongue", "folds"], {
		caption: `The tongue tip rests between the teeth. ${HISS_ON}`,
		pose: DENTAL,
		voice: "on",
		flow: true,
		hiss: true,
	}),
	held("S", "s", "sun", ["ridge"], {
		caption: `The tongue tip sits close to the gum ridge. ${HISS_OFF}`,
		pose: ALVEOLAR_GAP,
		voice: "off",
		flow: true,
		hiss: true,
	}),
	held("Z", "z", "zoo", ["ridge", "folds"], {
		caption: `The tongue tip sits close to the gum ridge. ${HISS_ON}`,
		pose: ALVEOLAR_GAP,
		voice: "on",
		flow: true,
		hiss: true,
	}),
	held("SH", "ʃ", "shop", ["ridge"], {
		caption: `The tongue rises close to the roof just behind the gum ridge, and the lips push forward a little. ${HISS_OFF}`,
		pose: POSTALVEOLAR_GAP,
		voice: "off",
		flow: true,
		hiss: true,
	}),
	held("ZH", "ʒ", "vision", ["ridge", "folds"], {
		caption: `The tongue rises close to the roof just behind the gum ridge, and the lips push forward a little. ${HISS_ON}`,
		pose: POSTALVEOLAR_GAP,
		voice: "on",
		flow: true,
		hiss: true,
	}),
	held("H", "h", "house", ["folds"], {
		caption:
			"The mouth is open, ready for the vowel that follows. Air rushes between the vocal folds, which are apart, and makes a soft hiss.",
		pose: pose(TONGUE.open, { jaw: 5.5 }),
		voice: "off",
		flow: true,
		breath: true,
	}),
	held("M", "m", "ram", ["lips", "softPalate", "nose"], {
		caption:
			"The lips are closed and the soft palate hangs low, so the buzzing air leaves through the nose.",
		pose: pose(TONGUE.rest, { jaw: 2, lipClose: 1, velum: 1 }),
		voice: "on",
		flow: true,
		stop: true,
	}),
	held("N", "n", "sun", ["ridge", "softPalate", "nose"], {
		caption:
			"The tongue tip seals against the gum ridge and the soft palate hangs low, so the buzzing air leaves through the nose.",
		pose: pose(TONGUE.alveolarStop, { jaw: 3, velum: 1 }),
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
	held("L", "l", "let", ["ridge"], {
		caption:
			"The tongue tip rests on the gum ridge. The buzzing air flows out past the sides of the tongue.",
		pose: pose(TONGUE.alveolarStop, { jaw: 3.5 }),
		voice: "on",
		flow: true,
		sides: true,
	}),
	held("R", "ɹ", "red", ["tongue"], {
		caption:
			"The tongue bunches up and pulls back without touching the roof of the mouth, and the lips round a little. The buzzing air flows out smoothly.",
		pose: pose(TONGUE.bunched, { jaw: 3.5, lipRound: 0.4 }),
		voice: "on",
		flow: true,
	}),
	held("W", "w", "west", ["lips"], {
		caption:
			"The lips push forward into a small circle and the back of the tongue rises. The buzzing air flows out as the mouth glides into the next vowel.",
		pose: pose(TONGUE.velarNear, { jaw: 3, lipRound: 1, lipClose: 0.2 }),
		voice: "on",
		flow: true,
	}),
	held("Y", "j", "you", ["roof"], {
		caption:
			"The middle of the tongue rises close to the roof of the mouth. The buzzing air flows out as the mouth glides into the next vowel.",
		pose: pose(TONGUE.palatalNear, { jaw: 3 }),
		voice: "on",
		flow: true,
	}),
	{
		id: "GLOTTAL",
		ipa: "ʔ",
		example: "uh-oh",
		focus: ["folds"],
		steps: [
			{
				caption: "For “uh”, the vocal folds buzz and air flows out.",
				pose: OPEN,
				move: 450,
				hold: 1100,
				voice: "on",
				flow: true,
			},
			{
				caption: "The vocal folds snap shut, and the air stops in the throat.",
				pose: pose(TONGUE.open, { jaw: 5.5 }),
				move: 120,
				hold: 1500,
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
		],
	},
];

/** The diagram for a sound of an accent, or undefined when it has none: only American English consonants do. */
export const getMouthSound = (accent: TargetAccent, phonemeId: string): MouthSound | undefined =>
	accent === "en-us" ? MOUTH_SOUNDS.find((sound) => sound.id === phonemeId) : undefined;
