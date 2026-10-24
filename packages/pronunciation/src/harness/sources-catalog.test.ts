import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadCatalogSource, PUBLIC_ASSETS_URL } from "./sources";

vi.mock("../../../phonetics-data/data/en/word-audio.json", () => ({
	default: { voice: "jenny", words: ["saw", "seat"], voices: { guy: ["saw"] } },
}));

describe("loadCatalogSource", () => {
	let dir: string;
	beforeEach(async () => {
		dir = await mkdtemp(path.join(tmpdir(), "harness-catalog-"));
	});
	afterEach(async () => {
		vi.unstubAllGlobals();
		await rm(dir, { recursive: true, force: true });
	});

	it("fetches Jenny's clip even for a word the app plays in another voice", async () => {
		const fetched: string[] = [];
		vi.stubGlobal("fetch", async (url: string) => {
			fetched.push(url);
			return new Response(new Uint8Array([1]));
		});
		const load = await loadCatalogSource({
			words: ["saw", "seat"],
			downloadDir: dir,
			offline: false,
		});
		expect(fetched.sort()).toEqual([
			`${PUBLIC_ASSETS_URL}/audio/en-us/words/jenny/saw.ogg`,
			`${PUBLIC_ASSETS_URL}/audio/en-us/words/jenny/seat.ogg`,
		]);
		expect(load.recordings.map(({ sourceId, word }) => `${sourceId} ${word}`)).toEqual([
			"tts:jenny saw",
			"tts:jenny seat",
		]);
		expect(load.missing).toEqual([]);
	});
});
