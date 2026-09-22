import { getContentSecurityPolicy } from "@/lib/security-headers";

/** Apply the shared application security policy to a Worker/Start response. */
export function applySecurityHeaders(headers: Headers): void {
	headers.set("Content-Security-Policy", getContentSecurityPolicy());
}
