import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const limiterG2P = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(10, "10 s"),
	prefix: "ratelimit:g2p",
});

const limiterDictionary = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(20, "10 s"),
	prefix: "ratelimit:dictionary",
});

function getClientIp(request: Request): string {
	const ipField = (request as unknown as { ip?: string } | undefined)?.ip;
	return ipField ?? "unknown";
}

export async function applyRateLimit(
	request: Request,
	route: "g2p" | "dictionary",
): Promise<{
	success: boolean;
	headers: Headers;
	retryAfterSeconds: number;
}> {
	const ip = getClientIp(request);
	const limiter = route === "g2p" ? limiterG2P : limiterDictionary;
	const result = await limiter.limit(ip);

	const headers = new Headers();
	if (typeof result.limit === "number") headers.set("X-RateLimit-Limit", String(result.limit));
	if (typeof result.remaining === "number")
		headers.set("X-RateLimit-Remaining", String(result.remaining));
	if (typeof result.reset === "number") headers.set("X-RateLimit-Reset", String(result.reset));

	const nowSeconds = Math.floor(Date.now() / 1000);
	const resetSeconds = typeof result.reset === "number" ? result.reset : nowSeconds + 10;
	const retryAfterSeconds = Math.max(0, resetSeconds - nowSeconds);

	return { success: result.success, headers, retryAfterSeconds };
}
