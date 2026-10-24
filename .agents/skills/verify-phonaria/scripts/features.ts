import type { Feature } from "./feature";
import { languageSpread, languageSpreadOff } from "./language-spread";
import { mergerNotes } from "./merger-notes";
import { minimalPairs, minimalPairsOff } from "./minimal-pairs";
import { frequencyPage, soundFrequency } from "./sound-frequency";
import { transcription } from "./transcription";
import { transcriptionHistory } from "./transcription-history";

export const features: Record<string, Feature> = {
	"language-spread": languageSpread,
	"language-spread-off": languageSpreadOff,
	"merger-notes": mergerNotes,
	"minimal-pairs": minimalPairs,
	"minimal-pairs-off": minimalPairsOff,
	"sound-frequency": soundFrequency,
	"frequency-page": frequencyPage,
	transcription,
	"transcription-history": transcriptionHistory,
};

export function getFeature(name: string | undefined, available = features): Feature {
	if (!name) throw new Error(`Choose a feature: ${Object.keys(available).join(", ")}.`);
	if (!Object.hasOwn(available, name))
		throw new Error(`Unknown feature: ${name}. Available: ${Object.keys(available).join(", ")}.`);
	return available[name];
}
