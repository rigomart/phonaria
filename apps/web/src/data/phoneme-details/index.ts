import { phonemeDetailsCopyEn } from "./en";
import { phonemeDetailsCopyEs } from "./es";
import type { PhonemeDetailsCopy } from "./types";

export * from "./types";

export const phonemeDetailsCopyByLocale: Record<string, PhonemeDetailsCopy> = {
	en: phonemeDetailsCopyEn,
	es: phonemeDetailsCopyEs,
};

export function getPhonemeDetailsCopy(locale: string): PhonemeDetailsCopy {
	return phonemeDetailsCopyByLocale[locale] ?? phonemeDetailsCopyEn;
}
