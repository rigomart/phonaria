export const TARGET_CAPABILITIES = [
	"controlledServiceFailure",
	"controlledWordlistFailure",
	"practiceSession",
] as const;

export type TargetCapability = (typeof TARGET_CAPABILITIES)[number];

export type TargetAuthentication =
	| { type: "none" }
	| {
			type: "cloudflare-access";
			clientIdEnv: string;
			clientSecretEnv: string;
	  };

export interface LabContractTarget {
	name: string;
	baseUrl: string;
	expectedCanonicalOrigin: string;
	practiceEnabled: boolean;
	indexingEnabled: boolean;
	bucketAssetsAvailable: boolean;
	requiresBaseUrlOverride?: boolean;
	startLocal?: boolean;
	authentication: TargetAuthentication;
	capabilities: Record<TargetCapability, boolean>;
	skipReasons: Partial<Record<TargetCapability, string>>;
}

export const INDEXABLE_PATHS = [
	"/",
	"/ipa-chart/consonants",
	"/ipa-chart/vowels",
	"/credits",
] as const;

export const SITE_NAME = "Phonaria Lab";
export const SITE_DESCRIPTION = "Experimental workspace for phonetic transcription tools";

export const LOOKUP_ERROR_COPY = {
	wordlist: "We couldn't load the word list. Check your connection and try again.",
	service: "We couldn't reach the lookup service. Please try again.",
	unknown: "We couldn't finish transcribing that. Please try again.",
} as const;

export const KNOWN_WORD = "hello";
export const KNOWN_PHRASE = "hello world";
export const MISSING_WORD = "zxqvwoplmj";
/**
 * Client-tier transcription baseline probe. Same string as `KNOWN_WORD`.
 * Verified in `src/baseline-fixtures.test.ts`: present in curated-10k, absent
 * from curated-1k, so lookup finishes in the browser and never calls Turso.
 */
export const CLIENT_HIT_WORD = KNOWN_WORD;
/**
 * Server-tier transcription baseline probe. Must not be `MISSING_WORD`.
 * Verified in `src/baseline-fixtures.test.ts`: absent from curated-1k and
 * curated-10k, present in CMUdict (`AARDVARK` → `A1 R D V A2 R K`), which is
 * the dictionary loaded into Turso. Live Lab asserts IPA, not "Not found".
 */
export const SERVER_HIT_WORD = "aardvark";
export const INPUT_MAX_LENGTH = 200;

export const CONSONANT_COUNT_COPY = "24 American English consonant sounds";
export const VOWEL_COUNT_COPY =
	"16 American English vowel sounds: 11 monophthongs and 5 diphthongs";

export const CONSONANT_BUTTON_NAME = /Voiceless bilabial plosive \(p\)/i;
export const VOWEL_BUTTON_NAME = /Close front unrounded vowel \(i\)/i;

export const BASELINE_RUNS = 5;
export const REGRESSION_THRESHOLD_PERCENT = 20;
