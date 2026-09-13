export const REQUIRED_CSP_DIRECTIVES = [
	"default-src",
	"script-src",
	"style-src",
	"img-src",
	"font-src",
	"object-src",
	"base-uri",
	"form-action",
	"frame-ancestors",
	"media-src",
] as const;

export const REQUIRED_CSP_TOKENS: Record<string, string> = {
	"default-src": "'self'",
	"script-src": "'self'",
	"style-src": "'self'",
	"img-src": "'self'",
	"font-src": "'self'",
	"object-src": "'none'",
	"base-uri": "'self'",
	"form-action": "'self'",
	"frame-ancestors": "'none'",
	"media-src": "'self'",
};

export function parseCsp(header: string): Map<string, string[]> {
	const directives = new Map<string, string[]>();
	for (const part of header.split(";")) {
		const tokens = part.trim().split(/\s+/).filter(Boolean);
		const name = tokens[0];
		if (!name) continue;
		directives.set(name, tokens.slice(1));
	}
	return directives;
}
