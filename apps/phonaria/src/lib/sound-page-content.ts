import {
	EnglishAllophoneContextLabels,
	EnglishPhonemeAllophones,
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
import { getPhonemeComparisons, type PhonemeComparison } from "@/lib/phoneme-comparisons";
import { getSoundKeyExample, getSoundName, soundPagePath } from "@/lib/sound-pages";

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

const SIMPLE_CHART_ROWS: Record<string, number> = {
	close: 0,
	"near-close": 0,
	"close-mid": 1,
	mid: 1,
	"open-mid": 1,
	"near-open": 2,
	open: 2,
};
const SIMPLE_CHART_COLUMNS: Record<string, number> = {
	front: 0,
	"near-front": 0,
	central: 1,
	"near-back": 2,
	back: 2,
};
const IPA_HEIGHT_SCALE = [
	"close",
	"near-close",
	"close-mid",
	"mid",
	"open-mid",
	"near-open",
	"open",
];
const IPA_BACKNESS_SCALE = ["front", "near-front", "central", "near-back", "back"];

/**
 * Plain vowels (not diphthongs) one step from this one on the simple vowel
 * chart, up, down, forward or back, or in the same cell; nearest on the full
 * IPA chart first.
 */
export function getVowelNeighbours(phonemeId: EnglishPhonemeSymbolId): EnglishPhonemeSymbolId[] {
	const own = articulation(phonemeId);
	if (own.category !== "vowel" || own.vowelType !== "monophthong") return [];
	const { height, backness } = own.features;
	const ipaDistance = (other: { height: string; backness: string }) =>
		Math.abs(IPA_HEIGHT_SCALE.indexOf(other.height) - IPA_HEIGHT_SCALE.indexOf(height)) +
		Math.abs(IPA_BACKNESS_SCALE.indexOf(other.backness) - IPA_BACKNESS_SCALE.indexOf(backness));
	return PHONEME_IDS.flatMap((id) => {
		const other = articulation(id);
		if (id === phonemeId || other.category !== "vowel" || other.vowelType !== "monophthong") {
			return [];
		}
		const steps =
			Math.abs(SIMPLE_CHART_ROWS[other.features.height] - SIMPLE_CHART_ROWS[height]) +
			Math.abs(SIMPLE_CHART_COLUMNS[other.features.backness] - SIMPLE_CHART_COLUMNS[backness]);
		return steps <= 1 ? [{ id, distance: ipaDistance(other.features) }] : [];
	})
		.sort((a, b) => a.distance - b.distance)
		.map(({ id }) => id);
}

export interface SoundRef {
	id: EnglishPhonemeSymbolId;
	ipa: string;
	/** Its everyday name, e.g. "voiced TH". */
	name: string;
	/** Its key example word, e.g. "this". */
	word: string;
	path: string;
}

export function soundRef(id: EnglishPhonemeSymbolId): SoundRef {
	return {
		id,
		ipa: getIpaForPhonemeId(id),
		name: getSoundName(id),
		word: getSoundKeyExample(id).word,
		path: soundPagePath(id),
	};
}

/** Every sound this one forms a minimal-pair contrast with, each with all its pairs. */
export function getAllComparisons(phonemeId: EnglishPhonemeSymbolId): PhonemeComparison[] {
	return getPhonemeComparisons("en-us", phonemeId, Number.POSITIVE_INFINITY);
}

export interface SoundFeature {
	label: string;
	value: string;
	/** How the value reads after "Both", e.g. "voiceless", "end near-close front". */
	shared: string;
}

/**
 * A sound's articulation features as labelled values, straight from the data:
 * voice, place and manner for a consonant; height, front or back, lips and
 * tense or lax for a vowel; where a diphthong starts and ends.
 */
export function getSoundFeatures(phonemeId: EnglishPhonemeSymbolId): SoundFeature[] {
	const own = articulation(phonemeId);
	const feature = (label: string, value: string, shared = value) => ({ label, value, shared });
	if (own.category === "consonant") {
		const { voicing, place, manner } = own.features;
		return [
			feature("Voice", voicing),
			feature("Place", place),
			feature("Manner", manner.replace("-", " ")),
		];
	}
	if (own.vowelType === "diphthong") {
		const f = own.features;
		const start = `${f.height} ${f.backness}`;
		const end = `${f.targetHeight} ${f.targetBackness}`;
		const lips =
			f.roundness === f.targetRoundness ? f.roundness : `${f.roundness} to ${f.targetRoundness}`;
		return [
			feature("Starts", start, `start ${start}`),
			feature("Ends", end, `end ${end}`),
			feature("Lips", lips),
		];
	}
	const { height, backness, roundness, tenseness } = own.features;
	return [
		feature("Height", height),
		feature("Front/back", backness),
		feature("Lips", roundness),
		feature("Tense/lax", tenseness),
	];
}

export interface FeatureDifference {
	label: string;
	own: string;
	other: string;
}

/**
 * How two sounds of the same kind differ, feature by feature, and what they
 * share. Sounds of different kinds share no features to set side by side.
 */
export function compareSounds(
	own: EnglishPhonemeSymbolId,
	other: EnglishPhonemeSymbolId,
): { differences: FeatureDifference[]; shared: string[] } {
	const a = getSoundFeatures(own);
	const b = getSoundFeatures(other);
	const differences: FeatureDifference[] = [];
	const shared: string[] = [];
	for (const feature of a) {
		const match = b.find(({ label }) => label === feature.label);
		if (!match) continue;
		if (match.value === feature.value) shared.push(feature.shared);
		else differences.push({ label: feature.label, own: feature.value, other: match.value });
	}
	return { differences, shared };
}

function patternsOf(id: EnglishPhonemeSymbolId): readonly string[] {
	return (
		EnglishPhonemeSpellingPatterns as Record<
			EnglishPhonemeSymbolId,
			{ patterns: readonly string[] }
		>
	)[id].patterns;
}

/** For each of this sound's spellings, the other sounds that list the same letters: th, /ð/. */
export function getSharedSpellings(
	phonemeId: EnglishPhonemeSymbolId,
): { pattern: string; others: SoundRef[] }[] {
	return patternsOf(phonemeId)
		.map((pattern) => ({
			pattern,
			others: PHONEME_IDS.filter((id) => id !== phonemeId && patternsOf(id).includes(pattern)).map(
				soundRef,
			),
		}))
		.filter(({ others }) => others.length > 0);
}

export interface SoundFamily {
	label: string;
	sounds: SoundRef[];
}

/**
 * The sounds that share a row or column with this one on the chart: a
 * consonant's voicing partner, the rest made the same way and the rest made
 * in the same place; a plain vowel's neighbours; the other diphthongs.
 */
export function getSoundFamilies(phonemeId: EnglishPhonemeSymbolId): SoundFamily[] {
	const own = articulation(phonemeId);
	const others = (keep: (other: PhonemeArticulation, id: EnglishPhonemeSymbolId) => boolean) =>
		PHONEME_IDS.filter((id) => id !== phonemeId && keep(articulation(id), id));
	const families: SoundFamily[] = [];
	const add = (label: string, ids: readonly EnglishPhonemeSymbolId[]) => {
		if (ids.length > 0) families.push({ label, sounds: ids.map(soundRef) });
	};

	if (own.category === "consonant") {
		const { place, manner } = own.features;
		const partner = getVoicingPartner(phonemeId);
		add("Voicing partner", partner ? [partner] : []);
		add(
			`Other ${manner.replace("-", " ")}s`,
			others(
				(o, id) => id !== partner && o.category === "consonant" && o.features.manner === manner,
			),
		);
		add(
			`Also ${place}`,
			others((o, id) => id !== partner && o.category === "consonant" && o.features.place === place),
		);
	} else if (own.vowelType === "monophthong") {
		add("Next to it on the vowel chart", getVowelNeighbours(phonemeId));
	} else {
		add(
			"Other diphthongs",
			others((o) => o.category === "vowel" && o.vowelType === "diphthong"),
		);
	}
	return families;
}

/** The sounds before and after this one, in the order the sounds list shows them. */
export function getNeighbourPages(phonemeId: EnglishPhonemeSymbolId): {
	previous?: SoundRef;
	next?: SoundRef;
} {
	const index = PHONEME_IDS.indexOf(phonemeId);
	const previous = PHONEME_IDS[index - 1];
	const next = PHONEME_IDS[index + 1];
	return {
		previous: previous ? soundRef(previous) : undefined,
		next: next ? soundRef(next) : undefined,
	};
}

/** Common words from the top-1k list, by where the sound falls in them. */
export function getCommonWords(phonemeId: EnglishPhonemeSymbolId): CommonWordsForSound {
	return EnglishCommonWords[phonemeId];
}

export interface SoundVariant {
	ipa: string;
	/** Where it shows up, e.g. "A quick tap of the tongue, between vowels". */
	label: string;
	words: readonly string[];
}

/** How the sound changes with its neighbours, for the few sounds with variant data. */
export function getSoundVariants(phonemeId: EnglishPhonemeSymbolId): SoundVariant[] {
	return (EnglishPhonemeAllophones[phonemeId] ?? []).map(
		({ ipaVariant, contextKey, examples }) => ({
			ipa: ipaVariant,
			label: EnglishAllophoneContextLabels[contextKey],
			words: examples.map(({ word }) => word),
		}),
	);
}
