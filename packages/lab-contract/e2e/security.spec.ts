import { expect, test } from "../src/fixtures";
import { parseCsp, REQUIRED_CSP_DIRECTIVES, REQUIRED_CSP_TOKENS } from "../src/security";

test.describe("Security headers", () => {
	test("sends a CSP that preserves the current policy intent", async ({ request }) => {
		const response = await request.get("/");
		expect(response.status()).toBe(200);

		const header = response.headers()["content-security-policy"];
		expect(header, "Content-Security-Policy must be present").toBeTruthy();

		const directives = parseCsp(header ?? "");
		expect(directives.has("upgrade-insecure-requests")).toBe(true);

		for (const name of REQUIRED_CSP_DIRECTIVES) {
			expect(directives.has(name), `missing CSP directive ${name}`).toBe(true);
			const expectedToken = REQUIRED_CSP_TOKENS[name];
			if (expectedToken) {
				expect(directives.get(name), `CSP ${name} should include ${expectedToken}`).toContain(
					expectedToken,
				);
			}
		}
	});
});
