import { ARPABET_TO_IPA } from "../_constants/arpabet-to-ipa";

/**
 * Convert ARPAbet phonemes to IPA with stress markers
 */
export function convertArpabetToIPA(arpaPhonemes: string[]): string[] {
	const result: string[] = [];

	for (const arpa of arpaPhonemes) {
		if (arpa.endsWith("1")) {
			result.push("ˈ"); // Primary stress
			result.push(ARPABET_TO_IPA[arpa] || arpa);
		} else if (arpa.endsWith("2")) {
			result.push("ˌ"); // Secondary stress
			result.push(ARPABET_TO_IPA[arpa] || arpa);
		} else {
			result.push(ARPABET_TO_IPA[arpa] || arpa);
		}
	}

	return result;
}
