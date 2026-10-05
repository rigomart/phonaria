import { execFileSync, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { features, getFeature } from "./features";

type Status = "passed" | "failed" | "blocked";
interface Check {
	name: string;
	passed: boolean;
	expected?: unknown;
	actual?: unknown;
	at?: string;
	evidence?: { snapshot: string; screenshot: string };
}
interface DiagnosticsSummary {
	errors: unknown[];
	consoleErrors: unknown[];
	failedRequests: unknown[];
}
interface Message {
	type: string;
	text: string;
}
interface Request {
	method: string;
	url: string;
	status?: number;
	errorText?: string;
	error?: string;
	failureText?: string;
}
interface Diagnostics extends DiagnosticsSummary {
	messages: Message[];
	network: { method: string; url: string; status: number | null; error: string | null }[];
}
interface Run {
	feature: string;
	repo: string;
	baseUrl: string;
	session: string;
	startedAt: string;
	revision: string;
	workingTree: string;
	browserVersion: string;
	checks: Check[];
	traceStarted: boolean;
	finishedAt?: string;
}
const skillDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(skillDir, "../../..");
const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, "utf8"));
const writeJson = (path: string, value: unknown) =>
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

export function commandFailureMessage(error: unknown): string {
	if (error && typeof error === "object" && "stdout" in error) {
		try {
			const result = JSON.parse(String(error.stdout));
			if (typeof result.error === "string") return result.error;
		} catch {
			// A startup failure can also return plain text instead of JSON.
		}
		if ("stderr" in error && String(error.stderr).trim()) return String(error.stderr).trim();
	}
	return errorMessage(error);
}

export function compareObservation(actual: unknown, expected: unknown) {
	return isDeepStrictEqual(actual, expected);
}

export function compareAtTarget(actual: unknown, expected: unknown, origin: string) {
	return compareObservation(actual, { origin, state: expected });
}

export function observationExpression(read: () => unknown): string {
	return `({ origin: location.origin, state: (${read.toString()})() })`;
}

export function assessRun(
	requested: Status,
	checks: Check[],
	required: string[],
	diagnostics: DiagnosticsSummary | null,
): Status {
	if (requested === "failed" || checks.some((check) => !check.passed)) return "failed";
	if (requested === "blocked") return "blocked";
	if (
		!diagnostics ||
		!required.length ||
		required.some((name) => !checks.some((c) => c.name === name && c.passed))
	) {
		return "blocked";
	}
	return [diagnostics.errors, diagnostics.consoleErrors, diagnostics.failedRequests].some(
		(items) => items.length > 0,
	)
		? "failed"
		: "passed";
}

function loadRun(path: string, allowCleanup = false) {
	const dir = resolve(path);
	const run = readJson<Run>(join(dir, "run.json"));
	if (run.repo !== repoDir) throw new Error("This run belongs to another checkout.");
	if (run.finishedAt && !allowCleanup)
		throw new Error(
			"This run is finished. Start a new run to verify again; browser <run> close can retry cleanup.",
		);
	return { dir, run };
}

function browser<T = unknown>(dir: string, run: Run, args: string[]): T {
	const command = [
		"--config",
		join(dir, "browser.json"),
		"--session",
		run.session,
		"--json",
		...args,
	];
	let output: string;
	try {
		output = execFileSync("agent-browser", command, {
			cwd: repoDir,
			env: { ...process.env, AGENT_BROWSER_NAMESPACE: "phonaria-verify" },
			encoding: "utf8",
			maxBuffer: 32 * 1024 * 1024,
			timeout: 60_000,
		});
	} catch (error) {
		const message = commandFailureMessage(error);
		appendFileSync(
			join(dir, "commands.jsonl"),
			`${JSON.stringify({ at: new Date().toISOString(), args, failed: true, error: message })}\n`,
		);
		throw new Error(message);
	}
	const result = JSON.parse(output);
	appendFileSync(
		join(dir, "commands.jsonl"),
		`${JSON.stringify({ at: new Date().toISOString(), args, success: result.success })}\n`,
	);
	if (result.success !== true) throw new Error(result.error || "Browser command failed.");
	return result.data;
}

function diagnostics(dir: string, run: Run): Diagnostics {
	const { messages } = browser<{ messages: Message[] }>(dir, run, ["console"]);
	const { errors } = browser<{ errors: unknown[] }>(dir, run, ["errors"]);
	const { requests } = browser<{ requests: Request[] }>(dir, run, ["network", "requests"]);
	if (![messages, errors, requests].every(Array.isArray))
		throw new Error("Unsupported agent-browser diagnostics format.");
	const network = requests
		.filter((r) => /^https?:/.test(r.url))
		.map((r) => ({
			method: r.method,
			url: r.url,
			status: r.status ?? null,
			error: r.errorText ?? r.error ?? r.failureText ?? null,
		}));
	const result = {
		errors,
		consoleErrors: messages.filter((m) => m.type === "error"),
		failedRequests: network.filter((r) => (r.status !== null && r.status >= 400) || r.error),
		messages,
		network,
	};
	writeJson(join(dir, "diagnostics.json"), result);
	return result;
}

