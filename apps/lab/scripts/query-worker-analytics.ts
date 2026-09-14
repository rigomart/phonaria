#!/usr/bin/env bun
/**
 * Report Worker invocation outcomes and CPU time from the Cloudflare GraphQL
 * Analytics API, so cutover monitoring does not depend on the dashboard.
 */

export const CPU_GUARDRAIL_MS = 15;
export const FREE_PLAN_CPU_MS = 10;

const FAILURE_STATUSES = ["exceededResources", "scriptThrewException", "internalError"];

export type InvocationRow = {
	sum?: { requests?: number; errors?: number; subrequests?: number };
	quantiles?: { cpuTimeP50?: number; cpuTimeP99?: number };
	dimensions?: { status?: string; scriptName?: string };
};

export type AnalyticsSummary = {
	requests: number;
	errors: number;
	byStatus: Record<string, number>;
	cpuTimeP50Ms: number | null;
	cpuTimeP99Ms: number | null;
	failureStatuses: Record<string, number>;
};

const QUERY = `query LabWorkerAnalytics($accountTag: string, $start: string, $end: string, $scriptName: string) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      workersInvocationsAdaptive(limit: 100, filter: { scriptName: $scriptName, datetime_geq: $start, datetime_leq: $end }) {
        sum { requests errors subrequests }
        quantiles { cpuTimeP50 cpuTimeP99 }
        dimensions { status scriptName }
      }
    }
  }
}`;

export function summarize(rows: InvocationRow[]): AnalyticsSummary {
	const byStatus: Record<string, number> = {};
	const failureStatuses: Record<string, number> = {};
	let requests = 0;
	let errors = 0;
	let p50: number | null = null;
	let p99: number | null = null;

	for (const row of rows) {
		const count = row.sum?.requests ?? 0;
		requests += count;
		errors += row.sum?.errors ?? 0;
		const status = row.dimensions?.status ?? "unknown";
		byStatus[status] = (byStatus[status] ?? 0) + count;
		if (FAILURE_STATUSES.includes(status) && count > 0) {
			failureStatuses[status] = (failureStatuses[status] ?? 0) + count;
		}
		const rowP50 = row.quantiles?.cpuTimeP50;
		const rowP99 = row.quantiles?.cpuTimeP99;
		if (typeof rowP50 === "number") p50 = p50 == null ? rowP50 : Math.max(p50, rowP50);
		if (typeof rowP99 === "number") p99 = p99 == null ? rowP99 : Math.max(p99, rowP99);
	}

	return {
		requests,
		errors,
		byStatus,
		cpuTimeP50Ms: p50 == null ? null : p50 / 1000,
		cpuTimeP99Ms: p99 == null ? null : p99 / 1000,
		failureStatuses,
	};
}

export function formatSummary(summary: AnalyticsSummary, scriptName: string): string {
	const lines = [
		`Worker: ${scriptName}`,
		`requests: ${summary.requests}`,
		`errors: ${summary.errors}`,
		`status breakdown: ${JSON.stringify(summary.byStatus)}`,
		`cpuTime p50: ${summary.cpuTimeP50Ms == null ? "n/a" : `${summary.cpuTimeP50Ms.toFixed(2)} ms`}`,
		`cpuTime p99: ${summary.cpuTimeP99Ms == null ? "n/a" : `${summary.cpuTimeP99Ms.toFixed(2)} ms`} (guardrail ${CPU_GUARDRAIL_MS} ms, Workers Free allowance ${FREE_PLAN_CPU_MS} ms)`,
	];
	const failures = Object.entries(summary.failureStatuses);
	lines.push(
		failures.length === 0
			? "no exceededResources, scriptThrewException, or internalError invocations"
			: `FAILURE OUTCOMES: ${JSON.stringify(summary.failureStatuses)}`,
	);
	return lines.join("\n");
}

async function runCli(): Promise<void> {
	const scriptName = process.argv[2] ?? "phonaria-lab";
	const minutes = Number(process.argv[3] ?? 30);
	const accountTag = process.env.CLOUDFLARE_ACCOUNT_ID;
	const token = process.env.CLOUDFLARE_API_TOKEN;
	if (!accountTag || !token) {
		throw new Error("CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required.");
	}

	const end = new Date();
	const start = new Date(end.getTime() - minutes * 60_000);
	const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query: QUERY,
			variables: {
				accountTag,
				scriptName,
				start: start.toISOString(),
				end: end.toISOString(),
			},
		}),
	});

	const body = (await response.json()) as {
		errors?: { message: string }[];
		data?: { viewer?: { accounts?: { workersInvocationsAdaptive?: InvocationRow[] }[] } };
	};
	if (body.errors?.length) {
		throw new Error(`GraphQL errors: ${body.errors.map((e) => e.message).join("; ")}`);
	}

	const rows = body.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive ?? [];
	const summary = summarize(rows);
	console.log(formatSummary(summary, scriptName));

	if (Object.keys(summary.failureStatuses).length > 0) {
		throw new Error("Worker reported failure invocations; see the status breakdown above.");
	}
}

if (import.meta.main) await runCli();
