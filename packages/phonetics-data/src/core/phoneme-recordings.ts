import { deepFreeze } from "../shared/readonly";
import type { PhonemeSymbolId } from "./ipa-map";

/** A recording's license, with its deed; public domain has none. */
export type RecordingLicense = {
	readonly name: string;
	readonly url: string | null;
};

/** Where a sound's recording comes from on Wikimedia Commons. */
export type PhonemeRecordingSource = {
	/** The file's title on Commons, e.g. "File:Bilabial nasal.ogg". */
	readonly title: string;
	readonly pageUrl: string;
	readonly authors: readonly string[];
	readonly license: RecordingLicense;
	/** SHA-1 of the bucket's copy, the same bytes as a version in the file's Commons history. */
	readonly sha1: string;
	/**
	 * Set when the bucket's copy is an earlier version of the file, to that
	 * version's upload date; a later upload replaced it on Commons.
	 */
	readonly earlierVersion?: string;
};

const CC_BY_SA_3 = {
	name: "CC BY-SA 3.0",
	url: "https://creativecommons.org/licenses/by-sa/3.0/",
} as const satisfies RecordingLicense;

const PUBLIC_DOMAIN = { name: "Public domain", url: null } as const satisfies RecordingLicense;

/** The Commons file behind each sound's recording, by phoneme ID; diphthongs have none. */
export const PhonemeRecordingSourceMap: Readonly<
	Partial<Record<PhonemeSymbolId, PhonemeRecordingSource>>
