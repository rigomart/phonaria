import type { EnglishPhonemeSymbolId } from "../inventories";
import type { PhonemeContrast, PhonemeContrastMatch } from "../types";

/**
 * English sound contrasts that learners commonly confuse, each with minimal
 * pairs. Pronunciations are not stored here: contrasts.test.ts checks every
 * pair against the curated dictionary so the catalog cannot drift from it.
 */
export const EnglishPhonemeContrasts: PhonemeContrast<"en-us">[] = [
	// Consonants: voice
	{
		id: "p-b",
		phonemeIds: ["P", "B"],
		tip: "Both sounds close the lips, but /p/ has no voice and releases a small puff of air, while /b/ uses your voice.",
		minimalPairs: [{ words: ["pat", "bat"] }],
	},
	{
		id: "t-d",
		phonemeIds: ["T", "D"],
		tip: "Both sounds press the tongue tip just behind the top teeth, but /t/ has no voice, while /d/ uses your voice and makes the vowel before it a little longer.",
		minimalPairs: [{ words: ["seat", "seed"] }],
	},
	{
		id: "k-g",
		phonemeIds: ["K", "G"],
		tip: "Both sounds lift the back of the tongue against the roof of the mouth, but /k/ has no voice and releases a puff of air, while /g/ uses your voice.",
		minimalPairs: [{ words: ["coat", "goat"] }],
	},
	{
		id: "f-v",
		phonemeIds: ["F", "V"],
		tip: "Both sounds rest the top teeth on the lower lip, but /f/ is only air, while /v/ adds your voice so you can feel the lip buzz.",
		minimalPairs: [{ words: ["fan", "van"] }],
	},
	{
		id: "s-z",
		phonemeIds: ["S", "Z"],
		tip: "The tongue stays in the same place for both, but /s/ is a hiss of air, while /z/ adds your voice and makes the vowel before it a little longer.",
		minimalPairs: [{ words: ["price", "prize"] }],
	},
	{
		id: "ch-j",
		phonemeIds: ["CH", "J"],
		tip: "Both sounds start with a short stop and then release, but /tʃ/ has no voice, while /dʒ/ uses your voice and makes the vowel before it a little longer.",
		minimalPairs: [{ words: ["rich", "ridge"] }],
	},

	// Consonants: where and how the sound is made
	{
		id: "s-sh",
		phonemeIds: ["S", "SH"],
		tip: "For /ʃ/ the tongue pulls back a little and the lips push forward, which gives a deeper hushing sound than the sharp hiss of /s/.",
		minimalPairs: [{ words: ["see", "she"] }],
	},
	{
		id: "ch-sh",
		phonemeIds: ["CH", "SH"],
		tip: "/tʃ/ starts with a short stop, like a quick /t/, while /ʃ/ is a smooth rush of air from the very start.",
		minimalPairs: [{ words: ["cheap", "sheep"] }],
	},
	{
		id: "th-t",
		phonemeIds: ["TH", "T"],
		tip: "For /θ/ the tongue tip touches the front teeth and air flows out steadily, while for /t/ the tongue presses behind the teeth and stops the air for a moment.",
		minimalPairs: [{ words: ["thin", "tin"] }],
	},
	{
		id: "th-s",
		phonemeIds: ["TH", "S"],
		tip: "For /θ/ the tongue tip touches the front teeth for a soft, flat hiss, while for /s/ the tongue stays behind the teeth for a sharper hiss.",
		minimalPairs: [{ words: ["thin", "sin"] }],
	},
	{
		id: "dh-d",
		phonemeIds: ["DH", "D"],
		tip: "For /ð/ the tongue tip touches the front teeth and the voiced air keeps flowing, while for /d/ the tongue presses behind the teeth and stops the air for a moment.",
		minimalPairs: [{ words: ["they", "day"] }],
	},
	{
		id: "dh-z",
		phonemeIds: ["DH", "Z"],
		tip: "Both sounds use your voice, but for /ð/ the tongue tip touches the front teeth for a soft buzz, while for /z/ the tongue stays behind the teeth for a sharper buzz.",
		minimalPairs: [{ words: ["breathe", "breeze"] }],
	},
	{
		id: "n-ng",
		phonemeIds: ["N", "NG"],
		tip: "For /n/ the tongue tip touches just behind the top teeth, while for /ŋ/ the back of the tongue rises to the back of the mouth, with no /g/ added after it.",
		minimalPairs: [{ words: ["sin", "sing"] }],
	},
	{
		id: "m-n",
		phonemeIds: ["M", "N"],
		tip: "For /m/ the lips close, while for /n/ the lips stay open and the tongue tip touches just behind the top teeth.",
		minimalPairs: [{ words: ["sum", "sun"] }],
	},
	{
		id: "w-v",
		phonemeIds: ["W", "V"],
		tip: "For /w/ round the lips without letting them touch the teeth, while for /v/ rest the top teeth on the lower lip and let it buzz.",
		minimalPairs: [{ words: ["worse", "verse"] }],
	},
	{
		id: "l-r",
		phonemeIds: ["L", "R"],
		tip: "For /l/ the tongue tip touches just behind the top teeth, while for /ɹ/ the tongue pulls back without touching the roof of the mouth.",
		minimalPairs: [{ words: ["led", "red"] }],
	},
	{
		id: "y-j",
		phonemeIds: ["Y", "J"],
		tip: "For /j/ the tongue glides smoothly with nothing blocking the air, while /dʒ/ starts with the tongue briefly stopping the air.",
		minimalPairs: [{ words: ["yet", "jet"] }],
	},
	{
		id: "b-v",
		phonemeIds: ["B", "V"],
		tip: "For /b/ both lips close and then pop open, while for /v/ the top teeth rest on the lower lip and the air keeps flowing with a buzz.",
		minimalPairs: [{ words: ["boat", "vote"] }],
	},

	// Vowels
	{
		id: "i-ix",
		phonemeIds: ["I", "IX"],
		tip: "/i/ is longer and made with the lips spread as in a smile, while /ɪ/ is shorter, with the tongue slightly lower and more relaxed.",
		minimalPairs: [{ words: ["seat", "sit"] }],
	},
	{
		id: "u-ux",
		phonemeIds: ["U", "UX"],
		tip: "/u/ is longer, with the lips tightly rounded, while /ʊ/ is shorter, with the lips looser and the tongue slightly lower.",
		minimalPairs: [{ words: ["pool", "pull"] }],
	},
	{
		id: "e-ae",
		phonemeIds: ["E", "AE"],
		tip: "For /æ/ the jaw drops lower and the lips spread wider than for /ɛ/.",
		minimalPairs: [{ words: ["bed", "bad"] }],
	},
	{
		id: "ae-ah",
		phonemeIds: ["AE", "AH"],
		tip: "For /æ/ drop the jaw and spread the lips wide, while /ʌ/ is a shorter, relaxed sound made with the mouth only slightly open.",
		minimalPairs: [{ words: ["cat", "cut"] }, { words: ["fan", "fun"] }],
	},
	{
		id: "ae-a",
		phonemeIds: ["AE", "A"],
		tip: "Both sounds open the jaw wide, but for /æ/ the tongue pushes forward and the lips spread, while for /ɑ/ the tongue pulls back and the lips relax.",
		minimalPairs: [{ words: ["black", "block"] }, { words: ["hat", "hot"] }],
	},
	{
		id: "ux-ah",
		phonemeIds: ["UX", "AH"],
		tip: "For /ʊ/ the lips are slightly rounded and the tongue sits higher, while for /ʌ/ the lips relax and the jaw opens a little more.",
		minimalPairs: [{ words: ["look", "luck"] }],
	},
	{
		id: "ah-a",
		phonemeIds: ["AH", "A"],
		tip: "For /ɑ/ the jaw drops low and the mouth opens wide, as when a doctor asks you to say 'ah', while /ʌ/ is a short, relaxed sound with the mouth only slightly open.",
		minimalPairs: [{ words: ["cup", "cop"] }],
	},

	// Diphthongs
	{
		id: "ai-ei",
		phonemeIds: ["AI", "EI"],
		tip: "/aɪ/ starts with the jaw wide open, as in 'ah', while /eɪ/ starts with the jaw only half open, and both then glide toward /ɪ/.",
		minimalPairs: [{ words: ["light", "late"] }],
	},
	{
		id: "ou-au",
		phonemeIds: ["OU", "AU"],
		tip: "/oʊ/ starts with rounded lips and a half-open jaw, while /aʊ/ starts with the jaw wide open, as in 'ah', and both then glide toward rounded lips.",
		minimalPairs: [{ words: ["know", "now"] }],
	},
];

