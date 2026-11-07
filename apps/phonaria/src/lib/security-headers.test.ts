import { describe, expect, it } from "vitest";
import {
	ASSET_BUCKET_HOST,
	ASSET_BUCKET_ORIGIN,
	formatCloudflareHeadersFile,
	getContentSecurityPolicy,
	getSecurityHeaders,
	HASHED_ASSET_CACHE_CONTROL,
	PERMISSIONS_POLICY,
} from "./security-headers";

describe("getContentSecurityPolicy", () => {
	it("keeps the CSP intent and the asset bucket origin", () => {
		expect(ASSET_BUCKET_HOST).toBe("assets.rigos.dev");
		expect(ASSET_BUCKET_ORIGIN).toBe(`https://${ASSET_BUCKET_HOST}`);
		const policy = getContentSecurityPolicy();
		expect(policy).toContain("default-src 'self'");
		expect(policy).toContain("upgrade-insecure-requests");
		expect(policy).toContain("frame-ancestors 'none'");
		expect(policy).toContain(`img-src 'self' blob: data: ${ASSET_BUCKET_ORIGIN}`);
		expect(policy).toContain(`media-src 'self' ${ASSET_BUCKET_ORIGIN}`);
		expect(policy).not.toContain("dictionaryapi.dev");
		expect(policy).not.toContain("wiktionary.org");
	});

	it("emits a Cloudflare Static Assets _headers file", () => {
		const file = formatCloudflareHeadersFile();
		expect(file.startsWith("/*\n")).toBe(true);
		expect(file).toContain(`Content-Security-Policy: ${getContentSecurityPolicy()}`);
		expect(file).toContain("Strict-Transport-Security: max-age=31536000\n");
		expect(file).toContain("  X-Content-Type-Options: nosniff\n");
		expect(file).toContain("  Referrer-Policy: strict-origin-when-cross-origin\n");
		expect(file).toContain("  Permissions-Policy: microphone=(self), camera=(), geolocation=()\n");
	});

	it("writes every shared security header for prerendered pages", () => {
		const pageRules = formatCloudflareHeadersFile().split("\n\n")[0];
		expect(pageRules).toBe(
			["/*", ...getSecurityHeaders().map(([name, value]) => `  ${name}: ${value}`)].join("\n"),
		);
	});

	it("caches hashed assets immutably so warm loads do not revalidate them", () => {
		const file = formatCloudflareHeadersFile();
		expect(file).toContain(`/assets/*\n  Cache-Control: ${HASHED_ASSET_CACHE_CONTROL}`);
		expect(HASHED_ASSET_CACHE_CONTROL).toContain("immutable");
	});
});

describe("getSecurityHeaders", () => {
	it("lists the headers every response carries", () => {
		expect(Object.fromEntries(getSecurityHeaders())).toEqual({
			"Content-Security-Policy": getContentSecurityPolicy(),
			"Strict-Transport-Security": "max-age=31536000",
			"X-Content-Type-Options": "nosniff",
			"Referrer-Policy": "strict-origin-when-cross-origin",
			"Permissions-Policy": PERMISSIONS_POLICY,
		});
	});

	it("lets the microphone run on this origin only and turns off camera and location", () => {
		expect(PERMISSIONS_POLICY).toBe("microphone=(self), camera=(), geolocation=()");
	});
});
