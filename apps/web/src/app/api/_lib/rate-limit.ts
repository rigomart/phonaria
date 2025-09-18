import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create rate limiter instance
const ratelimit = new Ratelimit({
	redis: Redis.fromEnv(),
	limiter: Ratelimit.slidingWindow(20, "10 s"),
	analytics: true,
	timeout: 10000,
});

/**
 * Get client IP address from request headers
 * Uses headers for accurate IP detection
 */
function getClientIP(request: Request): string {
	// x-forwarded-for: The public IP address of the client
	const forwardedFor = request.headers.get("x-forwarded-for");
	if (forwardedFor) {
		return forwardedFor.split(",")[0].trim();
	}

	// x-real-ip: Identical to x-forwarded-for (fallback)
	const realIP = request.headers.get("x-real-ip");
	if (realIP) {
		return realIP;
	}

	// Fallback for other environments
	return "unknown";
}

type RateLimitResult = {
	isRateLimited: boolean;
	pending: Promise<unknown>;
};

/**
 * Apply rate limiting to a request
 * Returns the rate limit result and handles analytics properly
 */
export async function checkRateLimit(request: Request): Promise<RateLimitResult> {
	const ip = getClientIP(request);
	const { success, pending } = await ratelimit.limit(ip);

	return { isRateLimited: !success, pending };
}
