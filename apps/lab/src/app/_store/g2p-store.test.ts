import { afterEach, describe, expect, it, vi } from "vitest";
import type { G2PSyllable } from "@/lib/g2p/model";
import type { BatchLookupResult, WordLookupResult } from "@/lib/phoneme-lookup";
import { type LookupWordsFn, type TranscribeWordsFn, useG2PStore } from "./g2p-store";

function syllable(...cmuTokens: string[]): G2PSyllable {
	return {
		phonemes: cmuTokens.map((cmuToken) => ({ cmuToken, phonemeId: null })),
		stress: "none",
	};
}

function foundWord(word: string): WordLookupResult {
	return {
		word,
		cmuVariants: ["HH AH"],
		variants: [[syllable("HH", "AH")]],
		source: "tier1",
	};
}

/** Every token is a client-tier hit, so the server is never needed. */
const lookupAllFound: LookupWordsFn = async (words) => ({
	found: new Map(words.map((word) => [word.toLowerCase(), foundWord(word.toLowerCase())])),
	missing: [],
});

/** No token is in the client tiers, so all of them go to the server. */
const lookupAllMissing: LookupWordsFn = async (words) => ({
	found: new Map<string, WordLookupResult>(),
	missing: words,
});

const lookupFails: LookupWordsFn = async () => {
	throw new Error("curated-10k chunk failed to load");
};

/**
 * A tier hit whose syllable carries no `phonemes` array — the shape
 * `transformToTranscriptionResult` walks — so the sync merge/transform step
 * throws on real data rather than on a mocked module.
 */
const lookupMalformed: LookupWordsFn = async (words) => ({
	found: new Map(
		words.map((word) => [
			word.toLowerCase(),
			{
				...foundWord(word.toLowerCase()),
				variants: [[{ stress: "none" } as unknown as G2PSyllable]],
			},
		]),
	),
	missing: [],
});

/** Records every call so a test can assert the server was (or was not) used. */
function countingServer(): TranscribeWordsFn & { calls: string[][] } {
	const calls: string[][] = [];
	const fn = async ({ words }: { words: string[] }) => {
		calls.push(words);
		return words.map((word) => ({
			word: word.toLowerCase(),
			variants: [[syllable("W", "ER", "L", "D")]],
			source: "cmudict" as const,
		}));
	};
	return Object.assign(fn, { calls });
}

const serverFails: TranscribeWordsFn = async () => {
	throw new Error("server action unavailable");
};

/** Puts a real result on screen without reaching for the deleted setters. */
async function seedResult(text = "hello world"): Promise<void> {
	await useG2PStore.getState().transcribe(text, countingServer(), lookupAllFound);
}

afterEach(() => {
	useG2PStore.getState().clearResult();
	vi.restoreAllMocks();
});

describe("g2p-store", () => {
	it("has null initial state", () => {
		const state = useG2PStore.getState();
		expect(state.currentResult).toBeNull();
		expect(state.selectedVariants).toEqual([]);
		expect(state.lookupError).toBeNull();
		expect(state.lastText).toBeNull();
		expect(state.isTranscribing).toBe(false);
	});

	it("clears result", async () => {
		await seedResult();
		useG2PStore.getState().clearResult();
		expect(useG2PStore.getState().currentResult).toBeNull();
		expect(useG2PStore.getState().selectedVariants).toEqual([]);
	});

	it("sets a specific variant", async () => {
		await seedResult("one two three");
		expect(useG2PStore.getState().selectedVariants).toEqual([0, 0, 0]);

		useG2PStore.getState().setVariant(1, 2);
		expect(useG2PStore.getState().selectedVariants).toEqual([0, 2, 0]);
	});

	it("preserves other variants when setting one", async () => {
		await seedResult("one two three");
		useG2PStore.getState().setVariant(0, 1);
		useG2PStore.getState().setVariant(2, 3);
		expect(useG2PStore.getState().selectedVariants).toEqual([1, 0, 3]);
	});
});

