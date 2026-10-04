import {
	phonemeVariantToCmuArpa,
	phonemeVariantToIpa,
	tokenizePronunciation,
} from "@phonaria/phonetics-data";
import type { TtsInput } from "./providers/types";
import type { WordWithPhonemic } from "./words";

// Checked syllables for every multisyllabic catalog word. Keep these tied to
// exact dictionary tokens so a catalog change cannot silently alter stress.
// Azure IPA stress needs every syllable marked:
// https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-pronunciation
const syllablesByWord: Record<string, readonly string[]> = {
	adapt: ["AX0", "D AE1 P T"],
	adopt: ["AX0", "D A1 P T"],
	belief: ["B IX0", "L I1 F"],
	believe: ["B IX0", "L I1 V"],
	berry: ["B E1", "R I0"],
	body: ["B A1", "D I0"],
	buddy: ["B AH1", "D I0"],
	closing: ["K L OU1", "Z IX0 NG"],
	clothing: ["K L OU1", "DH IX0 NG"],
	liver: ["L IX1", "V ER0"],
	rifle: ["R AI1", "F AX0 L"],
	rival: ["R AI1", "V AX0 L"],
	river: ["R IX1", "V ER0"],
	very: ["V E1", "R I0"],
	washing: ["W A1", "SH IX0 NG"],
	watching: ["W A1", "CH IX0 NG"],
};

export function escapeXml(value: string): string {
	return value.replace(/[&<>"']/g, (character) => {
		const entities: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&apos;",
		};
		return entities[character];
	});
}

export function getAzureIpa(word: WordWithPhonemic): string {
	phonemeVariantToCmuArpa(word.variant); // Reject invalid sounds or stress.
	const variant = tokenizePronunciation(word.variant).join(" ");
	const vowelCount = variant.match(/[012]/g)?.length ?? 0;
	const syllables = vowelCount === 1 ? [variant] : syllablesByWord[word.word];
	if (!syllables) throw new Error(`Checked syllable boundaries required for "${word.word}"`);
	if (syllables.join(" ") !== variant) {
		throw new Error(`Syllables no longer match the dictionary for "${word.word}"`);
	}
	return syllables
		.map((syllable) => {
			const stresses = syllable.match(/[012]/g) ?? [];
			if (stresses.length !== 1)
				throw new Error(`Expected one vowel per syllable for "${word.word}"`);
			const stress =
				syllables.length === 1 ? "" : stresses[0] === "1" ? "ˈ" : stresses[0] === "2" ? "ˌ" : "";
			// The shared phoneme chart combines ER0/ER1. Spoken unstressed ER0 is /ɚ/.
			const ipa = tokenizePronunciation(syllable)
				.map((token) => (token === "ER0" ? "ɚ" : phonemeVariantToIpa(token)))
				.join("");
			return stress + ipa;
		})
		.join(".");
}

export function buildAzureWordInput(word: WordWithPhonemic): TtsInput {
	return {
		id: word.word,
		text: `<phoneme alphabet="ipa" ph="${escapeXml(getAzureIpa(word))}">${escapeXml(word.word)}</phoneme>`,
	};
}
