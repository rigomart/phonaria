import { deepFreeze } from "../../shared/readonly";
import type { EnglishPhonemeSymbolId } from "../inventories";
import type { PhonemeAllophone, PhonemeAllophoneContextKey } from "../types";

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
 * Where each sound variant shows up, in plain words, as its label on a sound's page.
 * Labels say beat for syllable, and said loudest or softly for stressed or unstressed.
 */
export const EnglishAllophoneContextLabels = deepFreeze({
	aspirated: "With a puff of air, at the start of a word or of the part said loudest",
	"unaspirated-after-s": "Without the puff of air, after s",
	flap: "A quick tap of the tongue, after a vowel or r and before a vowel said softly",
	"glottal-stop":
		"Often cut off with a catch in the throat, before a consonant or at the end of a sentence",
	"syllabic-n": "A beat of its own with no vowel before it, after t, d, s or z",
	"dark-l": "With the back of the tongue raised for a deeper sound, most of all after a vowel",
	"syllabic-l": "A beat of its own with no vowel before it, after a consonant",
	"longer-before-voice-on":
		"Held longer before a consonant with the voice on, so it's longer in the first word than in the second",
	"raised-before-m-n": "Closer to the e in bed, with a glide toward uh, before m or n",
	"weak-r-vowel": "Shorter and weaker, in a part of the word said softly",
} as const satisfies Record<PhonemeAllophoneContextKey, string>);
