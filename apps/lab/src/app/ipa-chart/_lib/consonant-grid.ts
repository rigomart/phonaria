import type { ConsonantArticulatoryFeatures } from "@phonaria/phonetics-data";

export type MannerOfArticulation = ConsonantArticulatoryFeatures["manner"];
export type PlaceOfArticulation = ConsonantArticulatoryFeatures["place"];
export type Voicing = ConsonantArticulatoryFeatures["voicing"];

export const MANNER_ORDER: MannerOfArticulation[] = [
	"plosive",
	"nasal",
	"fricative",
	"affricate",
	"tap",
	"trill",
	"approximant",
	"lateral-approximant",
];

export const PLACE_ORDER: PlaceOfArticulation[] = [
	"bilabial",
	"labiodental",
	"dental",
	"alveolar",
	"postalveolar",
	"palatal",
	"velar",
	"labial-velar",
	"glottal",
];

export const MANNER_LABELS: Record<MannerOfArticulation, string> = {
	plosive: "Plosive",
	nasal: "Nasal",
	fricative: "Fricative",
	affricate: "Affricate",
	tap: "Tap",
	trill: "Trill",
	approximant: "Approximant",
	"lateral-approximant": "Lateral approx.",
};

export const PLACE_LABELS: Record<PlaceOfArticulation, string> = {
	bilabial: "Bilabial",
	labiodental: "Labiodental",
	dental: "Dental",
	alveolar: "Alveolar",
	postalveolar: "Postalveolar",
	palatal: "Palatal",
	velar: "Velar",
	"labial-velar": "Labial-velar",
	glottal: "Glottal",
};

export function getCellKey(manner: MannerOfArticulation, place: PlaceOfArticulation): string {
	return `${manner}-${place}`;
}