function capture(dir: string, run: Run, name: string) {
	if (!/^[a-z0-9-]+$/.test(name))
		throw new Error("Evidence names must contain lowercase letters, numbers, and hyphens.");
	const snapshot = browser(dir, run, ["snapshot"]);
	const evidence = saveSnapshot(dir, name, snapshot);
	browser(dir, run, ["screenshot", evidence.screenshot, "--full"]);
	diagnostics(dir, run);
	return evidence;
}

export function saveSnapshot(dir: string, name: string, snapshot: unknown) {
	const stem = `${name}-${randomUUID()}`;
	const evidence = {
		snapshot: join(dir, `${stem}.snapshot.json`),
		screenshot: join(dir, `${stem}.png`),
	};
	writeJson(evidence.snapshot, snapshot);
	return evidence;
}

async function serve(dir: string, run: Run) {
	const url = new URL(run.baseUrl);
	if (url.hostname !== "127.0.0.1" || url.protocol !== "http:") {
		throw new Error("serve only starts a local app at http://127.0.0.1:<port>.");
	}
	const port = Number(url.port || 80);
	// Fail before starting Vite if another checkout owns this port.
	await new Promise<void>((done, reject) => {
		const probe = createServer();
		probe.once("error", reject);
		probe.listen(port, "127.0.0.1", () => probe.close(() => done()));
	});
	const child = spawn(
		"bun",
		[
			"run",
			"--cwd",
			"apps/phonaria",
			"dev",
			"--host",
			"127.0.0.1",
			"--port",
			String(port),
			"--strictPort",
		],
		{ cwd: repoDir, stdio: ["ignore", "pipe", "pipe"] },
	);
	for (const stream of [child.stdout, child.stderr]) {
		stream.on("data", (chunk) => {
			appendFileSync(join(dir, "server.log"), chunk);
			process.stdout.write(chunk);
		});
	}
	for (const signal of ["SIGINT", "SIGTERM"] as const)
		process.once(signal, () => child.kill(signal));
	child.once("error", (error) => {
		console.error(error.message);
		process.exitCode = 1;
	});
	child.once("exit", (code, signal) => {
		process.exitCode = signal ? 0 : (code ?? 1);
	});
}

