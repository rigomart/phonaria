import { describe, expect, it } from "vitest";
import { lookupDefinitionDeduped, resetDefinitionInflightForTests } from "./inflight";

describe("lookupDefinitionDeduped", () => {
	it("shares one in-flight request for the same normalized word", async () => {
		resetDefinitionInflightForTests();
		let calls = 0;
		let release: (value: { found: false }) => void = () => {};
		const lookup = async () => {
			calls += 1;
			return new Promise<{ found: false }>((resolve) => {
				release = resolve;
			});
		};

		const first = lookupDefinitionDeduped("Hello", lookup);
		const second = lookupDefinitionDeduped("hello", lookup);
		release({ found: false });

		expect(await first).toEqual({ found: false });
		expect(await second).toEqual({ found: false });
		expect(calls).toBe(1);
	});

	it("does not cache a completed lookup", async () => {
		resetDefinitionInflightForTests();
		let calls = 0;
		const lookup = async () => {
			calls += 1;
			return { found: false } as const;
		};

		await lookupDefinitionDeduped("hello", lookup);
		await lookupDefinitionDeduped("hello", lookup);

		expect(calls).toBe(2);
	});

	it("allows a later call after a rejection", async () => {
		resetDefinitionInflightForTests();
		let calls = 0;
		const lookup = async () => {
			calls += 1;
			if (calls === 1) throw new Error("upstream");
			return { found: false } as const;
		};

		await expect(lookupDefinitionDeduped("hello", lookup)).rejects.toThrow(/upstream/);
		await expect(lookupDefinitionDeduped("hello", lookup)).resolves.toEqual({ found: false });
		expect(calls).toBe(2);
	});
});
