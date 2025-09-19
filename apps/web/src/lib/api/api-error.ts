export type ApiErrorCode =
	| "http_error"
	| "validation_error"
	| "parse_error"
	| "timeout_error"
	| "network_error"
	| "rate_limited";

export class ApiError extends Error {
	public status: number;
	public code: ApiErrorCode;
	public details?: unknown;
	public rateLimit?: {
		retryAfterSeconds?: number;
		limit?: number;
		remaining?: number;
		resetUnixSeconds?: number;
	};

	constructor(message: string, status: number, code: ApiErrorCode, details?: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
		this.details = details;
	}
}