describe("g2p-store — transcribe", () => {
	it("transcribes entirely from the client tiers without calling the server", async () => {
		const server = countingServer();
		await useG2PStore.getState().transcribe("hello world", server, lookupAllFound);

		const state = useG2PStore.getState();
		expect(state.currentResult?.words.map((word) => word.word)).toEqual(["hello", "world"]);
		expect(state.selectedVariants).toEqual([0, 0]);
		expect(state.lookupError).toBeNull();
		expect(state.lastText).toBe("hello world");
		expect(server.calls).toEqual([]);
	});

	it("sends only the missing words to the server and merges them in", async () => {
		const server = countingServer();
		const lookupOneMissing: LookupWordsFn = async (words) => ({
			found: new Map([["hello", foundWord("hello")]]),
			missing: words.filter((word) => word !== "hello"),
		});

		await useG2PStore.getState().transcribe("hello world", server, lookupOneMissing);

		const state = useG2PStore.getState();
		expect(server.calls).toEqual([["world"]]);
		expect(state.currentResult?.words[1]).toMatchObject({ word: "world", source: "cmudict" });
		expect(state.currentResult?.words[0]).toMatchObject({ word: "hello", source: "cmudict" });
		expect(state.lookupError).toBeNull();
	});

	/**
	 * `mergeWords` reads the server map by normalized token. The real action
	 * echoes lowercase words, but `transcribeWords` is injectable, so the store
	 * must not depend on that contract.
	 */
	it("merges a server word even when the service echoes its original casing", async () => {
		const echoingServer: TranscribeWordsFn = async ({ words }) =>
			words.map((word) => ({
				word,
				variants: [[syllable("HH", "AH")]],
				source: "cmudict" as const,
			}));

		await useG2PStore.getState().transcribe("Hello", echoingServer, lookupAllMissing);

		const state = useG2PStore.getState();
		expect(state.currentResult?.words[0]?.source).toBe("cmudict");
		expect(state.lookupError).toBeNull();
	});

	it("does nothing for text that tokenizes to nothing", async () => {
		const server = countingServer();
		let lookupCalls = 0;
		const countedLookup: LookupWordsFn = async (words) => {
			lookupCalls += 1;
			return lookupAllFound(words);
		};

		await useG2PStore.getState().transcribe("   ", server, countedLookup);

		const state = useG2PStore.getState();
		expect(state.currentResult).toBeNull();
		expect(state.lookupError).toBeNull();
		expect(state.lastText).toBeNull();
		expect(lookupCalls).toBe(0);
		expect(server.calls).toEqual([]);
	});

	/**
	 * Input that survives the form's trim gate but tokenizes to nothing must not
	 * dismiss an error nobody resolved — no lookup was attempted, so the previous
	 * failure is still true.
	 */
	it("keeps an unresolved error when the next input tokenizes to nothing", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const server = countingServer();
		await seedResult();
		await useG2PStore.getState().transcribe("hello", server, lookupFails);
		expect(useG2PStore.getState().lookupError).toBe("wordlist");

		await useG2PStore.getState().transcribe("???", server, lookupAllFound);

		const state = useG2PStore.getState();
		expect(state.currentResult).toBeNull();
		expect(state.lookupError).toBe("wordlist");
		expect(server.calls).toEqual([]);
	});

	it("reports a word list failure when the client lookup throws", async () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		const server = countingServer();
		await useG2PStore.getState().transcribe("hello", server, lookupFails);

		expect(useG2PStore.getState().lookupError).toBe("wordlist");
		expect(consoleError).toHaveBeenCalled();
		expect(server.calls).toEqual([]);
	});

	it("reports a service failure when the server action throws", async () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		await useG2PStore.getState().transcribe("xyzzyplugh", serverFails, lookupAllMissing);

		expect(useG2PStore.getState().lookupError).toBe("service");
		expect(consoleError).toHaveBeenCalled();
	});

	it("reports an unknown failure when the result cannot be built", async () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		const server = countingServer();
		await useG2PStore.getState().transcribe("hello", server, lookupMalformed);

		expect(useG2PStore.getState().lookupError).toBe("unknown");
		expect(consoleError).toHaveBeenCalled();
		expect(server.calls).toEqual([]);
	});

	/** The backstop: a server response that is not iterable throws outside every
	 * inner catch, and must still reach the learner rather than the void. */
	it("catches a failure no inner handler owns", async () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		const serverReturnsNothing: TranscribeWordsFn = async () => null as never;

		await useG2PStore.getState().transcribe("xyzzyplugh", serverReturnsNothing, lookupAllMissing);

		const state = useG2PStore.getState();
		expect(state.lookupError).toBe("unknown");
		expect(state.isTranscribing).toBe(false);
		expect(consoleError).toHaveBeenCalled();
	});

	it("bumps the error nonce on every settled failure so repeats re-announce", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		await useG2PStore.getState().transcribe("hello", countingServer(), lookupFails);
		const first = useG2PStore.getState().lookupErrorNonce;

		await useG2PStore.getState().transcribe("hello", countingServer(), lookupFails);

		expect(useG2PStore.getState().lookupError).toBe("wordlist");
		expect(useG2PStore.getState().lookupErrorNonce).toBe(first + 1);
	});

	it("keeps the previous result on screen when a lookup fails", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		await seedResult();
		const firstResult = useG2PStore.getState().currentResult;

		await useG2PStore.getState().transcribe("later text", countingServer(), lookupFails);

		const state = useG2PStore.getState();
		expect(state.currentResult).toBe(firstResult);
		expect(state.lookupError).toBe("wordlist");
	});

	it("clears the error when a retry succeeds", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		await useG2PStore.getState().transcribe("hello", countingServer(), lookupFails);
		expect(useG2PStore.getState().lookupError).toBe("wordlist");

		await useG2PStore.getState().transcribe("hello", countingServer(), lookupAllFound);

		const state = useG2PStore.getState();
		expect(state.lookupError).toBeNull();
		expect(state.currentResult?.words.map((word) => word.word)).toEqual(["hello"]);
	});

	it("keeps the submitted text after a failure, so Retry can replay it", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		await useG2PStore.getState().transcribe("hello world", countingServer(), lookupFails);

		expect(useG2PStore.getState().lastText).toBe("hello world");
	});

	it("drops a stale rejection that lands after a newer transcription succeeded", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		let rejectFirst: (error: Error) => void = () => {};
		const hangsThenFails: LookupWordsFn = () =>
			new Promise<BatchLookupResult>((_, reject) => {
				rejectFirst = reject;
			});

		const pending = useG2PStore.getState().transcribe("stale", countingServer(), hangsThenFails);
		await useG2PStore.getState().transcribe("fresh", countingServer(), lookupAllFound);

		rejectFirst(new Error("late chunk failure"));
		await pending;

		const state = useG2PStore.getState();
		expect(state.lookupError).toBeNull();
		expect(state.currentResult?.originalText).toBe("fresh");
		// The newer call owns the flag; the stale rejection must not re-raise it.
		expect(state.isTranscribing).toBe(false);
	});

	it("drops a stale success that lands after a newer transcription succeeded", async () => {
		let releaseFirst: (result: BatchLookupResult) => void = () => {};
		const hangsThenResolves: LookupWordsFn = () =>
			new Promise<BatchLookupResult>((resolve) => {
				releaseFirst = resolve;
			});

		const pending = useG2PStore.getState().transcribe("stale", countingServer(), hangsThenResolves);
		await useG2PStore.getState().transcribe("fresh", countingServer(), lookupAllFound);

		releaseFirst({ found: new Map([["stale", foundWord("stale")]]), missing: [] });
		await pending;

		const state = useG2PStore.getState();
		expect(state.currentResult?.originalText).toBe("fresh");
		expect(state.currentResult?.words.map((word) => word.word)).toEqual(["fresh"]);
	});

	it("reports that a lookup is in flight until it settles", async () => {
		let releaseLookup: (result: BatchLookupResult) => void = () => {};
		const hangs: LookupWordsFn = () =>
			new Promise<BatchLookupResult>((resolve) => {
				releaseLookup = resolve;
			});

		const pending = useG2PStore.getState().transcribe("hello", countingServer(), hangs);
		expect(useG2PStore.getState().isTranscribing).toBe(true);

		releaseLookup({ found: new Map([["hello", foundWord("hello")]]), missing: [] });
		await pending;

		expect(useG2PStore.getState().isTranscribing).toBe(false);
	});

	it("stops reporting a lookup in flight after a failure", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		await useG2PStore.getState().transcribe("hello", countingServer(), lookupFails);

		expect(useG2PStore.getState().isTranscribing).toBe(false);
		expect(useG2PStore.getState().lookupError).toBe("wordlist");
	});

	it("stops reporting a lookup in flight on clearResult", async () => {
		const hangs: LookupWordsFn = () => new Promise<BatchLookupResult>(() => {});

		void useG2PStore.getState().transcribe("hello", countingServer(), hangs);
		expect(useG2PStore.getState().isTranscribing).toBe(true);

		useG2PStore.getState().clearResult();
		expect(useG2PStore.getState().isTranscribing).toBe(false);
	});

	it("resets the error and replay text on clearResult", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		await useG2PStore.getState().transcribe("hello", countingServer(), lookupFails);
		expect(useG2PStore.getState().lookupError).toBe("wordlist");

		useG2PStore.getState().clearResult();

		const state = useG2PStore.getState();
		expect(state.lookupError).toBeNull();
		expect(state.lookupErrorNonce).toBe(0);
		expect(state.lastText).toBeNull();
		expect(state.currentResult).toBeNull();
	});
});
