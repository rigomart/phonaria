import { type Allophone, getAllophones } from "./phoneme-allophones";
import { getAssets } from "./phoneme-assets";
import { getSpellingPatterns } from "./phoneme-patterns";
import { allPhonemes, getPhonemeById, type Phoneme, type PhonemeId } from "./phonemes";

export type FullPhoneme = Phoneme & {
	spellingPatterns: string[];
	allophones?: Allophone[];
	audioUrl?: string;
	articulationDiagramUrl?: string;
};

export function getFullPhoneme(id: PhonemeId): FullPhoneme | undefined {
	const core = getPhonemeById(id);
	if (!core) return undefined;

	const patterns = getSpellingPatterns(id);
	const allophones = getAllophones(id);
	const assets = getAssets(id);

	return {
		...core,
		spellingPatterns: patterns,
		...(allophones.length > 0 && { allophones }),
		...assets,
	};
}

export function getAllFullPhonemes(): FullPhoneme[] {
	return allPhonemes
		.map((p: Phoneme) => getFullPhoneme(p.id))
		.filter((p: FullPhoneme | undefined): p is FullPhoneme => p !== undefined);
}
