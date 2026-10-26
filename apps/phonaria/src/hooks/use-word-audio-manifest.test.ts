import type { WordAudioManifest } from "@phonaria/phonetics-data";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const loader = vi.hoisted(() => vi.fn<(accent: string) => Promise<WordAudioManifest | null>>());
vi.mock("@phonaria/phonetics-data", async (importOriginal) => ({
	...(await importOriginal<typeof import("@phonaria/phonetics-data")>()),
	loadWordAudioManifest: loader,
}));

const manifest: WordAudioManifest = { voice: "jenny", words: ["seat"] };
const settled = () => new Promise((resolve) => setTimeout(resolve));

/** A fresh session: the store keeps manifests at module level. */
async function freshStore() {
	vi.resetModules();
	return (await import("./use-word-audio-manifest")).wordAudioManifests;
}

beforeEach(() => {
	loader.mockReset();
});

afterEach(() => {
	vi.resetModules();
});

describe("word-audio manifest store", () => {
	it("loads nothing until a button subscribes, then loads once per session", async () => {
		loader.mockResolvedValue(manifest);
		const store = await freshStore();
		expect(store.get("en-us")).toBeUndefined();
		expect(loader).not.toHaveBeenCalled();

		const first = vi.fn();
		const second = vi.fn();
		store.subscribe("en-us", first);
		store.subscribe("en-us", second);
		expect(loader).toHaveBeenCalledTimes(1);
		expect(store.get("en-us")).toBeUndefined();

		await settled();
		expect(store.get("en-us")).toBe(manifest);
		expect(first).toHaveBeenCalled();
		expect(second).toHaveBeenCalled();
		store.subscribe("en-us", vi.fn());
		expect(loader).toHaveBeenCalledTimes(1);
	});

	it("keeps null for an accent without recordings without loading it again", async () => {
		loader.mockResolvedValue(null);
		const store = await freshStore();
		store.subscribe("es-419", vi.fn());
		await settled();
		expect(store.get("es-419")).toBeNull();
		store.subscribe("es-419", vi.fn());
		expect(loader).toHaveBeenCalledTimes(1);
	});

	it("shows no buttons after a failed load, and retries when the next button mounts", async () => {
		loader.mockRejectedValueOnce(new Error("chunk failed")).mockResolvedValueOnce(manifest);
		const store = await freshStore();
		const listener = vi.fn();
		store.subscribe("en-us", listener);
		await settled();
		expect(store.get("en-us")).toBeNull();
		expect(listener).toHaveBeenCalledTimes(1);

		store.subscribe("en-us", vi.fn());
		await settled();
		expect(loader).toHaveBeenCalledTimes(2);
		expect(store.get("en-us")).toBe(manifest);
	});

	it("stops notifying a listener once it unsubscribes", async () => {
		loader.mockResolvedValue(manifest);
		const store = await freshStore();
		const listener = vi.fn();
		const unsubscribe = store.subscribe("en-us", listener);
		unsubscribe();
		await settled();
		expect(listener).not.toHaveBeenCalled();
		expect(store.get("en-us")).toBe(manifest);
	});
});