/**
 * Contrasts indexed under each of their two phonemes. Pairs are flipped for
 * the second phoneme so words[0] always contains the phoneme looked up.
 */
export const EnglishContrastsByPhonemeId: Partial<
	Record<EnglishPhonemeSymbolId, PhonemeContrastMatch<"en-us">[]>
> = (() => {
	const record: Partial<Record<EnglishPhonemeSymbolId, PhonemeContrastMatch<"en-us">[]>> = {};

	const addEntry = (phonemeId: EnglishPhonemeSymbolId, entry: PhonemeContrastMatch<"en-us">) => {
		const existing = record[phonemeId];
		if (existing) {
			existing.push(entry);
		} else {
			record[phonemeId] = [entry];
		}
	};

	for (const contrast of EnglishPhonemeContrasts) {
		const [leftId, rightId] = contrast.phonemeIds;

		addEntry(leftId, {
			contrastId: contrast.id,
			partnerId: rightId,
			tip: contrast.tip,
			minimalPairs: contrast.minimalPairs,
		});
		addEntry(rightId, {
			contrastId: contrast.id,
			partnerId: leftId,
			tip: contrast.tip,
			minimalPairs: contrast.minimalPairs.map(({ words: [left, right] }) => ({
				words: [right, left],
			})),
		});
	}

	return record;
})();
