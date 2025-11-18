import type {
	PhonemeAllophoneContextKey,
	PhonemeArticulatoryFeatures,
	PhonemeSymbolId,
} from "shared-data";

export type FeatureValueDefinition = {
	label: string;
	description: string;
};

export type ArticulatoryFeature<ValueKey extends string> = {
	label: string;
	description: string;
	values: Record<ValueKey, FeatureValueDefinition>;
};

type BaseFeatureDefinitions = {
	[K in keyof PhonemeArticulatoryFeatures]: ArticulatoryFeature<PhonemeArticulatoryFeatures[K]>;
};

type DiphthongTargetFeatureDefinitions = {
	targetHeight: ArticulatoryFeature<PhonemeArticulatoryFeatures["height"]>;
	targetBackness: ArticulatoryFeature<PhonemeArticulatoryFeatures["backness"]>;
	targetRoundness: ArticulatoryFeature<PhonemeArticulatoryFeatures["roundness"]>;
};

export type PhonemeDetailsEntry = {
	label: string;
	steps?: string[];
	pitfalls?: { summary: string; tip: string }[];
};

// TODO: Refine pitfalls and steps before wiring to the UI
export const phonemeDetailsById: Record<PhonemeSymbolId, PhonemeDetailsEntry> = {
	"voiceless-bilabial-plosive": {
		label: "Voiceless bilabial plosive",
		pitfalls: [
			{
				summary: "No puff at start",
				tip: "At word starts, add a small puff of air; without it, it can sound like /b/.",
			},
			{
				summary: "Puff after /s/",
				tip: "In 'sp' clusters, skip the puff; keep /p/ unaspirated after /s/.",
			},
		],
	},
	"voiced-bilabial-plosive": {
		label: "Voiced bilabial plosive",
	},
	"voiceless-alveolar-plosive": {
		label: "Voiceless alveolar plosive",
		pitfalls: [
			{
				summary: "No puff at start",
				tip: "At word starts, add a small puff; without it, it may sound like /d/.",
			},
			{
				summary: "Puff after /s/",
				tip: "In 'st' clusters, skip the puff; keep /t/ unaspirated after /s/.",
			},
		],
	},
	"voiced-alveolar-plosive": {
		label: "Voiced alveolar plosive",
	},
	"voiced-velar-plosive": {
		label: "Voiced velar plosive",
	},
	"voiceless-velar-plosive": {
		label: "Voiceless velar plosive",
		pitfalls: [
			{
				summary: "Sounds like /g/",
				tip: "At word starts, add a small puff and keep the throat silent; otherwise it can sound like /g/.",
			},
			{
				summary: "Puff after /s/",
				tip: "In 'sk' clusters, skip the puff; keep /k/ unaspirated after /s/.",
			},
		],
	},
	"voiced-dental-fricative": {
		label: "Voiced dental fricative",
		steps: [
			"Place tongue tip against or between front teeth.",
			"Start voicing first; feel steady throat buzz.",
			"Let air pass through a narrow gap.",
		],
		pitfalls: [
			{
				summary: "No throat buzz",
				tip: "Touch your throat and feel a steady buzz. Once it fades you are producing the voiceless /θ/ instead.",
			},
			{
				summary: "Sounds like /z/",
				tip: "Place the tongue on the teeth, not just behind them, to avoid /z/.",
			},
		],
	},
	"voiceless-dental-fricative": {
		label: "Voiceless dental fricative",
		steps: [
			"Rest the tongue tip between the front teeth.",
			"Keep teeth slightly apart; make a thin airflow.",
			"No throat buzz; listen for a soft hiss.",
		],
		pitfalls: [
			{
				summary: "Tongue behind teeth",
				tip: "Let the tongue tip peek between the front teeth; keeping it back turns the sound into /s/.",
			},
			{
				summary: "Sounds like /f/",
				tip: "If it sounds like /f/, relax the lips and let the tongue touch the teeth instead.",
			},
		],
	},
	"voiceless-labiodental-fricative": {
		label: "Voiceless labiodental fricative",
		pitfalls: [
			{
				summary: "Lip blocks airflow",
				tip: "Only the inner edge of the lower lip should touch the top teeth so air still slips through.",
			},
			{
				summary: "Throat starts buzzing",
				tip: "If your throat vibrates you are saying /v/. Relax the vocal folds for a quiet airflow.",
			},
		],
	},
	"voiced-labiodental-fricative": {
		label: "Voiced labiodental fricative",
		pitfalls: [
			{
				summary: "No throat buzz",
				tip: "Rest a finger on your neck; /v/ needs constant vibration unlike /f/.",
			},
			{
				summary: "Lip folded in",
				tip: "Keep the lower lip relaxed so just the rim touches the teeth; folding it under blocks the buzz.",
			},
		],
	},
	"voiceless-glottal-fricative": {
		label: "Voiceless glottal fricative",
	},
	"voiceless-alveolar-fricative": {
		label: "Voiceless alveolar fricative",
	},
	"voiceless-postalveolar-fricative": {
		label: "Voiceless postalveolar fricative",
		steps: [
			"Lift tongue blade toward the palate slightly back.",
			"Add light lip rounding to focus the airflow.",
			"Keep throat silent; hear a rich 'sh' hiss.",
		],
		pitfalls: [
			{
				summary: "Tongue too far forward",
				tip: "Pull the tongue slightly back so it doesn’t sound like /s/.",
			},
			{
				summary: "No lip rounding",
				tip: "Add a light rounding to focus the air; flat lips make the hiss thin and sharp.",
			},
		],
	},
	"voiced-alveolar-fricative": {
		label: "Voiced alveolar fricative",
	},
	"voiced-postalveolar-fricative": {
		label: "Voiced postalveolar fricative",
		pitfalls: [
			{
				summary: "Starts with /d/",
				tip: "Begin with smooth airflow; a stop closure turns it into /dʒ/.",
			},
			{
				summary: "Buzz fades out",
				tip: "Keep gentle throat vibration all the way through so it does not drop to /ʃ/.",
			},
		],
	},
	"voiced-postalveolar-affricate": {
		label: "Voiced postalveolar affricate",
		steps: [
			"Seal tongue tip just behind your top teeth.",
			"Start voicing; release into a 'zh' airflow.",
			"Keep it smooth; no extra 'uh' sound.",
		],
		pitfalls: [
			{
				summary: "No /d/ start",
				tip: "Start with a quick /d/ closure before releasing into the buzzing /ʒ/ portion.",
			},
			{
				summary: "Ends like /tʃ/",
				tip: "Carry voicing through the release so it does not fade into /tʃ/.",
			},
		],
	},
	"voiceless-postalveolar-affricate": {
		label: "Voiceless postalveolar affricate",
		steps: [
			"Seal tongue tip just behind your top teeth.",
			"Release straight into a 'sh' airflow.",
			"Keep throat silent throughout.",
		],
		pitfalls: [
			{
				summary: "Tongue too flat",
				tip: "Lift the tongue blade toward the palate to get the fuller 'sh' sound.",
			},
			{
				summary: "Turns into /ts/",
				tip: "Keep the tongue blade slightly back; too far forward sharpens it into /ts/.",
			},
		],
	},
	"voiced-bilabial-nasal": {
		label: "Voiced bilabial nasal",
	},
	"voiced-alveolar-nasal": {
		label: "Voiced alveolar nasal",
	},
	"voiced-velar-nasal": {
		label: "Voiced velar nasal",
		steps: [
			"Raise tongue back to the roof of the mouth.",
			"Let sound pass through the nose only.",
			"Hold the contact; no burst release.",
		],
		pitfalls: [
			{
				summary: "Adds a /g/",
				tip: "Keep the back of the tongue raised but do not release it; the burst is what creates /g/.",
			},
			{
				summary: "Tongue too forward",
				tip: "Lift the back of your tongue; if air escapes through the mouth you’re making /n/.",
			},
		],
	},
	"voiced-alveolar-lateral-approximant": {
		label: "Voiced alveolar lateral approximant",
		steps: [
			"Touch tongue tip behind upper teeth.",
			"Lower tongue sides so air flows around.",
			"Keep voicing steady and clear.",
		],
		pitfalls: [
			{
				summary: "Slides into /w/",
				tip: "Anchor the tongue tip just behind your top teeth so the sound stays clear, not rounded.",
			},
			{
				summary: "Sides sealed",
				tip: "Lower the tongue sides slightly; sealing them traps the air and dulls the consonant.",
			},
		],
	},
	"voiced-postalveolar-approximant": {
		label: "Voiced postalveolar approximant",
		steps: [
			"Hover tongue just behind top teeth; no contact.",
			"Pull tongue back slightly or bunch the middle.",
			"Keep lips neutral; sustain gentle voicing.",
		],
		pitfalls: [
			{
				summary: "Tongue touches the teeth",
				tip: "Keep the tongue hovering just behind your top teeth; touching creates a quick tap.",
			},
			{
				summary: "Sounds like /w/",
				tip: "Pull the tongue back for the R sound instead of rounding the lips.",
			},
		],
	},
	"voiced-palatal-approximant": {
		label: "Voiced palatal approximant",
		pitfalls: [
			{
				summary: "Sounds like /w/",
				tip: "Keep the lips neutral and let the tongue body move forward to create the glide.",
			},
		],
	},
	"voiced-labial-velar-approximant": {
		label: "Voiced labial-velar approximant",
		pitfalls: [
			{
				summary: "Sounds like /v/",
				tip: "Avoid touching the teeth with the lower lip; just round both lips softly together.",
			},
			{
				summary: "Too much rounding",
				tip: "Use a quick, light rounding so the glide moves smoothly into the vowel.",
			},
		],
	},
	"close-front-unrounded": {
		label: "Close front unrounded vowel",
		pitfalls: [
			{
				summary: "Drops to /ɪ/",
				tip: "Keep the tongue high and tense; once it relaxes the vowel shortens into /ɪ/.",
			},
		],
	},
	"close-back-rounded": {
		label: "Close back rounded vowel",
		pitfalls: [
			{
				summary: "Not enough rounding",
				tip: "Shape a small tube with both lips; a flat mouth makes it sound like /ʊ/.",
			},
			{
				summary: "Tongue moves forward",
				tip: "Keep the tongue high and back; sliding forward adds a ‘y’ sound (/ju/).",
			},
		],
	},
	"near-close-near-front-unrounded": {
		label: "Near-close near-front unrounded vowel",
		pitfalls: [
			{
				summary: "Too much tension",
				tip: "Relax the tongue slightly; extra tension makes it sound like the longer /i/ vowel.",
			},
			{
				summary: "Held too long",
				tip: "Keep it quick. Drawing it out causes it to merge with /i/.",
			},
		],
	},
	"near-close-near-back-rounded": {
		label: "Near-close near-back rounded vowel",
		pitfalls: [
			{
				summary: "Too much rounding",
				tip: "Use only a mild rounding; exaggerating it pushes the vowel up to /u/.",
			},
			{
				summary: "Tongue too high",
				tip: "Let the back of the tongue drop a bit so it stays distinct from /u/.",
			},
		],
	},
	"mid-central-unrounded": {
		label: "Mid central unrounded vowel",
		pitfalls: [
			{
				summary: "Too much stress",
				tip: "Keep it short and relaxed; stressing it removes the neutral vowel sound.",
			},
		],
	},
	"open-mid-front-unrounded": {
		label: "Open-mid front unrounded vowel",
		pitfalls: [
			{
				summary: "Jaw drops too far",
				tip: "Don’t drop your jaw as far. Use a medium opening.",
			},
			{
				summary: "Tongue moves back",
				tip: "Keep the tongue body forward so it does not darken into /ʌ/.",
			},
		],
	},
	"open-mid-back-unrounded": {
		label: "Open-mid back unrounded vowel",
		pitfalls: [
			{
				summary: "Accidental rounding",
				tip: "Leave the lips relaxed; rounding them moves the vowel toward /ɔ/.",
			},
		],
	},
	"open-mid-back-rounded": {
		label: "Open-mid back rounded vowel",
		pitfalls: [
			{
				summary: "No lip rounding",
				tip: "Maintain gentle rounding throughout; flat lips make it sound like /ɑ/.",
			},
			{
				summary: "Jaw too open",
				tip: "Keep a medium opening so the vowel stays tighter than the fully open /ɑ/.",
			},
		],
	},
	"near-open-front-unrounded": {
		label: "Near-open front unrounded vowel",
		pitfalls: [
			{
				summary: "Jaw not low enough",
				tip: "Drop the jaw so the tongue sits low in front; otherwise it blends with /ɛ/.",
			},
			{
				summary: "Tongue too far back",
				tip: "Keep the tongue pressed slightly forward to avoid drifting toward /ɑ/.",
			},
		],
	},
	"open-back-unrounded": {
		label: "Open back unrounded vowel",
		pitfalls: [
			{
				summary: "Rounding appears",
				tip: "Keep the lips wide open; any rounding shifts it toward /ɔ/.",
			},
			{
				summary: "Tongue too forward",
				tip: "Keep it low and back so it doesn’t shift toward a front ‘a’.",
			},
		],
	},
	"close-mid-front-unrounded-to-near-close-near-front-unrounded": {
		label: "Close-mid front unrounded to near-close near-front unrounded diphthong",
		steps: ["Start mid-front; lips unrounded.", "Glide smoothly higher toward ɪ; no pause."],
		pitfalls: [
			{
				summary: "Two-beat vowel",
				tip: "Make one smooth move; no tiny pause in the middle.",
			},
		],
	},
	"close-mid-back-rounded-to-near-close-near-back-rounded": {
		label: "Close-mid back rounded to near-close near-back rounded diphthong",
		steps: [
			"Start mid-back with light lip rounding.",
			"Glide up and back; keep rounding to the end.",
		],
		pitfalls: [
			{
				summary: "Smile at end",
				tip: "Keep slight lip rounding to the end; don’t spread the corners.",
			},
		],
	},
	"open-front-unrounded-to-near-close-near-front-unrounded": {
		label: "Open front unrounded to near-close near-front unrounded diphthong",
		steps: ["Start low and front with an open jaw.", "Glide forward and up toward ɪ; one motion."],
		pitfalls: [
			{
				summary: "Breaks into two",
				tip: "Keep it one motion; don’t add a pause or a ‘y’ at the end.",
			},
		],
	},
	"open-front-unrounded-to-near-close-near-back-rounded": {
		label: "Open front unrounded to near-close near-back rounded diphthong",
		steps: ["Start low and front; lips unrounded.", "Glide back and up toward ʊ; add rounding."],
		pitfalls: [
			{
				summary: "Lips still flat",
				tip: "Add gentle rounding by halfway and keep it to the end.",
			},
		],
	},
	"open-mid-back-rounded-to-near-close-near-front-unrounded": {
		label: "Open-mid back rounded to near-close near-front unrounded diphthong",
		steps: ["Start mid-back with lip rounding.", "Unround while moving forward to ɪ; one motion."],
		pitfalls: [
			{
				summary: "Rounded at end",
				tip: "Unround by the end; lips shouldn’t stay rounded on ɪ.",
			},
		],
	},
	"open-mid-central-rhotic": {
		label: "Open-mid central rhotic tense vowel",
		steps: [
			"Keep tongue central; add slight curl or bunch.",
			"Sustain voicing; avoid lip rounding.",
			"Maintain the R color; don’t flatten to schwa.",
		],
		pitfalls: [
			{
				summary: "R-color disappears",
				tip: "Curl or bunch the tongue slightly while keeping it central; if it flattens you get plain /ə/.",
			},
			{
				summary: "Jaw too tense",
				tip: "Keep the jaw relaxed so the resonance stays centered instead of drifting forward.",
			},
		],
	},
};

