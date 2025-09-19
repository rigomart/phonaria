import { z } from "zod";
import { ApiError, type ApiErrorCode } from "./api-error";

export interface ApiClientConfig {
	baseUrl: string;
	defaultHeaders?: Record<string, string>;
	timeout?: number;
}

export interface ApiRequestOptions {
	method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	headers?: Record<string, string>;
	timeout?: number;
	signal?: AbortSignal;
}

/**
 * Base API client class with Zod validation
 */
export class ApiClient {
	private baseUrl: string;
	private defaultHeaders: Record<string, string>;
	private timeout: number;

	constructor(config: ApiClientConfig) {
		this.baseUrl = config.baseUrl.replace(/\/$/, ""); // Remove trailing slash
		this.defaultHeaders = {
			"Content-Type": "application/json",
			...config.defaultHeaders,
		};
		this.timeout = config.timeout || 10000; // 10 seconds default
	}

	/**
	 * Make a typed API request with Zod validation
	 */
	async request<TRequest, TResponse>(
		endpoint: string,
		requestSchema: z.ZodSchema<TRequest>,
		responseSchema: z.ZodSchema<TResponse>,
		data?: TRequest,
		options: ApiRequestOptions = {},
	): Promise<TResponse> {
		const url = `${this.baseUrl}${endpoint}`;
		const method = options.method || (data ? "POST" : "GET");

		// Validate request data if provided
		let validatedData: TRequest | undefined;
		if (data !== undefined) {
			try {
				validatedData = requestSchema.parse(data);
			} catch (error) {
				throw new ApiError(
					"Invalid request data",
					400,
					"validation_error",
					error instanceof z.ZodError ? error.issues : error,
				);
			}
		}

		// Setup request
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.timeout);

		if (options.signal) {
			if (options.signal.aborted) {
				controller.abort();
			} else {
				options.signal.addEventListener("abort", () => controller.abort(), { once: true });
			}
		}

		const headers = {
			...this.defaultHeaders,
			...options.headers,
		};

		const requestConfig: RequestInit = {
			method,
			headers,
			signal: controller.signal,
		};

		if (validatedData && method !== "GET") {
			requestConfig.body = JSON.stringify(validatedData);
		}

		try {
			// Make the request
			const response = await fetch(url, requestConfig);
			clearTimeout(timeoutId);

			// Handle HTTP errors
			if (!response.ok) {
				let errorMessage = `HTTP ${response.status}`;
				let errorCode: ApiErrorCode = "http_error";
				let errorDetails: unknown;

				try {
					const errorData = (await response.json()) as unknown;
					if (typeof errorData === "object" && errorData !== null) {
						const dataObj = errorData as Record<string, unknown>;
						const message = typeof dataObj.message === "string" ? dataObj.message : undefined;
						const code = typeof dataObj.error === "string" ? dataObj.error : undefined;
						if (message) {
							errorMessage = message;
						}
						if (code) {
							switch (code) {
								case "http_error":
								case "validation_error":
								case "parse_error":
								case "timeout_error":
								case "network_error":
								case "rate_limited":
									errorCode = code;
									break;
								default:
									break;
							}
						}
						errorDetails = errorData;
					}
				} catch {
					// Failed to parse error response, use generic message
					errorMessage = response.statusText || errorMessage;
				}

				// Extract rate limit headers if present
				const retryAfterHeader = response.headers.get("Retry-After");
				const limitHeader = response.headers.get("X-RateLimit-Limit");
				const remainingHeader = response.headers.get("X-RateLimit-Remaining");
				const resetHeader = response.headers.get("X-RateLimit-Reset");

				const parseNumber = (v: string | null): number | undefined => {
					if (v == null) return undefined;
					const n = Number(v);
					return Number.isFinite(n) ? n : undefined;
				};

				let retryAfterSeconds: number | undefined;
				if (retryAfterHeader) {
					const asNumber = parseNumber(retryAfterHeader);
					if (asNumber !== undefined) {
						retryAfterSeconds = Math.max(0, Math.ceil(asNumber));
					} else {
						const asDate = Date.parse(retryAfterHeader);
						if (!Number.isNaN(asDate)) {
							retryAfterSeconds = Math.max(0, Math.ceil((asDate - Date.now()) / 1000));
						}
					}
				}

				const limit = parseNumber(limitHeader);
				const remaining = parseNumber(remainingHeader);
				const resetUnixSeconds = parseNumber(resetHeader);

				const apiError = new ApiError(errorMessage, response.status, errorCode, errorDetails);
				apiError.rateLimit = {
					retryAfterSeconds,
					limit,
					remaining,
					resetUnixSeconds,
				};

				throw apiError;
			}

			// Parse and validate response
			let responseData: unknown;
			try {
				responseData = await response.json();
			} catch (error) {
				throw new ApiError("Invalid JSON response", response.status, "parse_error", error);
			}

			// Validate response with Zod schema
			try {
				return responseSchema.parse(responseData);
			} catch (error) {
				throw new ApiError(
					"Invalid response format",
					response.status,
					"validation_error",
					error instanceof z.ZodError ? error.issues : error,
				);
			}
		} catch (error) {
			clearTimeout(timeoutId);

			// Handle network errors
			if (error instanceof ApiError) {
				throw error;
			}

			if (error instanceof DOMException && error.name === "AbortError") {
				throw new ApiError("Request timeout", 0, "timeout_error");
			}

			throw new ApiError(
				"Network error",
				0,
				"network_error",
				error instanceof Error ? error.message : error,
			);
		}
	}

	/**
	 * Convenience method for GET requests
	 */
	async get<TResponse>(
		endpoint: string,
		responseSchema: z.ZodSchema<TResponse>,
		options?: ApiRequestOptions,
	): Promise<TResponse> {
		return this.request(endpoint, z.any(), responseSchema, undefined, {
			...options,
			method: "GET",
		});
	}

	/**
	 * Convenience method for POST requests
	 */
	async post<TRequest, TResponse>(
		endpoint: string,
		requestSchema: z.ZodSchema<TRequest>,
		responseSchema: z.ZodSchema<TResponse>,
		data: TRequest,
		options?: ApiRequestOptions,
	): Promise<TResponse> {
		return this.request(endpoint, requestSchema, responseSchema, data, {
			...options,
			method: "POST",
		});
	}

	/**
	 * Update base URL
	 */
	setBaseUrl(baseUrl: string): void {
		this.baseUrl = baseUrl.replace(/\/$/, "");
	}

	/**
	 * Update default headers
	 */
	setDefaultHeaders(headers: Record<string, string>): void {
		this.defaultHeaders = { ...this.defaultHeaders, ...headers };
	}
}

/**
 * Create a default API client instance
 */
export const createApiClient = (config: ApiClientConfig): ApiClient => {
	return new ApiClient(config);
};
