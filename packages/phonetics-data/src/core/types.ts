/** Supported target accents (the accent being taught). */
export const TARGET_ACCENTS = ["en-us", "es-419"] as const;

export type TargetAccent = (typeof TARGET_ACCENTS)[number];

/** Base phoneme category shared across all languages. */
export type PhonemeCategory = "consonant" | "vowel";
