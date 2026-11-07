import { createCsrfMiddleware, createMiddleware, createStart } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { getSecurityHeaders } from "@/lib/security-headers";

const MAIN_SITE_ORIGIN = "https://phonaria.rigos.dev";
const LEGACY_HOSTNAME = "phonaria-lab.rigos.dev";

function normalizedPathname(pathname: string): string {
	return pathname === "/" ? pathname : pathname.replace(/\/+$/, "");
}

export function resolveLegacyRedirect(request: Request): URL | undefined {
	const url = new URL(request.url);
	let shouldRedirect = false;

	if (url.hostname === LEGACY_HOSTNAME) {
		url.protocol = "https:";
		url.host = new URL(MAIN_SITE_ORIGIN).host;
		shouldRedirect = true;
	}

	const pathname = normalizedPathname(url.pathname);
	if (["/en", "/es", "/en/transcription", "/es/transcription"].includes(pathname)) {
		url.pathname = "/";
		url.search = "";
		shouldRedirect = true;
	} else if (["/en/credits", "/es/credits"].includes(pathname)) {
		url.pathname = "/credits";
		url.search = "";
		shouldRedirect = true;
	} else if (["/en/ipa-chart", "/es/ipa-chart"].includes(pathname)) {
		url.pathname =
			url.searchParams.get("tab") === "vowels" ? "/ipa-chart/vowels" : "/ipa-chart/consonants";
		url.search = "";
		shouldRedirect = true;
	}

	return shouldRedirect ? url : undefined;
}

export function getLegacyRedirectResponse(request: Request): Response | undefined {
	const location = resolveLegacyRedirect(request);
	return location ? Response.redirect(location, 308) : undefined;
}

const legacyRedirects = createMiddleware().server(({ request, next }) => {
	return getLegacyRedirectResponse(request) ?? next();
});

const securityHeaders = createMiddleware().server(async ({ next }) => {
	const result = await next();
	const headers = getSecurityHeaders();
	for (const [name, value] of headers) {
		setResponseHeader(name, value);
	}
	const response = "response" in result ? result.response : undefined;
	if (response instanceof Response) {
		for (const [name, value] of headers) {
			response.headers.set(name, value);
		}
	}
	return result;
});

/**
 * Passing our own `requestMiddleware` replaces TanStack Start's default list,
 * which is only its CSRF check, so it is added back here. Server functions
 * must come from this origin (`Sec-Fetch-Site: same-origin`, else a matching
 * `Origin` or `Referer`); page requests and API routes are not checked.
 */
export const serverFunctionCsrf = createCsrfMiddleware({
	filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
	requestMiddleware: [legacyRedirects, securityHeaders, serverFunctionCsrf],
}));
