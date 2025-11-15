import type { PhonemeSymbolId } from "shared-data";
import { allPhonemeSymbols } from "shared-data";
import type { G2PPhoneme } from "../_schemas/g2p-api.schema";

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
		for (const [phonemeId, symbol] of Object.entries(allPhonemeSymbols) as [
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
			isKnown: true,
		};
	}

	private createUnknown(token: string): G2PPhoneme {
		return {
			cmuToken: token,
			isKnown: false,
		};
	}

	generatePronunciation(word: string): G2PPhoneme[] {
		const result: G2PPhoneme[] = [];
		const letters = word.toLowerCase().split("");

		for (const letter of letters) {
			if (this.basicConsonantMap[letter]) {
				result.push(this.createPhoneme(this.basicConsonantMap[letter], letter));
			} else if (this.basicVowelMap[letter]) {
				result.push(this.createPhoneme(this.basicVowelMap[letter], letter));
			} else {
				result.push(this.createUnknown(letter));
			}
		}

		return result;
	}
}

export const fallbackG2P = new FallbackG2P();
