import { test as base } from "@playwright/test";
import type { ContractTarget } from "./constants";
import { getTarget } from "./target";

export const test = base.extend<{ target: ContractTarget }>({
	target: async (
		// oxlint-disable-next-line no-empty-pattern -- Playwright requires object destructuring here.
		{},
		use,
	) => {
		await use(getTarget());
	},
});

export { expect } from "@playwright/test";
