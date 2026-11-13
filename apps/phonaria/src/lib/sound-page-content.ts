import {
	EnglishAllophoneContextLabels,
	EnglishPhonemeAllophones,
	type EnglishPhonemeSymbolId,
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
import { describeConsonant } from "@/lib/plain-articulation";
import { getSoundKeyExample, getSoundName, soundPagePath } from "@/lib/sound-pages";
import { getRankedSpellings, soundsSpelledBy } from "@/lib/spelling-shares";

const PHONEME_IDS = getLanguagePhonemeIds("en-us") as readonly EnglishPhonemeSymbolId[];

function articulation(id: EnglishPhonemeSymbolId): PhonemeArticulation {
	return (
		getPhonemeArticulationRegistryForLanguage("en-us") as Record<
			EnglishPhonemeSymbolId,
			PhonemeArticulation
		>
	)[id];
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
}

/**
 * A sound's articulation features as labelled values, straight from the data:
 * voice, place and manner for a consonant; height, front or back, lips and
 * tense or lax for a vowel; where a diphthong starts and ends.
 */
export function getSoundFeatures(phonemeId: EnglishPhonemeSymbolId): SoundFeature[] {
	const own = articulation(phonemeId);
	const feature = (label: string, value: string) => ({ label, value });
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
		return [feature("Starts", start), feature("Ends", end), feature("Lips", lips)];
	}
	const { height, backness, roundness, tenseness } = own.features;
	return [
		feature("Height", height),
		feature("Front/back", backness),
		feature("Lips", roundness),
		feature("Tense/lax", tenseness),
	];
}

/** A consonant's place, manner and voicing in one plain sentence; undefined for a vowel. */
export function describeHowItsMade(phonemeId: EnglishPhonemeSymbolId): string | undefined {
	const own = articulation(phonemeId);
	return own.category === "consonant"
		? describeConsonant(getIpaForPhonemeId(phonemeId), own)
		: undefined;
}

export interface FeatureDifference {
	label: string;
	own: string;
	other: string;
}

/**
 * How two sounds of the same kind differ, feature by feature. Sounds of
 * different kinds share no features to set side by side.
 */
export function compareSounds(
	own: EnglishPhonemeSymbolId,
	other: EnglishPhonemeSymbolId,
): FeatureDifference[] {
	const a = getSoundFeatures(own);
	const b = getSoundFeatures(other);
	const differences: FeatureDifference[] = [];
	for (const feature of a) {
		const match = b.find(({ label }) => label === feature.label);
		if (!match) continue;
		if (match.value !== feature.value) {
			differences.push({ label: feature.label, own: feature.value, other: match.value });
		}
	}
	return differences;
}

/** For each of this sound's spellings, the other sounds the same letters often spell: th, /ð/. */
export function getSharedSpellings(
	phonemeId: EnglishPhonemeSymbolId,
): { pattern: string; others: SoundRef[] }[] {
	return getRankedSpellings(phonemeId)
		.ranked.map(({ spelling }) => ({
			pattern: spelling,
			others: soundsSpelledBy(spelling)
				.filter((id) => id !== phonemeId)
				.map(soundRef),
		}))
		.filter(({ others }) => others.length > 0);
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
	/** What the listener hears. */
	sound: string;
	/** When it happens. */
	when: string;
	words: readonly string[];
}

/** How the sound changes with its neighbours, for the sounds with variant data. */
export function getSoundVariants(phonemeId: EnglishPhonemeSymbolId): SoundVariant[] {
	return (EnglishPhonemeAllophones[phonemeId] ?? []).map(
		({ ipaVariant, contextKey, examples }) => ({
			ipa: ipaVariant,
			...EnglishAllophoneContextLabels[contextKey],
			words: examples.map(({ word }) => word),
		}),
	);
}