export const featureDefinitions: BaseFeatureDefinitions = {
	manner: {
		label: "Manner",
		description: "How airflow is modified to produce the sound",
		values: {
			plosive: {
				label: "Plosive",
				description: "Airflow fully stops then releases in a burst.",
			},
			fricative: {
				label: "Fricative",
				description: "Air flows through a tight gap creating turbulence.",
			},
			affricate: {
				label: "Affricate",
				description: "Stop closure releases straight into a fricative.",
			},
			nasal: {
				label: "Nasal",
				description: "Air is redirected through the nose while the mouth closes.",
			},
			approximant: {
				label: "Approximant",
				description: "Articulators approach without creating turbulence.",
			},
		},
	},
	place: {
		label: "Place",
		description: "Where in the mouth the sound is produced",
		values: {
			bilabial: {
				label: "Bilabial",
				description: "Both lips come together to shape the sound.",
			},
			labiodental: {
				label: "Labiodental",
				description: "Bottom lip makes gentle contact with upper teeth.",
			},
			dental: {
				label: "Dental",
				description: "Tongue touches or rests between the front teeth.",
			},
			alveolar: {
				label: "Alveolar",
				description: "Tongue contacts the ridge just behind the teeth.",
			},
			postalveolar: {
				label: "Postalveolar",
				description: "Tongue moves slightly behind the alveolar ridge.",
			},
			palatal: {
				label: "Palatal",
				description: "Tongue front raises toward the hard palate.",
			},
			velar: {
				label: "Velar",
				description: "Tongue back meets the soft palate (velum).",
			},
			glottal: {
				label: "Glottal",
				description: "Constriction forms at the vocal folds inside the larynx.",
			},
			"alveolar-lateral": {
				label: "Alveolar lateral",
				description: "Tongue tip stays at the alveolar ridge while air escapes round the sides.",
			},
			"labial-velar": {
				label: "Labial-velar",
				description: "Lips round while the tongue back approaches the velum.",
			},
		},
	},
	voicing: {
		label: "Voicing",
		description: "Whether the vocal folds vibrate during production",
		values: {
			voiceless: {
				label: "Voiceless",
				description: "Vocal folds stay open, so there is no vibration.",
			},
			voiced: {
				label: "Voiced",
				description: "Vocal folds vibrate, touch your throat to feel it.",
			},
		},
	},
	height: {
		label: "Height",
		description: "Vertical position of the tongue in the mouth",
		values: {
			close: {
				label: "Close",
				description: "Tongue is high in the mouth, jaw nearly closed.",
			},
			"near-close": {
				label: "Near-close",
				description: "Tongue sits just below the close position.",
			},
			"close-mid": {
				label: "Close-mid",
				description: "Tongue height between close and mid.",
			},
			mid: {
				label: "Mid",
				description: "Tongue rests halfway between high and low positions.",
			},
			"open-mid": {
				label: "Open-mid",
				description: "Tongue is lower than mid but not fully open.",
			},
			"near-open": {
				label: "Near-open",
				description: "Tongue approaches the fully open position.",
			},
			open: {
				label: "Open",
				description: "Tongue sits low, mouth is open wide.",
			},
		},
	},
	backness: {
		label: "Backness",
		description: "Horizontal position of the tongue in the mouth",
		values: {
			front: {
				label: "Front",
				description: "Tongue body shifts toward the front of the mouth.",
			},
			"near-front": {
				label: "Near-front",
				description: "Tongue is slightly retracted from the front position.",
			},
			central: {
				label: "Central",
				description: "Tongue body stays near the middle of the mouth.",
			},
			"near-back": {
				label: "Near-back",
				description: "Tongue advances slightly from a back position.",
			},
			back: {
				label: "Back",
				description: "Tongue body retracts toward the back of the mouth.",
			},
		},
	},
	roundness: {
		label: "Roundness",
		description: "Whether the lips are rounded during production",
		values: {
			rounded: {
				label: "Rounded",
				description: "Lips purse forward creating a rounded opening.",
			},
			unrounded: {
				label: "Unrounded",
				description: "Lips stay relaxed or spread without rounding.",
			},
		},
	},
	tenseness: {
		label: "Tenseness",
		description: "Muscle tension and duration of the vowel",
		values: {
			tense: {
				label: "Tense",
				description: "Tongue and lips hold a firmer, longer posture.",
			},
			lax: {
				label: "Lax",
				description: "Articulators stay looser with a shorter duration.",
			},
		},
	},
};

