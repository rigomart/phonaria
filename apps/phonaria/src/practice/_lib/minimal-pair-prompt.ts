/**
 * Words to say in minimal-pair practice, drawn from the en-us contrast catalog.
 * A prompt is one word of one pair: its sound from the contrast is the target
 * sound, and the other word of the pair is what the learner says if that sound
 * comes out as its partner.
 */
import {
	EnglishPhonemeContrasts,
	findSubstitution,
	getIpaForPhonemeId,
	getPhonemeCategory,
	type PhonemeCategory,
	type PhonemeContrast,
	type PhonemeSymbolId,
} from "@phonaria/phonetics-data";
import { CatalogWordPronunciations } from "@/lib/speech/catalog-pronunciations";

export interface ContrastSound {
	id: PhonemeSymbolId;
	ipa: string;
}

export interface ContrastOption {
	id: string;
	category: PhonemeCategory;
	sounds: readonly [ContrastSound, ContrastSound];
	/** The contrast's first pair, words in the same order as `sounds`. */
	example: readonly [string, string];
}

export interface MinimalPairPrompt {
	contrastId: string;
	word: string;
	/** The other word of the pair: `word` with the target sound swapped for its partner. */
	partnerWord: string;
	target: ContrastSound;
	partner: ContrastSound;
	/** Position of the target sound in the word's pronunciation. */
	position: number;
}

export interface MinimalPairSearch {
	contrast?: string;
	word?: string;
}

export function contrastSound(id: PhonemeSymbolId): ContrastSound {
	return { id, ipa: getIpaForPhonemeId(id) };
}

function findContrast(contrastId: string): PhonemeContrast<"en-us"> | undefined {
	return EnglishPhonemeContrasts.find((contrast) => contrast.id === contrastId);
}

/** Catalog order, which groups consonants before vowels. */
export function listContrastOptions(): ContrastOption[] {
	return EnglishPhonemeContrasts.map((contrast) => {
		const [first, second] = contrast.phonemeIds;
		return {
			id: contrast.id,
			category: getPhonemeCategory(first),
			sounds: [contrastSound(first), contrastSound(second)],
			example: contrast.minimalPairs[0].words,
		};
	});
}

/** Null unless `word` belongs to one of the contrast's pairs. */
export function promptFor(contrastId: string, word: string): MinimalPairPrompt | null {
	const contrast = findContrast(contrastId);
	if (!contrast) return null;

	for (const { words } of contrast.minimalPairs) {
		const side = words.indexOf(word);
		if (side === -1) continue;

		const partnerWord = words[1 - side];
		const said = CatalogWordPronunciations.get(word)?.[0];
		const other = CatalogWordPronunciations.get(partnerWord)?.[0];
		const substitution = said && other ? findSubstitution(said, other) : null;
		if (!substitution) return null;

		return {
			contrastId,
			word,
			partnerWord,
			target: contrastSound(substitution.from),
			partner: contrastSound(substitution.to),
			position: substitution.index,
		};
	}
	return null;
}

/**
 * A random word from a random pair, either side. Avoids `previous` when the
 * contrast has another word, so "Next word" always moves on.
 */
export function drawWord(
	contrastId: string,
	previous?: string,
	random: () => number = Math.random,
): string | null {
	const contrast = findContrast(contrastId);
	if (!contrast) return null;

	const words = contrast.minimalPairs.flatMap((pair) => pair.words);
	const choices = words.filter((word) => word !== previous);
	const pool = choices.length > 0 ? choices : words;
	return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))] ?? null;
}

/** Drops an unknown contrast, and a word that isn't in the contrast's pairs. */
export function validateMinimalPairSearch(search: Record<string, unknown>): MinimalPairSearch {
	const contrast = typeof search.contrast === "string" ? search.contrast : undefined;
	if (!contrast || !findContrast(contrast)) return {};
	const word = typeof search.word === "string" ? search.word : undefined;
	return word && promptFor(contrast, word) ? { contrast, word } : { contrast };
}
