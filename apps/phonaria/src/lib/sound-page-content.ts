/**
 * What a sound's page says beyond the details it shares with the drawer, all
 * built from data the project already has: a summary line, how a consonant
 * is made, related sounds and common words. Page-only: the common-word data
 * stays out of the drawer's bundle.
 */
import {
	type ConsonantArticulation,
	type EnglishPhonemeSymbolId,
	EnglishPhonemeSpellingPatterns,
	getIpaForPhonemeId,
	getLanguagePhonemeIds,
	getPhonemeArticulationRegistryForLanguage,
	type PhonemeArticulation,
} from "@phonaria/phonetics-data";
import {
	type CommonWordsForSound,
	EnglishCommonWords,
} from "@phonaria/phonetics-data/data/en/common-words";
import { getPhonemeComparisons } from "@/lib/phoneme-comparisons";
import { describeConsonant } from "@/lib/plain-articulation";
import {
	getSoundExamples,
	getSoundKeyExample,
	getSoundName,
	soundPagePath,
} from "@/lib/sound-pages";

const PHONEME_IDS = getLanguagePhonemeIds("en-us") as readonly EnglishPhonemeSymbolId[];

function articulation(id: EnglishPhonemeSymbolId): PhonemeArticulation {
	return (
		getPhonemeArticulationRegistryForLanguage("en-us") as Record<
			EnglishPhonemeSymbolId,
			PhonemeArticulation
		>
	)[id];
}

/** The consonant made the same way with the voice the other way round: /θ/ and /ð/, /s/ and /z/. */
export function getVoicingPartner(
	phonemeId: EnglishPhonemeSymbolId,
): EnglishPhonemeSymbolId | undefined {
	const own = articulation(phonemeId);
	if (own.category !== "consonant") return undefined;
	return PHONEME_IDS.find((id) => {
		const other = articulation(id);
		return (
			other.category === "consonant" &&
			other.features.place === own.features.place &&
			other.features.manner === own.features.manner &&
			other.features.voicing !== own.features.voicing
		);
	});
}

/** "the th in 'thin'" */
function inWord({ letters, word }: { letters: string; word: string }): string {
	return `the ${letters} in '${word}'`;
}

/**
 * "/θ/ is the th in 'thin' and 'think'. Its voiced partner is /ð/, the th in
 * 'this'." The words are the ones the page's description uses.
 */
export function soundSummary(phonemeId: EnglishPhonemeSymbolId): string {
	const [key, other] = getSoundExamples(phonemeId);
	const spelled = !other
		? inWord(key)
		: key.letters === other.letters
			? `${inWord(key)} and '${other.word}'`
			: `${inWord(key)} and ${inWord(other)}`;
	const sentences = [`/${getIpaForPhonemeId(phonemeId)}/ is ${spelled}.`];
	const partner = getVoicingPartner(phonemeId);
	if (partner) {
		const own = articulation(partner) as ConsonantArticulation;
		sentences.push(
			`Its ${own.features.voicing} partner is /${getIpaForPhonemeId(partner)}/, ${inWord(getSoundKeyExample(partner))}.`,
		);
	}
	return sentences.join(" ");
}

/**
 * How the sound is made in one plain sentence, the contrast pages' wording:
 * "/θ/ is made with the tongue between the teeth, pushing air through a
 * narrow gap, with the voice off." Undefined for vowels.
 */
export function howItsMade(phonemeId: EnglishPhonemeSymbolId): string | undefined {
	const own = articulation(phonemeId);
	return own.category === "consonant"
		? describeConsonant(getIpaForPhonemeId(phonemeId), own)
		: undefined;
}

