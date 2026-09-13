import { test as base } from "@playwright/test";
import type { LabContractTarget } from "./constants";
import { getTarget } from "./target";

export const test = base.extend<{ target: LabContractTarget }>({
	target: async (
		// biome-ignore lint/correctness/noEmptyPattern: Playwright requires object destructuring here.
		{},
		use,
	) => {
		await use(getTarget());
	},
});

export { expect } from "@playwright/test";
