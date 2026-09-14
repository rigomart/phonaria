import { createMiddleware, createStart } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { getContentSecurityPolicy } from "@/lib/security-headers";

const securityHeaders = createMiddleware().server(async ({ next }) => {
	const result = await next();
	const policy = getContentSecurityPolicy();
	setResponseHeader("Content-Security-Policy", policy);
	const response = "response" in result ? result.response : undefined;
	if (response instanceof Response) {
		response.headers.set("Content-Security-Policy", policy);
	}
	return result;
});

export const startInstance = createStart(() => ({
	requestMiddleware: [securityHeaders],
}));
