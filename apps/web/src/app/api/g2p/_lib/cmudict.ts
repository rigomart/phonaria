import { convertArpabetToIPA } from "./arpabet-mapping";

class CMUDict {
	private dict = new Map<string, string[][]>();
	private loaded = false;

	async load(): Promise<void> {
		if (this.loaded) return;

		const CMUDICT_URL = process.env.CMUDICT_SRC_URL;
		if (!CMUDICT_URL) {
			throw new Error("CMUDICT_SRC_URL is not set");
		}
		const MAX_BYTES = 10 * 1024 * 1024; // 10MB safety cap
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000);

		let response: Response;
		try {
			response = await fetch(CMUDICT_URL, { signal: controller.signal, cache: "force-cache" });
		} catch {
			clearTimeout(timeoutId);
			throw new Error("Failed to load CMUdict");
		}
		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error("Failed to load CMUdict");
		}

		const contentType = response.headers.get("content-type") || "";
		if (!contentType.startsWith("text/")) {
			throw new Error("Unexpected content type for CMUdict");
		}

		const contentLengthHeader = response.headers.get("content-length");
		if (contentLengthHeader && Number(contentLengthHeader) > MAX_BYTES) {
			throw new Error("CMUdict too large");
		}

		const reader = response.body?.getReader();
		let received = 0;
		const chunks: Uint8Array[] = [];
		if (reader) {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				if (value) {
					received += value.byteLength;
					if (received > MAX_BYTES) {
						throw new Error("CMUdict too large");
					}
					chunks.push(value);
				}
			}
			const decoded = new TextDecoder("utf-8").decode(concatUint8Arrays(chunks));
			this.parse(decoded);
		} else {
			const text = await response.text();
			if (text.length > MAX_BYTES) {
				throw new Error("CMUdict too large");
			}
			this.parse(text);
		}
		this.loaded = true;
	}

	private parse(content: string): void {
		const lines = content.split(/\r?\n/);
		for (const rawLine of lines) {
			const line = rawLine.trim();
			if (!line) continue;
			// Skip comment/header lines that may start with ';' (old CMU format) or '#'
			if (line.startsWith(";") || line.startsWith("#")) continue;

			// Capture WORD and the rest of the line as phoneme sequence using flexible whitespace
			const match = line.match(/^(\S+)\s+(.+)$/);
			if (!match) continue;

			const wordPart = match[1];
			const phonemePart = match[2];

			// Extract base word from variants (LEAD(1) → LEAD)
			let baseWord = wordPart;
			if (wordPart.includes("(")) {
				baseWord = wordPart.replace(/\(\d+\)$/, "");
			}

			const word = baseWord.toUpperCase();
			const arpaPhonemes = phonemePart.trim().split(/\s+/);
			const ipaPhonemes = convertArpabetToIPA(arpaPhonemes);

			// Store multiple variants per word
			const variants = this.dict.get(word);
			if (!variants) {
				this.dict.set(word, [ipaPhonemes]);
			} else {
				variants.push(ipaPhonemes);
			}
		}
	}

	lookup(word: string): string[][] | undefined {
		if (!this.loaded) {
			throw new Error("Dictionary not loaded");
		}

		return this.dict.get(word.toUpperCase());
	}
}

export const cmudict = new CMUDict();

function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
	let totalLength = 0;
	for (const arr of arrays) totalLength += arr.length;
	const result = new Uint8Array(totalLength);
	let offset = 0;
	for (const arr of arrays) {
		result.set(arr, offset);
		offset += arr.length;
	}
	return result;
}
