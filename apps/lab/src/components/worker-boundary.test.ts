import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/** Tests are not shipped components, and this file names the banned imports. */
function listComponentFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = join(directory, entry.name);
		if (entry.isDirectory()) return listComponentFiles(fullPath);
		return entry.name.includes(".test.") ? [] : [fullPath];
	});
}

/**
 * Request-time Worker bindings only exist on the server. A component that
 * imports them would either break hydration or drag Worker-only modules into
 * the client bundle, so the boundary is asserted here rather than left to
 * review.
 */
describe("browser component boundary", () => {
	it("keeps Worker bindings out of browser components", () => {
		const componentDir = resolve(import.meta.dirname);
		for (const file of listComponentFiles(componentDir)) {
			const contents = readFileSync(file, "utf8");
			expect(contents, file).not.toContain("cloudflare:workers");
			expect(contents, file).not.toContain("@/server/cloudflare");
		}
	});
});
