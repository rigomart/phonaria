import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	type LabContractTarget,
	TARGET_CAPABILITIES,
	type TargetAuthentication,
	type TargetCapability,
} from "./constants";

const TARGETS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "targets");

export class TargetConfigError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "TargetConfigError";
	}
}

export function listTargetNames(targetsDir = TARGETS_DIR): string[] {
	return readdirSync(targetsDir)
		.filter((file) => file.endsWith(".json"))
		.map((file) => file.replace(/\.json$/, ""))
		.sort();
}

export function loadTargetFromEnv(
	env: NodeJS.Dict<string> = process.env,
	targetsDir = TARGETS_DIR,
): LabContractTarget {
	const name = env.LAB_CONTRACT_TARGET?.trim() || "vercel-production";
	const available = listTargetNames(targetsDir);
	if (!available.includes(name)) {
		throw new TargetConfigError(
			`Unknown Lab contract target "${name}". Available targets: ${available.join(", ")}.`,
		);
	}

	const raw = JSON.parse(readFileSync(join(targetsDir, `${name}.json`), "utf8")) as unknown;
	const target = parseTarget(raw, name);
	return applyEnvOverrides(target, env);
}

export function getTarget(): LabContractTarget {
	return loadTargetFromEnv();
}

export function extraHttpHeaders(
	target: LabContractTarget,
	env: NodeJS.Dict<string> = process.env,
): Record<string, string> {
	if (target.authentication.type === "none") return {};

	const clientId = env[target.authentication.clientIdEnv]?.trim();
	const clientSecret = env[target.authentication.clientSecretEnv]?.trim();
	if (!clientId || !clientSecret) {
		throw new TargetConfigError(
			`Target "${target.name}" requires Cloudflare Access credentials in ${target.authentication.clientIdEnv} and ${target.authentication.clientSecretEnv}.`,
		);
	}

	return {
		"CF-Access-Client-Id": clientId,
		"CF-Access-Client-Secret": clientSecret,
	};
}

function applyEnvOverrides(target: LabContractTarget, env: NodeJS.Dict<string>): LabContractTarget {
	const baseUrlOverride = env.LAB_CONTRACT_BASE_URL?.trim();
	const canonicalOverride = env.LAB_CONTRACT_CANONICAL_ORIGIN?.trim();
	const startLocal =
		env.LAB_CONTRACT_START_LOCAL === "1" || env.LAB_CONTRACT_START_LOCAL === "true";

	if (target.requiresBaseUrlOverride && !baseUrlOverride) {
		throw new TargetConfigError(
			`Target "${target.name}" requires LAB_CONTRACT_BASE_URL because it has no stable default origin yet.`,
		);
	}

	const baseUrl = stripTrailingSlash(baseUrlOverride || target.baseUrl);
	if (!baseUrl) {
		throw new TargetConfigError(`Target "${target.name}" is missing a base URL.`);
	}
	assertAbsoluteUrl(baseUrl, "baseUrl");

	const expectedCanonicalOrigin = stripTrailingSlash(
		canonicalOverride || target.expectedCanonicalOrigin || baseUrl,
	);
	assertAbsoluteUrl(expectedCanonicalOrigin, "expectedCanonicalOrigin");

	return {
		...target,
		baseUrl,
		expectedCanonicalOrigin,
		startLocal: startLocal || target.startLocal === true,
	};
}

function parseTarget(raw: unknown, expectedName: string): LabContractTarget {
	if (!isRecord(raw)) {
		throw new TargetConfigError(`Target "${expectedName}" must be a JSON object.`);
	}

	const name = requiredString(raw, "name");
	if (name !== expectedName) {
		throw new TargetConfigError(
			`Target file "${expectedName}.json" must set name to "${expectedName}", not "${name}".`,
		);
	}

	const capabilities = parseCapabilities(raw.capabilities, name);
	const skipReasons = parseSkipReasons(raw.skipReasons, name, capabilities);

	return {
		name,
		baseUrl: optionalString(raw, "baseUrl"),
		expectedCanonicalOrigin: optionalString(raw, "expectedCanonicalOrigin"),
		practiceEnabled: requiredBoolean(raw, "practiceEnabled"),
		indexingEnabled: requiredBoolean(raw, "indexingEnabled"),
		bucketAssetsAvailable: requiredBoolean(raw, "bucketAssetsAvailable"),
		requiresBaseUrlOverride: optionalBoolean(raw, "requiresBaseUrlOverride"),
		startLocal: optionalBoolean(raw, "startLocal"),
		authentication: parseAuthentication(raw.authentication, name),
		capabilities,
		skipReasons,
	};
}

