import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export async function expectNoAxeViolations(page: Page): Promise<void> {
	const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
	const summary = results.violations
		.map((violation) => {
			const nodes = violation.nodes
				.map((node) => `    ${node.target.join(" ")}: ${node.failureSummary}`)
				.join("\n");
			return `${violation.id} (${violation.impact}): ${violation.help}\n${nodes}`;
		})
		.join("\n\n");

	expect(results.violations, summary).toEqual([]);
}
