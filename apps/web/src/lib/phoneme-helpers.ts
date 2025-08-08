import type { ConsonantPhoneme } from "shared-data";

export type ConsonantGrid = Record<string, Record<string, (ConsonantPhoneme | null)>>;

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

export function buildConsonantGrid(items: ConsonantPhoneme[]): ConsonantGrid {
  const grid: ConsonantGrid = {} as ConsonantGrid;
  for (const manner of MANNERS) {
    grid[manner] = {} as Record<string, ConsonantPhoneme | null>;
    for (const place of PLACES) {
      grid[manner][place] = null;
    }
  }
  for (const c of items) {
    const { place, manner } = c.articulation;
    if (grid[manner] && place in grid[manner]) {
      grid[manner][place] = c;
    }
  }
  return grid;
}

export function phonemeSlug(symbol: string): string {
  return symbol
    .toLowerCase()
    .replace(/[^a-zɡθðʃʒtʃdʒŋɹɾʔɫɝɚæɑɛɪɨʊɔəʌɒː]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type VowelPoint = { x: number; y: number };
export const VOWEL_POSITIONS: Record<string, VowelPoint> = {
  // placeholder; real mapping in later step
};
