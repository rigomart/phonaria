import { describe, expect, it } from "vitest";
import { parseCsp, REQUIRED_CSP_DIRECTIVES, REQUIRED_CSP_TOKENS } from "./security";

describe("parseCsp", () => {
	it("extracts required policy intent without requiring a byte-identical header", () => {
		const header =
			"default-src 'self'; script-src 'self' 'unsafe-inline'; frame-ancestors 'none'; upgrade-insecure-requests; object-src 'none'";
		const directives = parseCsp(header);

		expect(directives.get("default-src")).toContain("'self'");
		expect(directives.get("frame-ancestors")).toContain("'none'");
		expect(directives.has("upgrade-insecure-requests")).toBe(true);
		expect(REQUIRED_CSP_DIRECTIVES.length).toBeGreaterThan(0);
		expect(REQUIRED_CSP_TOKENS["object-src"]).toBe("'none'");
	});
});
