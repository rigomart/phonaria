import { describe, expect, it, vi } from "vitest";
import * as startModule from "./start";

const { resolveLegacyRedirect, serverFunctionCsrf, startInstance } = startModule;

type CsrfServer = (ctx: {
	request: Request;
	pathname: string;
	context: Record<string, never>;
	handlerType: "serverFn" | "router";
	next: () => Promise<unknown>;
}) => Promise<unknown>;

async function runCsrf(
	handlerType: "serverFn" | "router",
	url: string,
	headers: Record<string, string>,
): Promise<{ result: unknown; next: ReturnType<typeof vi.fn> }> {
	const next = vi.fn(async () => ({ request: undefined, response: undefined }));
	const server = serverFunctionCsrf.options.server as unknown as CsrfServer;
	const request = new Request(url, { method: "POST", headers });
	const result = await server({
		request,
		pathname: new URL(url).pathname,
		context: {},
		handlerType,
		next,
	});
	return { result, next };
}

describe("server function CSRF check", () => {
	it("runs as request middleware, since a custom list drops TanStack Start's default", async () => {
		const options = await startInstance.getOptions();
		expect(options.requestMiddleware).toContain(serverFunctionCsrf);
		expect(Symbol.for("tanstack-start:csrf-middleware") in serverFunctionCsrf).toBe(true);
	});

	it.each([
		["https://phonaria.rigos.dev/_serverFn/abc", { "Sec-Fetch-Site": "same-origin" }],
		["http://localhost:3000/_serverFn/abc", { "Sec-Fetch-Site": "same-origin" }],
		[
			"https://phonaria-staging.example.workers.dev/_serverFn/abc",
			{ Origin: "https://phonaria-staging.example.workers.dev" },
		],
	])("lets a same-origin server function call through (%s)", async (url, headers) => {
		const { result, next } = await runCsrf("serverFn", url, headers);
		expect(next).toHaveBeenCalledOnce();
		expect(result).not.toBeInstanceOf(Response);
	});

	it.each<Record<string, string>>([
		{ "Sec-Fetch-Site": "cross-site" },
		{ "Sec-Fetch-Site": "same-site" },
		{ Origin: "https://evil.example" },
		{ Referer: "https://evil.example/page" },
		{},
	])("refuses a server function call from elsewhere (%o)", async (headers) => {
		const { result, next } = await runCsrf(
			"serverFn",
			"https://phonaria.rigos.dev/_serverFn/abc",
			headers,
		);
		expect(next).not.toHaveBeenCalled();
		expect(result).toBeInstanceOf(Response);
		expect((result as Response).status).toBe(403);
	});

	it("leaves API routes and pages to their own handlers", async () => {
		const { result, next } = await runCsrf(
			"router",
			"https://phonaria.rigos.dev/api/speech/score?word=ship&targetAccent=en-us",
			{ "Sec-Fetch-Site": "cross-site", Origin: "https://evil.example" },
		);
		expect(next).toHaveBeenCalledOnce();
		expect(result).not.toBeInstanceOf(Response);
	});
});

describe("legacy request redirects", () => {
	it("exposes a response builder for request middleware", () => {
		expect(
			(startModule as unknown as Record<string, unknown>).getLegacyRedirectResponse,
		).toBeTypeOf("function");
	});

	it("builds a permanent redirect response with the resolved location", () => {
		const response = startModule.getLegacyRedirectResponse(
			new Request("https://phonaria-lab.rigos.dev/en/credits"),
		);

		expect(response?.status).toBe(308);
		expect(response?.headers.get("location")).toBe("https://phonaria.rigos.dev/credits");
	});

	it("does not build a response for a current route", () => {
		expect(
			startModule.getLegacyRedirectResponse(
				new Request("https://phonaria.rigos.dev/ipa-chart/consonants"),
			),
		).toBeUndefined();
	});

	it.each([
		["/credits?from=bookmark", "/credits?from=bookmark"],
		["/ipa-chart/consonants", "/ipa-chart/consonants"],
		["/ipa-chart/vowels", "/ipa-chart/vowels"],
	])("moves old-host request %s directly to the main hostname", (oldPath, mainPath) => {
		expect(
			resolveLegacyRedirect(new Request(`https://phonaria-lab.rigos.dev${oldPath}`))?.href,
		).toBe(`https://phonaria.rigos.dev${mainPath}`);
	});

	it.each([
		["/en", "/"],
		["/es/", "/"],
		["/en/transcription", "/"],
		["/es/transcription/", "/"],
		["/en/credits", "/credits"],
		["/es/credits/", "/credits"],
	])("maps legacy locale path %s to %s", (legacyPath, currentPath) => {
		expect(
			resolveLegacyRedirect(new Request(`https://phonaria.rigos.dev${legacyPath}`))?.href,
		).toBe(`https://phonaria.rigos.dev${currentPath}`);
	});

	it("maps the legacy vowel query to the dedicated vowel chart without a redirect chain", () => {
		expect(
			resolveLegacyRedirect(new Request("https://phonaria-lab.rigos.dev/es/ipa-chart?tab=vowels"))
				?.href,
		).toBe("https://phonaria.rigos.dev/ipa-chart/vowels");
	});

	it.each([
		"https://phonaria.rigos.dev/en/ipa-chart",
		"https://phonaria.rigos.dev/es/ipa-chart?tab=consonants",
	])("maps the legacy default chart to the consonant page", (legacyUrl) => {
		expect(resolveLegacyRedirect(new Request(legacyUrl))?.href).toBe(
			"https://phonaria.rigos.dev/ipa-chart/consonants",
		);
	});

	it("leaves current main-hostname routes alone", () => {
		expect(
			resolveLegacyRedirect(new Request("https://phonaria.rigos.dev/ipa-chart/vowels")),
		).toBeUndefined();
	});
});
