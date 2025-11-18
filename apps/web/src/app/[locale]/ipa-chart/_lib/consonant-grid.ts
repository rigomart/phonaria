import type { ConsonantArticulatoryFeatures } from "shared-data";

/**
 * Consonant grid organization types
 */
export type MannerOfArticulation = ConsonantArticulatoryFeatures["manner"];
export type PlaceOfArticulation = ConsonantArticulatoryFeatures["place"];
export type Voicing = ConsonantArticulatoryFeatures["voicing"];

/**
 * Learner-friendly ordering of manner of articulation (rows)
 * Groups similar sounds together: plosives first, then continuants
 */
export const MANNER_ORDER: MannerOfArticulation[] = [
	"plosive",
	"nasal",
	"fricative",
	"affricate",
	"approximant",
];

/**
 * Standard IPA ordering of place of articulation (columns)
 * Ordered from front of mouth to back
 */
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
	"alveolar-lateral",
];

/**
 * Human-readable labels for manner of articulation
 */
export const MANNER_LABELS: Record<MannerOfArticulation, string> = {
	plosive: "Plosive",
	nasal: "Nasal",
	fricative: "Fricative",
	affricate: "Affricate",
	approximant: "Approximant",
};

/**
 * Human-readable labels for place of articulation
 */
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
	"alveolar-lateral": "Lateral",
};

/**
 * Generate a unique key for a grid cell based on manner and place
 */
export function getCellKey(manner: MannerOfArticulation, place: PlaceOfArticulation): string {
	return `${manner}-${place}`;
}

/**
 * Get the row and column indices for a given manner and place
 */
export function getCellPosition(
	manner: MannerOfArticulation,
	place: PlaceOfArticulation,
): { row: number; col: number } {
	const row = MANNER_ORDER.indexOf(manner);
	const col = PLACE_ORDER.indexOf(place);
	return { row, col };
}
