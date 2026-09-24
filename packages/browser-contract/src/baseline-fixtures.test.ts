import { describe, expect, it } from "vitest";
import {
	cmudictPronunciations,
	curatedTop1kWords,
	curatedTop10kWords,
	isClientHitWord,
	isServerHitWord,
} from "./baseline-fixtures";
import { CLIENT_HIT_WORD, MISSING_WORD, SERVER_HIT_WORD } from "./constants";

describe("transcription baseline fixtures", () => {
	it("uses hello as a client-tier hit (curated-10k, not curated-1k)", () => {
		expect(CLIENT_HIT_WORD).toBe("hello");
		expect(CLIENT_HIT_WORD in curatedTop1kWords()).toBe(false);
		expect(CLIENT_HIT_WORD in curatedTop10kWords()).toBe(true);
		expect(isClientHitWord(CLIENT_HIT_WORD)).toBe(true);
		expect(isServerHitWord(CLIENT_HIT_WORD)).toBe(false);
	});

	it("uses aardvark as a successful server/Turso hit, not the not-found fixture", () => {
		expect(SERVER_HIT_WORD).toBe("aardvark");
		expect(SERVER_HIT_WORD).not.toBe(MISSING_WORD);
		expect(SERVER_HIT_WORD in curatedTop1kWords()).toBe(false);
		expect(SERVER_HIT_WORD in curatedTop10kWords()).toBe(false);
		expect(isClientHitWord(SERVER_HIT_WORD)).toBe(false);
		expect(cmudictPronunciations(SERVER_HIT_WORD)).toEqual(["A1 R D V A2 R K"]);
		expect(isServerHitWord(SERVER_HIT_WORD)).toBe(true);
	});

	it("does not treat the functional not-found word as a server-hit probe", () => {
		expect(isClientHitWord(MISSING_WORD)).toBe(false);
		expect(cmudictPronunciations(MISSING_WORD)).toBeUndefined();
		expect(isServerHitWord(MISSING_WORD)).toBe(false);
	});
});
