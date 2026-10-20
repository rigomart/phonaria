import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseConfigFileTextToJson } from "typescript";
import { describe, expect, it } from "vitest";

type RateLimitConfig = {
	name: string;
	namespace_id: string;
	simple: { limit: number; period: number };
};

type WranglerEnvironment = {
	ratelimits?: RateLimitConfig[];
};

type WranglerConfig = WranglerEnvironment & {
	env?: Record<string, WranglerEnvironment>;
};

const configPath = resolve(import.meta.dirname, "../../../wrangler.jsonc");
const parsed = parseConfigFileTextToJson(configPath, readFileSync(configPath, "utf8"));

if (parsed.error) {
	throw new Error("wrangler.jsonc could not be parsed");
}

const config = parsed.config as WranglerConfig;
const environments = [
	config,
	config.env?.staging ?? {},
	config.env?.preview ?? {},
	config.env?.production ?? {},
];

function speechLimiter(environment: WranglerEnvironment): RateLimitConfig | undefined {
	return environment.ratelimits?.find(({ name }) => name === "SPEECH_RATE_LIMIT");
}

describe("Cloudflare speech scoring rate limit", () => {
	it("allows 20 requests per minute in local and every deployed environment", () => {
		for (const environment of environments) {
			expect(speechLimiter(environment)).toMatchObject({
				simple: { limit: 20, period: 60 },
			});
		}
	});

	it("keeps each environment's counters independent from each other and from every other limit", () => {
		const namespaces = environments.flatMap((environment) =>
			(environment.ratelimits ?? []).map(({ namespace_id }) => namespace_id),
		);

		expect(environments.map(speechLimiter)).not.toContain(undefined);
		expect(namespaces).toHaveLength(20);
		expect(new Set(namespaces).size).toBe(namespaces.length);
	});
});
