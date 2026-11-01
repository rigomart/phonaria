import { readFileSync } from "node:fs";
import { parseConfigFileTextToJson } from "typescript";

const CLIENT_SITE_KEYS = ["SITE_URL", "SITE_INDEXING_ENABLED", "GOOGLE_SITE_VERIFICATION"] as const;

type Vars = Record<string, string | undefined>;

type WranglerConfig = { vars?: Vars; env?: Record<string, { vars?: Vars }> };

/** The Worker's vars for a Cloudflare environment, or the top-level ones when none is named. */
export function readWranglerVars(configPath: string, cloudflareEnv: string | undefined): Vars {
	const parsed = parseConfigFileTextToJson(configPath, readFileSync(configPath, "utf8"));
	if (parsed.error) throw new Error(`${configPath} could not be parsed`);
	const config = parsed.config as WranglerConfig;
	if (!cloudflareEnv) return config.vars ?? {};
	const environment = config.env?.[cloudflareEnv];
	if (!environment) throw new Error(`${configPath} has no "${cloudflareEnv}" environment`);
	return environment.vars ?? {};
}

/**
 * `define` entries for the client bundle: each key from the build environment,
 * else the Worker's var, else empty (the precedence the Worker gets from
 * `.dev.vars` and `--var`).
 */
export function clientSiteDefines(buildEnv: Vars, workerVars: Vars): Record<string, string> {
	return Object.fromEntries(
		CLIENT_SITE_KEYS.map((key) => [
			`process.env.${key}`,
			JSON.stringify(buildEnv[key] || workerVars[key] || ""),
		]),
	);
}
