import {
	getAllophoneRegistryForLanguage,
	isVowelPhoneme,
	type PhonemeAllophone,
	type PhonemeAllophoneContextKey,
	type PhonemeSymbolId,
	type TargetAccent,
} from "@phonaria/phonetics-data";

type Neighbours = {
	readonly previous: PhonemeSymbolId | undefined;
	readonly next: PhonemeSymbolId | undefined;
};

type VariantRule = {
	readonly appliesBetween: (neighbours: Neighbours) => boolean;
	readonly heardAs: Partial<Record<PhonemeSymbolId, readonly PhonemeSymbolId[]>>;
};

/**
 * Allophones a scorer reports as another phoneme. The rest come back as the
 * phoneme itself (a scorer that writes them apart folds them in its adapter, as
 * the Azure one does with `ɝ` and `ɚ`), or, like the glottal /t/ of *button*,
 * have no phoneme to be heard as.
 */
const VARIANT_RULES: Partial<Record<PhonemeAllophoneContextKey, VariantRule>> = {
	// Scorers report the flap as RX (ɾ), or as /d/ or /t/ when they have no flap symbol.
	"vowel-to-vowel-flap": {
		appliesBetween: ({ previous, next }) => isVowel(previous) && isVowel(next),
		heardAs: { T: ["RX", "D"], D: ["RX", "T"] },
	},
	// Unaspirated after /s/, the /p/ of *spin* and the /k/ of *skate* sound like /b/ and /ɡ/.
	"after-s-onset-unaspirated": {
		appliesBetween: ({ previous }) => previous === "S",
		heardAs: { P: ["B"], K: ["G"] },
	},
};

function isVowel(phonemeId: PhonemeSymbolId | undefined): boolean {
	return phonemeId !== undefined && isVowelPhoneme(phonemeId);
}

/**
 * Heard phonemes that are a normal variant of the sound at `position` in
 * `phonemeIds`, so the judge counts them as that sound: a /d/ heard for the /t/
 * of *water* is a match, not a swap.
 */
export function allowedVariants(
	targetAccent: TargetAccent,
	phonemeIds: readonly PhonemeSymbolId[],
	position: number,
): ReadonlySet<PhonemeSymbolId> {
	const phonemeId = phonemeIds[position];
	const registry = getAllophoneRegistryForLanguage(targetAccent) as Partial<
		Record<PhonemeSymbolId, readonly PhonemeAllophone[]>
	> | null;
	const neighbours = { previous: phonemeIds[position - 1], next: phonemeIds[position + 1] };
	const variants = new Set<PhonemeSymbolId>();
	for (const { contextKey } of registry?.[phonemeId] ?? []) {
		const rule = VARIANT_RULES[contextKey];
		if (!rule?.appliesBetween(neighbours)) continue;
		for (const heard of rule.heardAs[phonemeId] ?? []) variants.add(heard);
	}
	return variants;
}