export const diphthongTargetDefinitions: DiphthongTargetFeatureDefinitions = {
	targetHeight: {
		label: "Height",
		description: "Vertical position of the tongue at the end of the diphthong",
		values: {
			close: {
				label: "Close",
				description: "Tongue is high in the mouth, jaw nearly closed.",
			},
			"near-close": {
				label: "Near-close",
				description: "Tongue sits just below the close position.",
			},
			"close-mid": {
				label: "Close-mid",
				description: "Tongue height between close and mid.",
			},
			mid: {
				label: "Mid",
				description: "Tongue rests halfway between high and low positions.",
			},
			"open-mid": {
				label: "Open-mid",
				description: "Tongue is lower than mid but not fully open.",
			},
			"near-open": {
				label: "Near-open",
				description: "Tongue approaches the fully open position.",
			},
			open: {
				label: "Open",
				description: "Tongue sits low, mouth is open wide.",
			},
		},
	},
	targetBackness: {
		label: "Backness",
		description: "Horizontal position of the tongue at the end of the diphthong",
		values: {
			front: {
				label: "Front",
				description: "Tongue body shifts toward the front of the mouth.",
			},
			"near-front": {
				label: "Near-front",
				description: "Tongue is slightly retracted from the front position.",
			},
			central: {
				label: "Central",
				description: "Tongue body stays near the middle of the mouth.",
			},
			"near-back": {
				label: "Near-back",
				description: "Tongue advances slightly from a back position.",
			},
			back: {
				label: "Back",
				description: "Tongue body retracts toward the back of the mouth.",
			},
		},
	},
	targetRoundness: {
		label: "Roundness",
		description: "Lip rounding at the end of the diphthong",
		values: {
			rounded: {
				label: "Rounded",
				description: "Lips purse forward creating a rounded opening.",
			},
			unrounded: {
				label: "Unrounded",
				description: "Lips stay relaxed or spread without rounding.",
			},
		},
	},
};

