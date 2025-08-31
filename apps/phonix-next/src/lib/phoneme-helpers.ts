import type { ConsonantPhoneme } from "shared-data";

export const PLACES: Array<ConsonantPhoneme["articulation"]["place"]> = [
	"bilabial",
	"labiodental",
	"dental",
	"alveolar",
	"postalveolar",
	"palatal",
	"velar",
	"glottal",
];

export const MANNERS: Array<ConsonantPhoneme["articulation"]["manner"]> = [
	"stop",
	"fricative",
	"affricate",
	"nasal",
	"liquid",
	"glide",
];
