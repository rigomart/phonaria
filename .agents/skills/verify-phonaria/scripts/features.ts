import { about, aboutOff } from "./about";
import type { Feature } from "./feature";
import { headNavigation } from "./head-navigation";
import { languageHistory, languageHistoryOff } from "./language-history";
import { mergerNotes } from "./merger-notes";
import { minimalPairs, minimalPairsOff } from "./minimal-pairs";
import { frequencyPage, soundFrequency } from "./sound-frequency";
import { soundLinks } from "./sound-links";
import { soundPages } from "./sound-pages";
import { soundSearch, soundSearchOff } from "./sound-search";
import { soundsNav } from "./sounds-nav";
import { transcription } from "./transcription";
import { transcriptionHistory } from "./transcription-history";
import { wordAudio } from "./word-audio";

export const features: Record<string, Feature> = {
	about,
	"about-off": aboutOff,
	"head-navigation": headNavigation,
	"language-history": languageHistory,
	"language-history-off": languageHistoryOff,
	"merger-notes": mergerNotes,
	"minimal-pairs": minimalPairs,
	"minimal-pairs-off": minimalPairsOff,
	"sound-frequency": soundFrequency,
	"frequency-page": frequencyPage,
	"sound-links": soundLinks,
	"sound-pages": soundPages,
	"sound-search": soundSearch,
	"sound-search-off": soundSearchOff,
	"sounds-nav": soundsNav,
	transcription,
	"transcription-history": transcriptionHistory,
	"word-audio": wordAudio,
};

export function getFeature(name: string | undefined, available = features): Feature {
	if (!name) throw new Error(`Choose a feature: ${Object.keys(available).join(", ")}.`);
	if (!Object.hasOwn(available, name))
		throw new Error(`Unknown feature: ${name}. Available: ${Object.keys(available).join(", ")}.`);
	return available[name];
}
