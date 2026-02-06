/** Supported target languages (the language being taught). */
export const TARGET_LANGUAGES = ["en", "es"] as const;

export type TargetLanguage = (typeof TARGET_LANGUAGES)[number];

/** Base phoneme category shared across all languages. */
export type PhonemeCategory = "consonant" | "vowel";
