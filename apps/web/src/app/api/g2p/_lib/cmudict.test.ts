import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock data that mimics actual CMUdict format
const mockCmudictData = `;;;	CMUdict version 0.7b
;;;	Copyright (C) 1993-2015 Carnegie Mellon University. All rights reserved.
;;;
A  AH0
A(1)  EY1
CAT  K AE1 T
CAT(1)  K AE1 T
HELLO  HH AH0 L OW1
HELLO(1)  HH EH1 L OW1
WORLD  W ER1 L D

INVALID LINE WITHOUT DOUBLE SPACE
;;;	This is a comment line
`;

// Create a mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe("CMUDict", () => {
	beforeEach(() => {
		vi.resetAllMocks();

		// Mock successful fetch response by default
		mockFetch.mockResolvedValue({
			ok: true,
			text: () => Promise.resolve(mockCmudictData),
		});
	});

	describe("basic functionality", () => {
		it("should handle fetch errors", async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				statusText: "Not Found",
			});

			const { cmudict } = await import("./cmudict");

			await expect(cmudict.load()).rejects.toThrow("Failed to load CMUdict: Not Found");
		});

		it("should parse dictionary data correctly", async () => {
			const { cmudict } = await import("./cmudict");

			await cmudict.load();

			expect(mockFetch).toHaveBeenCalledWith(
				"https://raw.githubusercontent.com/rigomart/cmudict/refs/heads/master/cmudict.dict",
			);
		});
	});

	describe("lookup functionality", () => {
		it("should find simple words", async () => {
			const { cmudict } = await import("./cmudict");
			await cmudict.load();

			const result = cmudict.lookup("cat");
			expect(result).toBeDefined();
			expect(Array.isArray(result)).toBe(true);
		});

		it("should handle case insensitive lookup", async () => {
			const { cmudict } = await import("./cmudict");
			await cmudict.load();

			const upper = cmudict.lookup("CAT");
			const lower = cmudict.lookup("cat");
			const mixed = cmudict.lookup("Cat");

			expect(upper).toEqual(lower);
			expect(lower).toEqual(mixed);
		});

		it("should return undefined for unknown words", async () => {
			const { cmudict } = await import("./cmudict");
			await cmudict.load();

			expect(cmudict.lookup("nonexistentword")).toBeUndefined();
			expect(cmudict.lookup("")).toBeUndefined();
		});
	});
});
