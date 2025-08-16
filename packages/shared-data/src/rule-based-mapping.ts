// Rule-based phoneme mapping for basic English words
// This is a simplified implementation for demonstration purposes

export interface RuleBasedMapping {
	[key: string]: string;
}

// Basic rule-based mapping for common English grapheme patterns
export const ruleBasedMapping: RuleBasedMapping = {
	// Single vowels
	a: "æ",
	e: "ɛ",
	i: "ɪ",
	o: "ɑ",
	u: "ʌ",

	// Common vowel combinations
	ai: "eɪ",
	ay: "eɪ",
	ea: "iː",
	ee: "iː",
	ie: "aɪ",
	oa: "oʊ",
	oo: "uː",
	ou: "aʊ",
	ow: "aʊ",
	oy: "ɔɪ",

	// Consonants
	b: "b",
	c: "k", // Default, will be overridden by context
	ch: "tʃ",
	d: "d",
	f: "f",
	g: "ɡ",
	h: "h",
	j: "dʒ",
	k: "k",
	l: "l",
	m: "m",
	n: "n",
	p: "p",
	qu: "kw",
	r: "ɹ",
	s: "s",
	sh: "ʃ",
	t: "t",
	th: "θ", // Default, will be overridden by context
	v: "v",
	w: "w",
	x: "ks",
	y: "j",
	z: "z",

	// Special cases
	ing: "ɪŋ",
	tion: "ʃən",
};

// Function to apply rule-based mapping to a word
export function applyRuleBasedMapping(word: string): string {
	// Convert to lowercase for matching
	const lowerWord = word.toLowerCase();

	// Try to match the whole word first
	if (ruleBasedMapping[lowerWord]) {
		return ruleBasedMapping[lowerWord];
	}

	// Try to match common suffixes
	if (lowerWord.endsWith("ing")) {
		const stem = lowerWord.slice(0, -3);
		return applyRuleBasedMapping(stem) + "ɪŋ";
	}

	if (lowerWord.endsWith("ed")) {
		const stem = lowerWord.slice(0, -2);
		return applyRuleBasedMapping(stem) + "d";
	}

	if (lowerWord.endsWith("er")) {
		const stem = lowerWord.slice(0, -2);
		return applyRuleBasedMapping(stem) + "ɚ";
	}

	if (lowerWord.endsWith("est")) {
		const stem = lowerWord.slice(0, -3);
		return applyRuleBasedMapping(stem) + "əst";
	}

	// Try to match common prefixes
	if (lowerWord.startsWith("un")) {
		const stem = lowerWord.slice(2);
		return "ʌn" + applyRuleBasedMapping(stem);
	}

	if (lowerWord.startsWith("re")) {
		const stem = lowerWord.slice(2);
		return "ɹi" + applyRuleBasedMapping(stem);
	}

	// Try to match common digraphs and trigraphs
	for (let i = 0; i < lowerWord.length; i++) {
		// Check for 3-letter combinations first
		if (i + 2 < lowerWord.length) {
			const threeChars = lowerWord.substring(i, i + 3);
			if (ruleBasedMapping[threeChars]) {
				return ruleBasedMapping[threeChars];
			}
		}

		// Check for 2-letter combinations
		if (i + 1 < lowerWord.length) {
			const twoChars = lowerWord.substring(i, i + 2);
			if (ruleBasedMapping[twoChars]) {
				return ruleBasedMapping[twoChars];
			}
		}

		// Check for single characters
		const oneChar = lowerWord.charAt(i);
		if (ruleBasedMapping[oneChar]) {
			return ruleBasedMapping[oneChar];
		}
	}

	// If no rules match, return a placeholder
	return "ˈʌnknən";
}

// Simple function to get phonemes for a word using rule-based mapping
export function getRuleBasedPhonemes(word: string): { phonemes: string; confidence: number } {
	// For now, we'll return a fixed confidence of 0.3 for rule-based mapping
	// In a more sophisticated implementation, this would be calculated based on
	// how many rules were applied and how reliable they are
	return {
		phonemes: applyRuleBasedMapping(word),
		confidence: 0.3,
	};
}
