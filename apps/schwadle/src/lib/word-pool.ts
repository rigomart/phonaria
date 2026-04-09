/**
 * Curated word pool for Schwadle. Words chosen for tricky pronunciation:
 * silent letters, unexpected vowel sounds, spelling-pronunciation mismatches.
 *
 * Data sourced from CMUDict via @phonaria/phonetics-data curated lists.
 * Format: word → array of CMU ARPABET variant strings.
 */
const CURATED_WORDS: Record<string, string[]> = {
	// Silent consonants
	knight: ["N AI1 T"],
	doubt: ["D AU1 T"],
	debt: ["D E1 T"],
	lamb: ["L AE1 M"],
	climb: ["K L AI1 M"],
	sword: ["S O1 R D"],
	subtle: ["S AH1 T AX0 L"],
	colonel: ["K ER1 N AX0 L"],
	receipt: ["R IX0 S I1 T", "R I0 S I1 T"],

	// Unexpected vowels / ough patterns
	through: ["TH R U1"],
	cough: ["K A1 F", "K O1 F"],
	drought: ["D R AU1 T"],
	enough: ["IX0 N AH1 F", "I0 N AH1 F"],
	height: ["H AI1 T"],

	// French/foreign origin
	chef: ["SH E1 F"],
	debris: ["D AX0 B R I1"],
	queue: ["K Y U1"],
	corps: ["K O1 R", "K O1 R Z"],
	gauge: ["G EI1 J"],

	// Schwa-heavy / reduced vowels
	salmon: ["S AE1 M AX0 N"],
	recipe: ["R E1 S AX0 P I0"],
	women: ["W IX1 M AX0 N"],
	ocean: ["OU1 SH AX0 N"],
	foreign: ["F O1 R AX0 N", "F A1 R AX0 N"],
	stomach: ["S T AH1 M AX0 K"],
	island: ["AI1 L AX0 N D"],

	// Longer / commonly mispronounced
	comfortable: ["K AH1 M F ER0 T AX0 B AX0 L"],
	wednesday: ["W E1 N Z D I0", "W E1 N Z D EI2"],
	vegetable: ["V E1 J T AX0 B AX0 L"],
	february: ["F E1 B Y AX0 W E2 R I0", "F E1 B R U0 E2 R I0"],
	mortgage: ["M O1 R G AX0 J", "M O1 R G IX0 J"],
	lieutenant: ["L U0 T E1 N AX0 N T"],
	psychology: ["S AI0 K A1 L AX0 J I0"],

	// Short but deceptive
	tongue: ["T AH1 NG"],
	muscle: ["M AH1 S AX0 L"],
	answer: ["AE1 N S ER0"],
	chaos: ["K EI1 A0 S"],
	yacht: ["Y A1 T"],
	whistle: ["W IX1 S AX0 L", "H W IX1 S AX0 L"],
};

const wordKeys = Object.keys(CURATED_WORDS);

/**
 * Fisher-Yates shuffle, returns a new array.
 */
function shuffle<T>(array: T[]): T[] {
	const copy = [...array];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

export type GameWord = {
	word: string;
	cmuVariants: string[];
};

/**
 * Selects `count` random words from the curated pool.
 */
export function selectWords(count: number): GameWord[] {
	const shuffled = shuffle(wordKeys);
	return shuffled.slice(0, count).map((word) => ({
		word,
		cmuVariants: CURATED_WORDS[word],
	}));
}

export { CURATED_WORDS };
