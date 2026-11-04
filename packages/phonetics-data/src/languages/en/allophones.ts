import { deepFreeze } from "../../shared/readonly";
import type { EnglishPhonemeSymbolId } from "../inventories";
import type { AllophoneContextLabel, PhonemeAllophone, PhonemeAllophoneContextKey } from "../types";

const longerBeforeVoiceOn = (ipaVariant: string, longer: string, shorter: string) =>
	({
		ipaVariant,
		contextKey: "longer-before-voice-on",
		examples: [{ word: longer }, { word: shorter }],
	}) as const;

const phonemeAllophonesData = {
	P: [
		{
			ipaVariant: "pʰ",
			contextKey: "aspirated",
			examples: [{ word: "pin" }, { word: "support" }],
		},
		{
			ipaVariant: "p",
			contextKey: "unaspirated-after-s",
			examples: [{ word: "spin" }, { word: "speak" }],
		},
	],
	T: [
		{
			ipaVariant: "tʰ",
			contextKey: "aspirated",
			examples: [{ word: "top" }, { word: "attack" }],
		},
		{
			ipaVariant: "t",
			contextKey: "unaspirated-after-s",
			examples: [{ word: "stop" }, { word: "stay" }],
		},
		{
			ipaVariant: "ɾ",
			contextKey: "flap",
			examples: [{ word: "water" }, { word: "city" }, { word: "party" }],
		},
		{
			ipaVariant: "ʔ",
			contextKey: "glottal-stop",
			examples: [{ word: "button" }, { word: "football" }],
		},
	],
	K: [
		{
			ipaVariant: "kʰ",
			contextKey: "aspirated",
			examples: [{ word: "cat" }, { word: "become" }],
		},
		{
			ipaVariant: "k",
			contextKey: "unaspirated-after-s",
			examples: [{ word: "school" }, { word: "sky" }],
		},
	],
	D: [
		{
			ipaVariant: "ɾ",
			contextKey: "flap",
			examples: [{ word: "ladder" }, { word: "body" }, { word: "order" }],
		},
	],
	N: [
		{
			ipaVariant: "n̩",
			contextKey: "syllabic-n",
			examples: [{ word: "button" }, { word: "garden" }, { word: "person" }],
		},
	],
	L: [
		{
			ipaVariant: "ɫ",
			contextKey: "dark-l",
			examples: [{ word: "feel" }, { word: "ball" }, { word: "milk" }],
		},
		{
			ipaVariant: "l̩",
			contextKey: "syllabic-l",
			examples: [{ word: "people" }, { word: "little" }, { word: "able" }],
		},
	],

	I: [longerBeforeVoiceOn("iː", "seed", "seat")],
	IX: [longerBeforeVoiceOn("ɪː", "kid", "kit")],
	U: [longerBeforeVoiceOn("uː", "lose", "loose")],
	UX: [longerBeforeVoiceOn("ʊː", "could", "cook")],
	E: [longerBeforeVoiceOn("ɛː", "bed", "bet")],
	AH: [longerBeforeVoiceOn("ʌː", "bug", "buck")],
	O: [longerBeforeVoiceOn("ɔː", "laws", "loss")],
	AE: [
		{
			ipaVariant: "eə",
			contextKey: "raised-before-m-n",
			examples: [{ word: "man" }, { word: "hand" }, { word: "family" }],
		},
		longerBeforeVoiceOn("æː", "bad", "bat"),
	],
	A: [longerBeforeVoiceOn("ɑː", "god", "got")],
	ER: [
		{
			ipaVariant: "ɚ",
			contextKey: "weak-r-vowel",
			examples: [{ word: "after" }, { word: "never" }, { word: "number" }],
		},
		longerBeforeVoiceOn("ɝː", "heard", "hurt"),
	],
	EI: [longerBeforeVoiceOn("eɪː", "save", "safe")],
	OU: [longerBeforeVoiceOn("oʊː", "code", "coat")],
	AI: [longerBeforeVoiceOn("aɪː", "prize", "price")],
	AU: [longerBeforeVoiceOn("aʊː", "loud", "out")],
	OI: [longerBeforeVoiceOn("ɔɪː", "noise", "voice")],
} as const satisfies Partial<Record<EnglishPhonemeSymbolId, ReadonlyArray<PhonemeAllophone>>>;

export const EnglishPhonemeAllophones: Readonly<
	Partial<Record<EnglishPhonemeSymbolId, ReadonlyArray<PhonemeAllophone>>>
> = deepFreeze(phonemeAllophonesData);

/**
 * What each sound variant sounds like and when it happens, as its label on a
 * sound's page. Written for learners whose first language isn't English: literal
 * words, no figures of speech.
 */
export const EnglishAllophoneContextLabels = deepFreeze({
	aspirated: {
		sound: "A short burst of air comes out after the sound. You can feel it on your hand.",
		when: "at the start of a word, or at the start of a stressed syllable.",
	},
	"unaspirated-after-s": {
		sound: "No burst of air, so it sounds closer to b, d or g.",
		when: "right after s at the start of a word.",
	},
	flap: {
		sound: "Sounds like a very quick d: the tongue taps the roof of the mouth once.",
		when: "after a vowel or r, if the next vowel is not stressed.",
	},
	"glottal-stop": {
		sound: "No t sound. The air stops in the throat for a moment instead.",
		when: "before a consonant, as in button and football, and often at the end of a sentence.",
	},
	"syllabic-n": {
		sound:
			'No vowel before the n. The n alone makes the last syllable, so button sounds like "butn".',
		when: "after t, d, s or z at the end of a word.",
	},
	"dark-l": {
		sound:
			"A deeper l. The tip of the tongue touches behind the top teeth, and the back of the tongue rises at the same time.",
		when: "after a vowel, at the end of a word or before a consonant.",
	},
	"syllabic-l": {
		sound: "No vowel before the l. The l alone makes the last syllable.",
		when: "at the end of a word after a consonant, often spelled -le.",
	},
	"longer-before-voice-on": {
		sound:
			"The vowel is longer in the first word than in the second. Listeners use this to tell the two words apart.",
		when: "longer before a consonant with the voice on (d, z, v), shorter before one with the voice off (t, s, f).",
	},
	"raised-before-m-n": {
		sound: "Starts closer to the e in bed, then moves toward ə, the a in sofa.",
		when: "right before m or n.",
	},
	"weak-r-vowel": {
		sound: "Shorter and quieter than the vowel in her.",
		when: "in an unstressed syllable, often -er at the end of a word.",
	},
} as const satisfies Record<PhonemeAllophoneContextKey, AllophoneContextLabel>);
