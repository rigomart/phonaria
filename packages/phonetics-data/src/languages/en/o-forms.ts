/**
 * Phonaria teaches /ɔ/ (`O`) as its own sound. Where the dictionary also lists
 * an /ɑ/ (`A`) form of a THOUGHT or CLOTH word, Phonaria shows the /ɔ/ one:
 * caught is /kɔt/, agreeing with taught /tɔt/ (issue #365). LOT words such as
 * lot and doctor keep /ɑ/ first, as in Merriam-Webster and American Heritage.
 */
import { tokenizePronunciation } from "./cmu-arpa";

/**
 * Whether `oForm` is `aForm` with one /ɑ/ vowel said as /ɔ/ at the same stress,
 * and nothing else changed (`K O1 T` of `K A1 T`). Both are stored English IDs.
 */
export function isOFormOf(oForm: string, aForm: string): boolean {
	return oSite(oForm, aForm) !== undefined;
}

/** The token index where `oForm` has /ɔ/ for the /ɑ/ of `aForm`, when that is their only change. */
function oSite(oForm: string, aForm: string): number | undefined {
	const oTokens = tokenizePronunciation(oForm);
	const aTokens = tokenizePronunciation(aForm);
	if (oTokens.length !== aTokens.length) return undefined;
	const changed = aTokens.flatMap((token, index) => (token === oTokens[index] ? [] : [index]));
	if (changed.length !== 1) return undefined;
	const [site] = changed;
	const from = aTokens[site];
	return /^A[012]$/.test(from) && oTokens[site] === `O${from.slice(1)}` ? site : undefined;
}

/**
 * Spellings that mark a THOUGHT or CLOTH vowel: au, aw, augh, ough (caught, awe,
 * bought); a + l + consonant (talk, salt, fall, but not swallow); o directly
 * before s, f, th, g or ng (boss, soft, cloth, fog, long).
 */
const thoughtOrClothSpellings = [
	/au|aw|augh|ough/,
	/a(l[^aeiouyl]|ll(?![aeiouy]))/,
	/o(s|f|th|g|ng)/,
];

/** Words whose spelling matches a THOUGHT or CLOTH pattern but whose /ɑ/ form stays first, with why. */
export const OFormExceptions: ReadonlyMap<string, string> = new Map([
	["gospel", "LOT in General American, /ˈɡɑspəl/, despite o + s."],
	["mosque", "LOT in General American, /mɑsk/, despite o + s."],
	["ongoing", "on + going: the o comes before n, like on; the ng belongs to going."],
]);

/** Whether a word's spelling marks the vowel as THOUGHT or CLOTH, so its /ɔ/ form comes first. */
export function spellsOVowel(word: string): boolean {
	const lower = word.toLowerCase();
	if (OFormExceptions.has(lower)) return false;
	return thoughtOrClothSpellings.some((pattern) => pattern.test(lower));
}

/**
 * The variants in dictionary order, except that an /ɔ/ form listed after its
 * /ɑ/ form swaps places with it when the word's spelling marks a THOUGHT or
 * CLOTH vowel (`spellsOVowel`). Only words whose pairs all differ at one vowel
 * qualify, so the spelling speaks for that vowel. Every other variant keeps its slot.
 */
export function preferOForms(word: string, variants: readonly string[]): string[] {
	const ordered = [...variants];
	const sites = new Set(variants.flatMap((aForm) => variants.map((oForm) => oSite(oForm, aForm))));
	sites.delete(undefined);
	if (sites.size !== 1 || !spellsOVowel(word)) return ordered;
	for (let index = 0; index < ordered.length; index++) {
		const later = ordered.findIndex(
			(other, otherIndex) => otherIndex > index && isOFormOf(other, ordered[index]),
		);
		if (later === -1) continue;
		[ordered[index], ordered[later]] = [ordered[later], ordered[index]];
	}
	return ordered;
}
