import { afterEach, describe, expect, it, vi } from "vitest";
import { CREDITS_PAGE_DESCRIPTION, CREDITS_PAGE_TITLE } from "@/lib/credits-metadata";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import {
	buildCreditsHead,
	buildRootHead,
	creditsDocumentTitle,
	extractDocumentTitle,
	formatDocumentTitle,
	tryGetDocumentMetadata,
} from "./document-head";

afterEach(() => {
	delete process.env.SITE_URL;
	delete process.env.SITE_INDEXING_ENABLED;
	delete process.env.GOOGLE_SITE_VERIFICATION;
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
});

describe("formatDocumentTitle", () => {
	it("uses the site name alone for the default document", () => {
		expect(formatDocumentTitle()).toBe(SITE_NAME);
	});

	it("applies the site title template", () => {
		expect(creditsDocumentTitle()).toBe(`${CREDITS_PAGE_TITLE} - ${SITE_NAME}`);
	});
});

describe("tryGetDocumentMetadata", () => {
	it("returns metadata when SITE_URL is set", () => {
		process.env.SITE_URL = "https://phonaria-lab-staging.example.test";
		expect(tryGetDocumentMetadata()?.siteUrl).toBe("https://phonaria-lab-staging.example.test");
	});

	it("returns undefined on the client when production SITE_URL is missing", () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubGlobal("window", {} as Window);
		expect(tryGetDocumentMetadata()).toBeUndefined();
	});

	it("rethrows on the server when production SITE_URL is missing", () => {
		vi.stubEnv("NODE_ENV", "production");
		expect(() => tryGetDocumentMetadata()).toThrow(/SITE_URL is not set/);
	});

	it("rethrows a malformed SITE_URL", () => {
		process.env.SITE_URL = "phonaria.rigos.dev";
		expect(() => tryGetDocumentMetadata()).toThrow(/not an absolute URL/);
	});

	it("rethrows a malformed SITE_URL on the client", () => {
		vi.stubGlobal("window", {} as Window);
		process.env.SITE_URL = "phonaria.rigos.dev";
		expect(() => tryGetDocumentMetadata()).toThrow(/not an absolute URL/);
	});
});

describe("extractDocumentTitle", () => {
	it("uses the deepest non-empty title from route matches", () => {
		expect(
			extractDocumentTitle([
				{ meta: [{ title: SITE_NAME }] },
				{ meta: [{ title: creditsDocumentTitle() }] },
			]),
		).toBe(creditsDocumentTitle());
	});

	it("falls back to the site name when matches have no title", () => {
		expect(extractDocumentTitle([{ meta: [{}] }])).toBe(SITE_NAME);
		expect(extractDocumentTitle([])).toBe(SITE_NAME);
	});
});

describe("buildRootHead", () => {
	it("keeps a title on the client when production SITE_URL is missing", () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubGlobal("window", {} as Window);
		expect(buildRootHead().meta).toContainEqual({ title: SITE_NAME });
		expect(buildRootHead().meta).toContainEqual({
			name: "description",
			content: SITE_DESCRIPTION,
		});
	});

	it("adds canonical SEO tags when SITE_URL is set", () => {
		process.env.SITE_URL = "https://phonaria-lab-staging.example.test";
		expect(buildRootHead().meta).toContainEqual({
			property: "og:url",
			content: "https://phonaria-lab-staging.example.test",
		});
	});
});

describe("buildCreditsHead", () => {
	it("keeps the Credits title on the client when production SITE_URL is missing", () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubGlobal("window", {} as Window);
		const head = buildCreditsHead();
		expect(head.meta).toContainEqual({ title: creditsDocumentTitle() });
		expect(head.meta).toContainEqual({
			name: "description",
			content: CREDITS_PAGE_DESCRIPTION,
		});
		expect(head.links).toBeUndefined();
	});

	it("adds the Credits canonical when SITE_URL is set", () => {
		process.env.SITE_URL = "https://phonaria-lab-staging.example.test";
		const head = buildCreditsHead();
		expect(head.links).toEqual([
			{ rel: "canonical", href: "https://phonaria-lab-staging.example.test/credits" },
		]);
	});
});
