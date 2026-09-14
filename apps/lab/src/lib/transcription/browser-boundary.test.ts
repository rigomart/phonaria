import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const labRoot = resolve(import.meta.dirname, "../../..");

const clientFiles = [
	"src/lib/transcription/g2p-store.ts",
	"src/hooks/use-transcribe.tsx",
	"src/lib/transcription/server-function-error.ts",
	"src/lib/g2p-client.ts",
	"src/lib/phoneme-lookup/index.ts",
	"src/lib/g2p/model.ts",
	"src/lib/transcription/contract.ts",
	"src/components/transcription/transcription-journey.tsx",
	"src/routes/index.tsx",
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
	/cloudflare:workers/,
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
		const store = readFileSync(resolve(labRoot, "src/lib/transcription/g2p-store.ts"), "utf8");
		const hook = readFileSync(resolve(labRoot, "src/hooks/use-transcribe.tsx"), "utf8");
		const nextPage = readFileSync(resolve(labRoot, "src/app/page.tsx"), "utf8");
		const startRoute = readFileSync(resolve(labRoot, "src/routes/index.tsx"), "utf8");

		expect(store).toMatch(/export type TranscribeWordsFn/);
		expect(store).not.toMatch(/transcribeWordsAction/);
		expect(hook).not.toMatch(/transcribeWordsAction/);
		expect(nextPage).toMatch(/transcribeWordsAction/);
		expect(startRoute).toMatch(/transcribeWordsFromStart/);
		expect(startRoute).not.toMatch(/transcribeWordsAction/);
	});

	it("keeps curated-10k behind a client-only dynamic import", () => {
		const lookup = readFileSync(resolve(labRoot, "src/lib/phoneme-lookup/shared.ts"), "utf8");
		expect(lookup).toMatch(/import\("@phonaria\/phonetics-data\/data\/en\/curated-10k"\)/);

		const serverFiles = [
			"src/server/transcription.ts",
			"src/server/transcribe.ts",
			"src/lib/transcription/service.ts",
			"src/lib/g2p/service.ts",
			"src/db/drizzle.ts",
		];
		for (const file of serverFiles) {
			const source = readFileSync(resolve(labRoot, file), "utf8");
			expect(source, file).not.toMatch(/curated-10k/);
			expect(source, file).not.toMatch(/EnglishCuratedTop10k/);
		}
	});
});
