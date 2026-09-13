import { test as base } from "@playwright/test";
import type { LabContractTarget } from "./constants";
import { getTarget } from "./target";

export const test = base.extend<{ target: LabContractTarget }>({
	// Playwright fixture callbacks always receive the fixture object as the first argument.
	target: async (_fixtures, use) => {
		await use(getTarget());
	},
});

export { expect } from "@playwright/test";
