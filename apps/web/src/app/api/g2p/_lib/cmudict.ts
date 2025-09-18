import { convertArpabetToIPA } from "./arpabet-mapping";
import { normalizeCmuWord } from "./cmudict-utils";

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

		const blob = await response.blob();
		if (blob.size > MAX_BYTES) {
			throw new Error("CMUdict too large");
		}
		const text = await blob.text();

		this.parse(text);
		this.loaded = true;
	}

	private parse(content: string): void {
		const lines = content.split(/\r?\n/);
		for (const rawLine of lines) {
			const line = rawLine.trim();
			if (!line) continue;
			if (line.startsWith(";") || line.startsWith("#")) continue;

			const match = line.match(/^(\S+)\s+(.+)$/);
			if (!match) continue;

			const word = normalizeCmuWord(match[1]);
			const arpaPhonemes = match[2].trim().split(/\s+/);
			const ipaPhonemes = convertArpabetToIPA(arpaPhonemes);

			const variants = this.dict.get(word);
			if (variants) variants.push(ipaPhonemes);
			else this.dict.set(word, [ipaPhonemes]);
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
