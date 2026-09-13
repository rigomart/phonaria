import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const labRoot = resolve(import.meta.dirname, "../../..");

const clientFiles = [
	"src/app/_store/g2p-store.ts",
	"src/app/_hooks/use-transcribe.ts",
	"src/lib/g2p-client.ts",
	"src/lib/phoneme-lookup/index.ts",
	"src/lib/g2p/model.ts",
	"src/lib/transcription/contract.ts",
];

const forbidden = [
	/@\/db\//,
	/TURSO_/,
	/createClient/,
	/@\/lib\/transcription\/service/,
	/@\/lib\/g2p\/cmudict/,
	/@\/lib\/g2p\/service/,
	/@libsql\/client/,
	/drizzle-orm/,
];

describe("browser transcription boundary", () => {
	it("keeps credentials and server lookup out of client modules", () => {
		for (const file of clientFiles) {
			const source = readFileSync(resolve(labRoot, file), "utf8");
			for (const pattern of forbidden) {
				expect(source, `${file} must not match ${pattern}`).not.toMatch(pattern);
			}
		}
	});

	it("keeps the injectable client transcription seam", () => {
		const store = readFileSync(resolve(labRoot, "src/app/_store/g2p-store.ts"), "utf8");
		const hook = readFileSync(resolve(labRoot, "src/app/_hooks/use-transcribe.ts"), "utf8");

		expect(store).toMatch(/export type TranscribeWordsFn/);
		expect(store).not.toMatch(/transcribeWordsAction/);
		expect(hook).toMatch(/transcribeWordsAction/);
		expect(hook).toMatch(/transcribe\(input\.text, transcribeWordsAction\)/);
	});
});