export type AllophoneContextDefinition = {
	name: string;
	description: string;
	when: string;
};

export const allophoneContextDefinitions: Record<
	PhonemeAllophoneContextKey,
	AllophoneContextDefinition
> = {
	"stressed-onset-aspirated": {
		name: "Aspirated",
		description: "Released with a puff of air",
		when: "At the start of stressed syllables",
	},
	"after-s-onset-unaspirated": {
		name: "Unaspirated",
		description: "Released without the puff of air",
		when: "After /s/ at the start of syllables",
	},
	"vowel-to-vowel-flap": {
		name: "Flap",
		description: "Quick tap of the tongue",
		when: "Between vowels in casual speech",
	},
	"t-before-syllabic-n-glottal": {
		name: "Glottal stop",
		description: "Brief closure in the throat",
		when: "Before syllabic /n/ (as in 'button')",
	},
	"coda-dark-l": {
		name: "Dark L",
		description: "Produced with back of tongue raised",
		when: "At the end of syllables or before consonants",
	},
	"pre-voiced-coda-lengthened": {
		name: "Lengthened",
		description: "Held slightly longer",
		when: "Before voiced consonants like /d/, /b/, /v/",
	},
	"pre-voiceless-coda-shorter": {
		name: "Shortened",
		description: "Held slightly shorter",
		when: "Before voiceless consonants like /t/, /p/, /f/",
	},
};
