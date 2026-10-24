/**
 * Phonaria teaches /ɔ/ (`O`) as its own sound, so where the dictionary also
 * lists an /ɑ/ (`A`) form of a word, it shows the /ɔ/ one: caught is /kɔt/,
 * agreeing with taught /tɔt/ (issue #365).
 */
import { tokenizePronunciation } from "./cmu-arpa";

/**
 * Whether `oForm` is `aForm` with one /ɑ/ vowel said as /ɔ/ at the same stress,
 * and nothing else changed (`K O1 T` of `K A1 T`). Both are stored English IDs.
 */
export function isOFormOf(oForm: string, aForm: string): boolean {
	const oTokens = tokenizePronunciation(oForm);
	const aTokens = tokenizePronunciation(aForm);
	if (oTokens.length !== aTokens.length) return false;
	const changed = aTokens.flatMap((token, index) =>
		token === oTokens[index] ? [] : [[token, oTokens[index]] as const],
	);
	if (changed.length !== 1) return false;
	const [[from, to]] = changed;
	return /^A[012]$/.test(from) && to === `O${from.slice(1)}`;
}

/**
 * The variants in dictionary order, except that an /ɔ/ form listed after its
 * /ɑ/ form swaps places with it. Every other variant keeps its slot.
 */
export function preferOForms(variants: readonly string[]): string[] {
	const ordered = [...variants];
	for (let index = 0; index < ordered.length; index++) {
		const later = ordered.findIndex(
			(other, otherIndex) => otherIndex > index && isOFormOf(other, ordered[index]),
		);
		if (later === -1) continue;
		[ordered[index], ordered[later]] = [ordered[later], ordered[index]];
	}
	return ordered;
}
