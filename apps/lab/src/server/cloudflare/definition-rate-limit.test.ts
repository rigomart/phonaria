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

function definitionLimiter(environment: WranglerEnvironment): RateLimitConfig | undefined {
	return environment.ratelimits?.find(({ name }) => name === "DEFINITION_RATE_LIMIT");
}

describe("Cloudflare definition rate limit", () => {
	it("allows 60 requests per minute in local and every deployed environment", () => {
		const environments = [
			config,
			config.env?.staging ?? {},
			config.env?.preview ?? {},
			config.env?.production ?? {},
		];

		for (const environment of environments) {
			expect(definitionLimiter(environment)).toMatchObject({
				simple: { limit: 60, period: 60 },
			});
		}
	});

	it("keeps each environment's counters independent from each other and from transcription", () => {
		const namespaces = [
			config,
			config.env?.staging ?? {},
			config.env?.preview ?? {},
			config.env?.production ?? {},
		].flatMap((environment) => [
			environment.ratelimits?.find(({ name }) => name === "TRANSCRIPTION_RATE_LIMIT")?.namespace_id,
			definitionLimiter(environment)?.namespace_id,
		]);

		expect(new Set(namespaces).size).toBe(8);
		expect(namespaces).not.toContain(undefined);
	});
});
