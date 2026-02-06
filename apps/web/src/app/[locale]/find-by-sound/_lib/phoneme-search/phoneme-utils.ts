import { PhonemeArpabetLabel, PhonemeIpaMap, type PhonemeSymbolId } from "@phonaria/phonetics-data";

const ARPABET_TO_PHONEME_ID_MAP: Record<string, PhonemeSymbolId> = Object.entries(
	PhonemeArpabetLabel,
).reduce(
	(acc, [phonemeId, arpabet]) => {
		acc[arpabet] = phonemeId as PhonemeSymbolId;
		return acc;
	},
	{} as Record<string, PhonemeSymbolId>,
);

export function isValidArpabetLabel(label: string): boolean {
	return label in ARPABET_TO_PHONEME_ID_MAP;
}

export function getPhonemeIdForArpabet(arpabet: string): PhonemeSymbolId | null {
	return ARPABET_TO_PHONEME_ID_MAP[arpabet] ?? null;
}

export function arpabetToIpa(arpabet: string): string | null {
	const phonemeId = ARPABET_TO_PHONEME_ID_MAP[arpabet];
	if (!phonemeId) return null;
	return PhonemeIpaMap[phonemeId];
}

export function getAllValidArpabetLabels(): string[] {
	return Object.keys(ARPABET_TO_PHONEME_ID_MAP);
}

export function parsePath(pathString: string): string[] {
	return pathString
		.split(",")
		.map((label) => label.trim().toUpperCase())
		.filter((label) => label.length > 0);
}

export function buildPhonemeKeyPrefix(pathArray: string[]): string {
	return pathArray.join("-");
}

export function extractNextPhoneme(phonemeKey: string, pathLength: number): string | null {
	const phonemes = phonemeKey.split("-");
	if (phonemes.length <= pathLength) return null;
	return phonemes[pathLength] ?? null;
}
