export type PhonemeAssetUrls = {
	audioUrl?: string;
	articulationDiagramUrl?: string;
};

export const phonemeAssets: Map<string, PhonemeAssetUrls> = new Map([]);

export function getAssets(phonemeId: string): PhonemeAssetUrls {
	return phonemeAssets.get(phonemeId) ?? {};
}
