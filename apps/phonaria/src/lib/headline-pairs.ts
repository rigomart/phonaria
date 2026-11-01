import { EnglishPhonemeContrasts } from "@phonaria/phonetics-data";

/**
 * The pair people search for, where it isn't the catalog's first. Picked here
 * so the validated catalog keeps its order. Each must be one of its
 * contrast's pairs; the words may be in either order.
 */
const HEADLINE_PAIRS: Readonly<Record<string, readonly [string, string]>> = {
	"i-ix": ["ship", "sheep"],
	"th-s": ["think", "sink"],
	"l-r": ["light", "right"],
	"th-t": ["three", "tree"],
};

/** A contrast's best-known pair, or its first pair when it has no entry. */
export function getHeadlinePair(contrastId: string): readonly [string, string] {
	const headline = HEADLINE_PAIRS[contrastId];
	if (headline) return headline;
	const contrast = EnglishPhonemeContrasts.find(({ id }) => id === contrastId);
	if (!contrast) throw new Error(`Unknown contrast "${contrastId}".`);
	return contrast.minimalPairs[0].words;
}
