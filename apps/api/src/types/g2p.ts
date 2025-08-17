/**
 * G2P (Grapheme-to-Phoneme) API types
 */

export interface G2PRequest {
	text: string;
}

export interface G2PWord {
	word: string;
	phonemes: string[];
}

export interface G2PResponse {
	words: G2PWord[];
}

export interface G2PError {
	error: string;
	message: string;
}