function parseCapabilities(raw: unknown, targetName: string): Record<TargetCapability, boolean> {
	if (!isRecord(raw)) {
		throw new TargetConfigError(`Target "${targetName}" is missing capabilities.`);
	}

	const capabilities = {} as Record<TargetCapability, boolean>;
	for (const capability of TARGET_CAPABILITIES) {
		const value = raw[capability];
		if (typeof value !== "boolean") {
			throw new TargetConfigError(
				`Target "${targetName}" must set capabilities.${capability} to a boolean.`,
			);
		}
		capabilities[capability] = value;
	}
	return capabilities;
}

function parseSkipReasons(
	raw: unknown,
	targetName: string,
	capabilities: Record<TargetCapability, boolean>,
): Partial<Record<TargetCapability, string>> {
	const skipReasons: Partial<Record<TargetCapability, string>> = {};
	if (raw !== undefined && !isRecord(raw)) {
		throw new TargetConfigError(`Target "${targetName}" skipReasons must be an object.`);
	}

	if (isRecord(raw)) {
		for (const [key, value] of Object.entries(raw)) {
			if (!isCapability(key)) {
				throw new TargetConfigError(
					`Target "${targetName}" has an unknown skipReasons key "${key}".`,
				);
			}
			if (typeof value !== "string" || value.trim().length === 0) {
				throw new TargetConfigError(
					`Target "${targetName}" skipReasons.${key} must be a non-empty justification.`,
				);
			}
			skipReasons[key] = value.trim();
		}
	}

	for (const capability of TARGET_CAPABILITIES) {
		if (!capabilities[capability] && !skipReasons[capability]) {
			throw new TargetConfigError(
				`Target "${targetName}" disables ${capability} without skipReasons.${capability}. Silent skips are not allowed.`,
			);
		}
	}

	if (!capabilities.practiceSession && skipReasons.practiceSession === undefined) {
		throw new TargetConfigError(
			`Target "${targetName}" disables practiceSession without a skip reason.`,
		);
	}

	return skipReasons;
}

function parseAuthentication(raw: unknown, targetName: string): TargetAuthentication {
	if (!isRecord(raw) || typeof raw.type !== "string") {
		throw new TargetConfigError(`Target "${targetName}" is missing authentication.type.`);
	}

	if (raw.type === "none") return { type: "none" };

	if (raw.type === "cloudflare-access") {
		const clientIdEnv = requiredNestedString(raw, "clientIdEnv", targetName);
		const clientSecretEnv = requiredNestedString(raw, "clientSecretEnv", targetName);
		return { type: "cloudflare-access", clientIdEnv, clientSecretEnv };
	}

	throw new TargetConfigError(
		`Target "${targetName}" has unsupported authentication.type "${String(raw.type)}".`,
	);
}

function requiredString(raw: Record<string, unknown>, key: string): string {
	const value = raw[key];
	if (typeof value !== "string" || value.trim().length === 0) {
		throw new TargetConfigError(`Target field "${key}" must be a non-empty string.`);
	}
	return value.trim();
}

function optionalString(raw: Record<string, unknown>, key: string): string {
	const value = raw[key];
	if (value === undefined || value === null) return "";
	if (typeof value !== "string") {
		throw new TargetConfigError(`Target field "${key}" must be a string.`);
	}
	return value.trim();
}

function requiredBoolean(raw: Record<string, unknown>, key: string): boolean {
	const value = raw[key];
	if (typeof value !== "boolean") {
		throw new TargetConfigError(`Target field "${key}" must be a boolean.`);
	}
	return value;
}

function optionalBoolean(raw: Record<string, unknown>, key: string): boolean | undefined {
	const value = raw[key];
	if (value === undefined) return undefined;
	if (typeof value !== "boolean") {
		throw new TargetConfigError(`Target field "${key}" must be a boolean.`);
	}
	return value;
}

function requiredNestedString(
	raw: Record<string, unknown>,
	key: string,
	targetName: string,
): string {
	const value = raw[key];
	if (typeof value !== "string" || value.trim().length === 0) {
		throw new TargetConfigError(`Target "${targetName}" authentication.${key} must be a string.`);
	}
	return value.trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCapability(value: string): value is TargetCapability {
	return (TARGET_CAPABILITIES as readonly string[]).includes(value);
}

function stripTrailingSlash(value: string): string {
	return value.replace(/\/+$/, "");
}

function assertAbsoluteUrl(value: string, field: string): void {
	try {
		const url = new URL(value);
		if (url.protocol !== "http:" && url.protocol !== "https:") {
			throw new Error("unsupported protocol");
		}
	} catch {
		throw new TargetConfigError(
			`Target field "${field}" must be an absolute http(s) URL, received "${value}".`,
		);
	}
}
