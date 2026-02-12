/**
 * Tokenize Spanish text into words suitable for G2P processing.
 * Strips inverted punctuation, keeps Unicode letters (accented, n-tilde, u-dieresis),
 * splits on whitespace, lowercases, and filters empty tokens.
 */
export function tokenizeSpanishText(text: string): string[] {
	return text
		.replace(/[¡¿]/g, "")
		.split(/[^\p{L}]+/u)
		.map((token) => token.toLowerCase().trim())
		.filter((token) => token.length > 0);
}
