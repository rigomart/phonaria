import {
	getAllophoneRegistryForLanguage,
	isVowelPhoneme,
	type PhonemeAllophone,
	type PhonemeAllophoneContextKey,
	type PhonemeSymbolId,
	type TargetAccent,
} from "@phonaria/phonetics-data";

type VariantRule = {
	readonly appliesAt: (phonemeIds: readonly PhonemeSymbolId[], position: number) => boolean;
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
	// The flap needs a weak vowel next, but the phoneme IDs carry no stress, so this
	// also accepts it before a strong one, as in *attack*.
	flap: {
		appliesAt: (phonemeIds, position) =>
			isVowel(phonemeIds[position + 1]) &&
			(isVowel(phonemeIds[position - 1]) ||
				(phonemeIds[position - 1] === "R" && isVowel(phonemeIds[position - 2]))),
		heardAs: { T: ["RX", "D"], D: ["RX", "T"] },
	},
	// Unaspirated after /s/, the /p/ of *spin*, the /t/ of *stop* and the /k/ of *sky*
	// sound like /b/, /d/ and /ɡ/. Word-initial only: no English word starts with /sb/,
	// /sd/ or /sɡ/, but inside a word voicing after /s/ is a contrast (*discussed* and
	// *disgust*).
	"unaspirated-after-s": {
		appliesAt: (phonemeIds, position) => position === 1 && phonemeIds[0] === "S",
		heardAs: { P: ["B"], T: ["D"], K: ["G"] },
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
	const variants = new Set<PhonemeSymbolId>();
	for (const { contextKey } of registry?.[phonemeId] ?? []) {
		const rule = VARIANT_RULES[contextKey];
		if (!rule?.appliesAt(phonemeIds, position)) continue;
		for (const heard of rule.heardAs[phonemeId] ?? []) variants.add(heard);
	}
	return variants;
}