> = deepFreeze({
	P: {
		title: "File:Voiceless bilabial plosive.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Voiceless_bilabial_plosive.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "d130da4673b9eca7f038cdb43ea9db83145a08e9",
	},
	B: {
		title: "File:Voiced bilabial plosive.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Voiced_bilabial_plosive.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "67978441b5165b5ea3663d0090822509c8399489",
	},
	T: {
		title: "File:Voiceless alveolar plosive.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Voiceless_alveolar_plosive.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "1c4c92df805583d5584ac4b92ace40f32cca675b",
	},
	D: {
		title: "File:Voiced alveolar plosive.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Voiced_alveolar_plosive.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "1064d586cd6b2cba715833eabf933784e8e7b668",
	},
	K: {
		title: "File:Voiceless velar plosive.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Voiceless_velar_plosive.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "7bf30f4f53de17f555289d4d099fcc7b7da71392",
	},
	G: {
		title: "File:Voiced velar plosive.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Voiced_velar_plosive.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "a030ea93a7bfa5ad56226c52390a0b0cf1b34d9d",
	},
	F: {
		title: "File:Voiceless labiodental fricative.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Voiceless_labiodental_fricative.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "ee060dc62b68ac348f87ab6afb511460855226b3",
	},
	V: {
		title: "File:Voiced labiodental fricative.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Voiced_labiodental_fricative.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "317301036b1d806633252ca25045dcb201409c98",
	},
	TH: {
		title: "File:Voiceless dental fricative.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Voiceless_dental_fricative.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "e051a6c6a050e6a1b9741f1e53ea92a421d0374a",
	},
	DH: {
		title: "File:Voiced dental fricative.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Voiced_dental_fricative.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "7c897f55a3b92c8fb4edcc7946c51c7f5ae787e9",
	},
	S: {
		title: "File:Voiceless alveolar sibilant.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Voiceless_alveolar_sibilant.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "92d215b4003a0184eded8b5ce8b96083a546386d",
	},
	Z: {
		title: "File:Voiced alveolar sibilant.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Voiced_alveolar_sibilant.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "aa501c317e153a943b6bba1c41e3e7fd92edc956",
	},
	SH: {
		title: "File:Voiceless palato-alveolar sibilant.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Voiceless_palato-alveolar_sibilant.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "5c23db9bb769b91ba24fb952bbbb01bc338ac206",
	},
	ZH: {
		title: "File:Voiced palato-alveolar sibilant.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Voiced_palato-alveolar_sibilant.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "090fe11e36c6d1380d8a7fb5d88c2df4c4af708c",
	},
	H: {
		title: "File:Voiceless glottal fricative.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Voiceless_glottal_fricative.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "82a56b02f8411629dcee4a61b5b2fb88cf41dc75",
	},
	M: {
		title: "File:Bilabial nasal.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Bilabial_nasal.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "9aa284e454f590dd1cce25dbd4da61faef2f1af7",
	},
	N: {
		title: "File:Alveolar nasal.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Alveolar_nasal.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "086d166308ec025f1c92de3021f54bc2d80562fc",
	},
	NG: {
		title: "File:Velar nasal.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Velar_nasal.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "2a61afbbfddff3ee4c9caf9827bd0829dd7b44de",
	},
	L: {
		title: "File:Alveolar lateral approximant.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Alveolar_lateral_approximant.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "c72c45678fbca0aca52b98fed9b1977b648de3b9",
	},
	R: {
		title: "File:Alveolar approximant.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Alveolar_approximant.ogg",
		authors: ["Erutuon"],
		license: CC_BY_SA_3,
		sha1: "32a0dff953ab25959354dc97a853b4fe359fb905",
	},
	W: {
		title: "File:Voiced labio-velar approximant.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Voiced_labio-velar_approximant.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "fc084012c3a164140f17149502fde6badc2a026c",
	},
	Y: {
		title: "File:Palatal approximant.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Palatal_approximant.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "f9a1154118babeb39f1bd63785b5259a11431b0b",
	},
	CH: {
		title: "File:Voiceless palato-alveolar affricate.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Voiceless_palato-alveolar_affricate.ogg",
		authors: ["Peter Isotalo"],
		license: CC_BY_SA_3,
		sha1: "d6d7ff4b51d6de90994dd1fe0e50c6af7c7e7c54",
	},
	J: {
		title: "File:Voiced palato-alveolar affricate.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Voiced_palato-alveolar_affricate.ogg",
		authors: ["Octane"],
		license: PUBLIC_DOMAIN,
		sha1: "d2e571840ad18da9f297915a2de9dc26c4d4da56",
	},
	I: {
		title: "File:Close front unrounded vowel.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Close_front_unrounded_vowel.ogg",
		authors: ["Denelson83"],
		license: CC_BY_SA_3,
		sha1: "b474c0a364f4d3f7830df7cab1887ef3b9205d6e",
	},
	IX: {
		title: "File:Near-close near-front unrounded vowel.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Near-close_near-front_unrounded_vowel.ogg",
		authors: ["Denelson83"],
		license: CC_BY_SA_3,
		sha1: "90b0522dcb269043398b5c841cad38cc83083621",
	},
	E: {
		title: "File:Open-mid front unrounded vowel.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Open-mid_front_unrounded_vowel.ogg",
		authors: ["Denelson83"],
		license: CC_BY_SA_3,
		sha1: "2072ac51e95391966ef83de9f5c579d774e30df9",
		earlierVersion: "2005-07-20",
	},
	AE: {
		title: "File:Near-open front unrounded vowel.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Near-open_front_unrounded_vowel.ogg",
		authors: ["Denelson83"],
		license: CC_BY_SA_3,
		sha1: "2c06253db9212940ea231f4f7fd135e3c551f02f",
	},
	AH: {
		title: "File:Open-mid back unrounded vowel.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Open-mid_back_unrounded_vowel.ogg",
		authors: ["Denelson83"],
		license: CC_BY_SA_3,
		sha1: "6e6b41858a4508a35aa3bce53dbee0665ae5002a",
		earlierVersion: "2005-07-20",
	},
	AX: {
		title: "File:Mid-central vowel.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Mid-central_vowel.ogg",
		authors: ["Denelson83"],
		license: CC_BY_SA_3,
		sha1: "b46666835bad941e68d73fbf59a6134f9bf1a244",
	},
	ER: {
		title: "File:En-us-er.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:En-us-er.ogg",
		authors: ["Dvortygirl"],
		license: CC_BY_SA_3,
		sha1: "3a86a7280d6dfd28e6d123fff0be61134010c972",
	},
	U: {
		title: "File:Close back rounded vowel.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Close_back_rounded_vowel.ogg",
		authors: ["Denelson83"],
		license: CC_BY_SA_3,
		sha1: "ec885fb9088c69e0ceed6c41cec7deb86dce4275",
	},
	UX: {
		title: "File:Near-close near-back rounded vowel.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Near-close_near-back_rounded_vowel.ogg",
		authors: ["Denelson83"],
		license: CC_BY_SA_3,
		sha1: "a13e1766302a657f906d31104975c87e0b5a3587",
	},
	O: {
		title: "File:Open-mid back rounded vowel.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Open-mid_back_rounded_vowel.ogg",
		authors: ["Denelson83"],
		license: CC_BY_SA_3,
		sha1: "65ccf8f231e7d05a8a06b7522b7b24e040d1d0dc",
	},
	A: {
		title: "File:Open back unrounded vowel.ogg",
		pageUrl: "https://commons.wikimedia.org/wiki/File:Open_back_unrounded_vowel.ogg",
		authors: ["Denelson83"],
		license: CC_BY_SA_3,
		sha1: "2092f4fb872817eaa00a6df73cb0828038dd5462",
	},
} as const satisfies Partial<Record<PhonemeSymbolId, PhonemeRecordingSource>>);

/** The Commons file behind a sound's recording, or null when the sound has no recording. */
export function getPhonemeRecordingSource(
	phonemeId: PhonemeSymbolId,
): PhonemeRecordingSource | null {
	return PhonemeRecordingSourceMap[phonemeId] ?? null;
}
