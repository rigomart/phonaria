import type { PhonemeSymbolId } from "shared-data";
import { PhonemeSymbolRegistry } from "shared-data";
import type { G2PPhoneme, G2PSyllable } from "../_schemas/g2p-api.schema";

export class FallbackG2P {
	private readonly ipaToPhonemeId = new Map<string, PhonemeSymbolId>();

	private basicConsonantMap: Record<string, string> = {
		b: "b",
		c: "k",
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
		q: "k",
		r: "ɹ",
		s: "s",
		t: "t",
		v: "v",
		w: "w",
		x: "z",
		y: "j",
		z: "z",
	};

	private basicVowelMap: Record<string, string> = {
		a: "æ",
		e: "ɛ",
		i: "ɪ",
		o: "ɔ",
		u: "ʌ",
	};

	constructor() {
		for (const [phonemeId, symbol] of Object.entries(PhonemeSymbolRegistry) as [
			PhonemeSymbolId,
			{ ipa: string },
		][]) {
			if (!this.ipaToPhonemeId.has(symbol.ipa)) {
				this.ipaToPhonemeId.set(symbol.ipa, phonemeId);
			}
		}
	}

	private createPhoneme(ipa: string, token: string): G2PPhoneme {
		const phonemeId = this.ipaToPhonemeId.get(ipa);
		if (!phonemeId) {
			return this.createUnknown(token);
		}

		return {
			ipa,
			phonemeId,
			cmuToken: token,
		};
	}

	private createUnknown(token: string): G2PPhoneme {
		return {
			cmuToken: token,
			phonemeId: null,
		};
	}

	generatePronunciation(word: string): G2PSyllable[] {
		const phonemes: G2PPhoneme[] = [];
		const letters = word.toLowerCase().split("");

		for (const letter of letters) {
			if (this.basicConsonantMap[letter]) {
				phonemes.push(this.createPhoneme(this.basicConsonantMap[letter], letter));
			} else if (this.basicVowelMap[letter]) {
				phonemes.push(this.createPhoneme(this.basicVowelMap[letter], letter));
			} else {
				phonemes.push(this.createUnknown(letter));
			}
		}

		// Return as a single syllable with no stress
		return [
			{
				phonemes,
				stress: "none",
			},
		];
	}
}

export const fallbackG2P = new FallbackG2P();
