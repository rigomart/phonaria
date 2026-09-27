import { describe, expect, it } from "vitest";
import { transformToTranscriptionResult } from "@/lib/g2p-client";
import { extractIpaText } from "@/lib/ipa-copy";
import { batchLookup, tokenizeText } from "@/lib/phoneme-lookup";
import { TRANSCRIPTION_EXAMPLES } from "./examples";

describe("TRANSCRIPTION_EXAMPLES", () => {
	it.each(TRANSCRIPTION_EXAMPLES)("stores the IPA the word lists give for $text", async ({
		text,
		ipa,
	}) => {
		const tokens = tokenizeText(text);
		const { found, missing } = await batchLookup(tokens);
		// Examples must transcribe in the browser, without the lookup service.
		expect(missing).toEqual([]);

		const words = tokens.map((token) => {
			const hit = found.get(token.toLowerCase());
			if (!hit) throw new Error(`no word list entry for ${token}`);
			return { word: hit.word, variants: hit.variants, source: "cmudict" as const };
		});
		const result = transformToTranscriptionResult({ words }, text);

		expect(extractIpaText(result, [])).toBe(ipa);
	});
});
