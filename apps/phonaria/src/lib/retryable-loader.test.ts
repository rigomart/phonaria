import { describe, expect, it } from "vitest";
import { createRetryableLoader } from "./retryable-loader";

describe("createRetryableLoader", () => {
	it("loads once and memoizes the result", async () => {
		let calls = 0;
		const load = createRetryableLoader(async () => {
			calls += 1;
			return "data";
		});

		expect(await load()).toBe("data");
		expect(await load()).toBe("data");
		expect(calls).toBe(1);
	});

	it("shares one in-flight request between concurrent callers", async () => {
		let calls = 0;
		let release: (value: string) => void = () => {};
		const load = createRetryableLoader(() => {
			calls += 1;
			return new Promise<string>((resolve) => {
				release = resolve;
			});
		});

		const first = load();
		const second = load();
		release("data");

		expect(await first).toBe("data");
		expect(await second).toBe("data");
		expect(calls).toBe(1);
	});

	it("rejects with the underlying failure", async () => {
		const load = createRetryableLoader(async () => {
			throw new Error("chunk load failed");
		});

		await expect(load()).rejects.toThrow(/chunk load failed/);
	});

	it("does not cache a rejection, so a later call can succeed", async () => {
		let calls = 0;
		const load = createRetryableLoader(async () => {
			calls += 1;
			if (calls === 1) throw new Error("chunk load failed");
			return "data";
		});

		await expect(load()).rejects.toThrow(/chunk load failed/);
		expect(await load()).toBe("data");
		expect(calls).toBe(2);
	});

	it("turns a synchronous throw into a rejection and stays retryable", async () => {
		let calls = 0;
		const load = createRetryableLoader<string>(() => {
			calls += 1;
			if (calls === 1) throw new Error("sync boom");
			return Promise.resolve("data");
		});

		await expect(load()).rejects.toThrow(/sync boom/);
		expect(await load()).toBe("data");
		expect(calls).toBe(2);
	});

	it("retries again after a repeated failure", async () => {
		let calls = 0;
		const load = createRetryableLoader(async () => {
			calls += 1;
			throw new Error(`attempt ${calls}`);
		});

		await expect(load()).rejects.toThrow(/attempt 1/);
		await expect(load()).rejects.toThrow(/attempt 2/);
		await expect(load()).rejects.toThrow(/attempt 3/);
	});
});