async function main([action, path, ...args]: string[]) {
	if (action === "list") {
		for (const [name, feature] of Object.entries(features))
			console.log(
				`${name}: ${feature.title} (${Object.keys(feature.checkpoints).length} checkpoints)`,
			);
		return;
	}
	if (action === "init") {
		getFeature(path);
		const baseUrl = args[0] || "http://127.0.0.1:3000";
		const url = new URL(baseUrl);
		if (
			!/^https?:$/.test(url.protocol) ||
			url.username ||
			url.password ||
			url.pathname !== "/" ||
			url.search ||
			url.hash
		) {
			throw new Error("Use an HTTP(S) origin without credentials, query, or path.");
		}
		const id = `${Date.now()}-${process.pid}`;
		const dir = join(repoDir, "test-results", "verification", id);
		mkdirSync(dir, { recursive: true });
		writeJson(join(dir, "browser.json"), {});
		writeJson(join(dir, "run.json"), {
			feature: path,
			repo: repoDir,
			baseUrl: url.origin,
			session: `phonaria-${id}`,
			startedAt: new Date().toISOString(),
			revision: execFileSync("git", ["rev-parse", "HEAD"], {
				cwd: repoDir,
				encoding: "utf8",
			}).trim(),
			workingTree: execFileSync("git", ["status", "--short"], { cwd: repoDir, encoding: "utf8" }),
			browserVersion: execFileSync("agent-browser", ["--version"], { encoding: "utf8" }).trim(),
			checks: [],
			traceStarted: false,
		});
		console.log(dir);
		return;
	}
	if (!action || !path || !["serve", "browser", "observe", "capture", "finish"].includes(action)) {
		throw new Error(
			"Usage: bun run verify list | init <feature> [origin] | serve <run> | browser <run> <command...> | observe <run> <checkpoint> | capture <run> <name> | finish <run> passed|failed|blocked <note>",
		);
	}
	const { dir, run } = loadRun(path, action === "browser" && args[0] === "close");
	if (action === "serve") return serve(dir, run);
	if (action === "browser") {
		const result = browser(dir, run, args);
		if (args[0] === "trace" && args[1] === "start") {
			run.traceStarted = true;
			writeJson(join(dir, "run.json"), run);
		}
		console.log(JSON.stringify(result));
	} else if (action === "capture") {
		console.log(JSON.stringify(capture(dir, run, args[0])));
	} else if (action === "observe") {
		const recipe = getFeature(run.feature);
		const name = args[0];
		if (!Object.hasOwn(recipe.checkpoints, name)) throw new Error(`Unknown checkpoint: ${name}`);
		const observation = recipe.checkpoints[name];
		const expression = observationExpression(observation.read);
		const expected = { origin: run.baseUrl, state: observation.expected };
		// Poll observable UI state, never use a fixed sleep or application internals.
		try {
			browser(dir, run, [
				"wait",
				"--fn",
				`JSON.stringify((${expression})) === ${JSON.stringify(JSON.stringify(expected))}`,
			]);
		} catch {
			/* Still save the actual result when the expected state times out. */
		}
		const { result: actual } = browser<{ result: unknown }>(dir, run, ["eval", expression]);
		const check: Check = {
			name,
			passed: compareAtTarget(actual, observation.expected, run.baseUrl),
			expected,
			actual,
			at: new Date().toISOString(),
		};
		run.checks.push(check);
		writeJson(join(dir, "run.json"), run);
		check.evidence = capture(dir, run, name);
		writeJson(join(dir, "run.json"), run);
		console.log(JSON.stringify(check, null, 2));
		if (!check.passed) process.exitCode = 1;
	} else if (action === "finish") {
		const recipe = getFeature(run.feature);
		const requested = args[0] as Status;
		if (!["passed", "failed", "blocked"].includes(requested) || !args[1])
			throw new Error("finish requires passed|failed|blocked and an evidence review note.");
		let collected: Diagnostics | null = null;
		let finalEvidence: { snapshot: string; screenshot: string } | null = null;
		const captureErrors: string[] = [];
		try {
			finalEvidence = capture(dir, run, "final");
			collected = readJson<Diagnostics>(join(dir, "diagnostics.json"));
		} catch (error) {
			captureErrors.push(errorMessage(error));
		}
		let traceSaved = false;
		if (run.traceStarted) {
			try {
				browser(dir, run, ["trace", "stop", join(dir, "trace.json")]);
				traceSaved = true;
			} catch (error) {
				captureErrors.push(errorMessage(error));
			}
		}
		try {
			browser(dir, run, ["close"]);
		} catch (error) {
			captureErrors.push(errorMessage(error));
		}
		let status = assessRun(requested, run.checks, Object.keys(recipe.checkpoints), collected);
		const missingEvidence = run.checks.some(
			(check) =>
				!check.evidence ||
				!existsSync(check.evidence.screenshot) ||
				!existsSync(check.evidence.snapshot),
		);
		if (status === "passed" && (!traceSaved || captureErrors.length || missingEvidence))
			status = "blocked";
		run.finishedAt = new Date().toISOString();
		writeJson(join(dir, "run.json"), run);
		const report = {
			...run,
			status,
			note: args.slice(1).join(" "),
			captureErrors,
			traceSaved,
			finalEvidence,
			coverageLimits: recipe.coverageLimits,
		};
		writeJson(join(dir, "report.json"), report);
		writeFileSync(
			join(dir, "report.md"),
			`# ${recipe.title} verification: ${status}\n\nFeature: ${run.feature}\n\nTarget: ${run.baseUrl}\n\nRevision: ${run.revision} (working tree recorded in run.json)\n\n${report.note}\n\n${run.checks.map((c) => `- ${c.name}: ${c.passed ? "passed" : "failed"}`).join("\n")}\n\nBrowser errors: ${collected?.errors.length ?? "unavailable"}; console errors: ${collected?.consoleErrors.length ?? "unavailable"}; failed requests: ${collected?.failedRequests.length ?? "unavailable"}.\n\nCapture issues: ${captureErrors.join("; ") || "none"}.\n\nCoverage limits: ${recipe.coverageLimits.join("; ")}.\n\nEvidence: checkpoint PNGs and snapshot JSON, diagnostics.json, commands.jsonl, trace.json, server.log when serve was used.\n`,
		);
		console.log(`${status}: ${join(dir, "report.md")}`);
		if (status !== "passed") process.exitCode = 1;
	}
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	main(process.argv.slice(2)).catch((error: unknown) => {
		console.error(errorMessage(error));
		process.exitCode = 1;
	});
}
