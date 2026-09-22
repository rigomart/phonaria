export type WorkerLogLevel = "info" | "warn" | "error";

export type WorkerLogEvent = {
	level: WorkerLogLevel;
	message: string;
	details?: Record<string, unknown>;
};

const SENSITIVE_KEY = /(token|secret|password|authorization|cookie|database|turso|url)/i;

/**
 * Structured, sanitized Worker logs. Never log credentials, database URLs,
 * raw learner input, or other sensitive request data.
 */
export function logWorkerEvent(event: WorkerLogEvent): void {
	const payload = {
		source: "phonaria",
		level: event.level,
		message: event.message,
		details: event.details ? sanitizeDetails(event.details) : undefined,
	};
	const line = JSON.stringify(payload);
	if (event.level === "error") {
		console.error(line);
		return;
	}
	if (event.level === "warn") {
		console.warn(line);
		return;
	}
	console.info(line);
}

function sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
	const sanitized: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(details)) {
		if (SENSITIVE_KEY.test(key)) {
			sanitized[key] = "[redacted]";
			continue;
		}
		if (typeof value === "string" && value.length > 120) {
			sanitized[key] = "[omitted]";
			continue;
		}
		sanitized[key] = value;
	}
	return sanitized;
}
