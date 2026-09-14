import { describe, expect, it } from "vitest";
import {
	ASSET_BUCKET_HOST,
	ASSET_BUCKET_ORIGIN,
	formatCloudflareHeadersFile,
	getContentSecurityPolicy,
} from "./security-headers";

describe("getContentSecurityPolicy", () => {
	it("keeps the Lab CSP intent and the asset bucket origin", () => {
		expect(ASSET_BUCKET_HOST).toBe("assets.rigos.dev");
		expect(ASSET_BUCKET_ORIGIN).toBe(`https://${ASSET_BUCKET_HOST}`);
		const policy = getContentSecurityPolicy();
		expect(policy).toContain("default-src 'self'");
		expect(policy).toContain("upgrade-insecure-requests");
		expect(policy).toContain("frame-ancestors 'none'");
		expect(policy).toContain(`img-src 'self' blob: data: ${ASSET_BUCKET_ORIGIN}`);
		expect(policy).toContain(`media-src 'self' ${ASSET_BUCKET_ORIGIN}`);
	});

	it("emits a Cloudflare Static Assets _headers file", () => {
		const file = formatCloudflareHeadersFile();
		expect(file.startsWith("/*\n")).toBe(true);
		expect(file).toContain(`Content-Security-Policy: ${getContentSecurityPolicy()}`);
	});
});