// The simple vowel chart teachers draw: high, mid or low, and front, central or back.
const HEIGHT_ROWS: Record<string, number> = {
	close: 0,
	"near-close": 0,
	"close-mid": 1,
	mid: 1,
	"open-mid": 1,
	"near-open": 2,
	open: 2,
};
const BACKNESS_COLUMNS: Record<string, number> = {
	front: 0,
	"near-front": 0,
	central: 1,
	"near-back": 2,
	back: 2,
};
// The full IPA scale, to put the nearest neighbours first.
const HEIGHT_STEPS = ["close", "near-close", "close-mid", "mid", "open-mid", "near-open", "open"];
const BACKNESS_STEPS = ["front", "near-front", "central", "near-back", "back"];

/**
 * Plain vowels (not diphthongs) one step from this one on the simple vowel
 * chart, up, down, forward or back, or in the same cell; nearest on the full
 * IPA chart first.
 */
export function getVowelNeighbours(phonemeId: EnglishPhonemeSymbolId): EnglishPhonemeSymbolId[] {
	const own = articulation(phonemeId);
	if (own.category !== "vowel" || own.vowelType !== "monophthong") return [];
	const { height, backness } = own.features;
	const distance = (other: { height: string; backness: string }) =>
		Math.abs(HEIGHT_STEPS.indexOf(other.height) - HEIGHT_STEPS.indexOf(height)) +
		Math.abs(BACKNESS_STEPS.indexOf(other.backness) - BACKNESS_STEPS.indexOf(backness));
	return PHONEME_IDS.flatMap((id) => {
		const other = articulation(id);
		if (id === phonemeId || other.category !== "vowel" || other.vowelType !== "monophthong") {
			return [];
		}
		const steps =
			Math.abs(HEIGHT_ROWS[other.features.height] - HEIGHT_ROWS[height]) +
			Math.abs(BACKNESS_COLUMNS[other.features.backness] - BACKNESS_COLUMNS[backness]);
		return steps <= 1 ? [{ id, distance: distance(other.features) }] : [];
	})
		.sort((a, b) => a.distance - b.distance)
		.map(({ id }) => id);
}

/** Sounds whose main spelling, the first in the spelling data, is this sound's: /θ/ and /ð/ (th). */
function getSameSpelling(phonemeId: EnglishPhonemeSymbolId): EnglishPhonemeSymbolId[] {
	const patterns = EnglishPhonemeSpellingPatterns as Record<
		EnglishPhonemeSymbolId,
		{ patterns: readonly string[] }
	>;
	const main = patterns[phonemeId].patterns[0];
	return PHONEME_IDS.filter((id) => id !== phonemeId && patterns[id].patterns[0] === main);
}

export interface RelatedSound {
	id: EnglishPhonemeSymbolId;
	ipa: string;
	/** Its everyday name, e.g. "voiced TH". */
	name: string;
	/** Its key example word, e.g. "this". */
	word: string;
	path: string;
}

const RELATED_LIMIT = 4;

/**
 * Up to four sounds worth a look next: the same main spelling, the voicing
 * partner, then vowel neighbours. Contrast partners are left out: Compare
 * with already lists them.
 */
export function getRelatedSounds(phonemeId: EnglishPhonemeSymbolId): RelatedSound[] {
	const partner = getVoicingPartner(phonemeId);
	const excluded = new Set<string>([
		phonemeId,
		...getPhonemeComparisons("en-us", phonemeId).map(({ partnerId }) => partnerId),
	]);
	const ids = [
		...getSameSpelling(phonemeId),
		...(partner ? [partner] : []),
		...getVowelNeighbours(phonemeId),
	];
	return [...new Set(ids)]
		.filter((id) => !excluded.has(id))
		.slice(0, RELATED_LIMIT)
		.map((id) => ({
			id,
			ipa: getIpaForPhonemeId(id),
			name: getSoundName(id),
			word: getSoundKeyExample(id).word,
			path: soundPagePath(id),
		}));
}

/** Common words from the top-1k list, by where the sound falls in them. */
export function getCommonWords(phonemeId: EnglishPhonemeSymbolId): CommonWordsForSound {
	return EnglishCommonWords[phonemeId];
}
