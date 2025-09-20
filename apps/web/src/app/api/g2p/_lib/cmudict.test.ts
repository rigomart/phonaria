import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock data that mimics the JSON format used by the helper script
const mockCmudictData = {
	A: ["AH0", "EY1"],
	CAT: ["K AE1 T"],
	HELLO: ["HH AH0 L OW1", "HH EH1 L OW1"],
	WORLD: ["W ER1 L D"],
};

// Create mocks for fs and path
const mockReadFileSync = vi.fn();
const mockResolve = vi.fn();

vi.mock("node:fs", () => ({
	readFileSync: mockReadFileSync,
}));

vi.mock("node:path", () => ({
	resolve: mockResolve,
}));

describe("CMUDict", () => {
	beforeEach(() => {
		vi.resetAllMocks();

		// Mock successful file read by default
		mockResolve.mockReturnValue("/path/to/cmudict.json");
		mockReadFileSync.mockReturnValue(JSON.stringify(mockCmudictData));
	});

	describe("basic functionality", () => {
		it("should handle file read errors", async () => {
			mockReadFileSync.mockImplementation(() => {
				throw new Error("File not found");
			});

			const { cmudict } = await import("./cmudict");

			await expect(cmudict.load()).rejects.toThrow(
				"Failed to load CMUDict JSON file: Error: File not found",
			);
		});

		it("should handle JSON parse errors", async () => {
			mockReadFileSync.mockReturnValue("invalid json content");

			const { cmudict } = await import("./cmudict");

			await expect(cmudict.load()).rejects.toThrow("Failed to parse CMUDict JSON: SyntaxError:");
		});

		it("should parse dictionary data correctly", async () => {
			const { cmudict } = await import("./cmudict");

			await cmudict.load();

			expect(mockResolve).toHaveBeenCalledWith(process.cwd(), "data/cmudict.json");
			expect(mockReadFileSync).toHaveBeenCalledWith("/path/to/cmudict.json", "utf-8");
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
