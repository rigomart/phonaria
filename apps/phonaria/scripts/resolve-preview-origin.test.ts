import { describe, expect, it } from "vitest";
import { resolvePreviewOrigin } from "./resolve-preview-origin";

describe("resolvePreviewOrigin", () => {
	it("accepts the account slug or a workers.dev host", () => {
		expect(resolvePreviewOrigin("phonaria-pr-213", "mirdor-dev")).toBe(
			"https://phonaria-pr-213.mirdor-dev.workers.dev",
		);
		expect(resolvePreviewOrigin("phonaria-pr-213", "mirdor-dev.workers.dev")).toBe(
			"https://phonaria-pr-213.mirdor-dev.workers.dev",
		);
		expect(resolvePreviewOrigin("phonaria-staging", "mirdor-dev")).toBe(
			"https://phonaria-staging.mirdor-dev.workers.dev",
		);
	});

	it("falls back to workers.dev when the subdomain is empty", () => {
		expect(resolvePreviewOrigin("phonaria-pr-213")).toBe(
			"https://phonaria-pr-213.workers.dev",
		);
		expect(resolvePreviewOrigin("phonaria-pr-213", "  ")).toBe(
			"https://phonaria-pr-213.workers.dev",
		);
	});
});
