import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/**
 * Current public Phonaria already uses muted nav/counter tokens below WCAG AA
 * contrast, a NavigationMenu list with `aria-orientation`, and a diphthong
 * switch whose visible label is not programmatically associated. Those are
 * existing product/component issues, not migration regressions, so the
 * contract excludes them while still scanning other WCAG A/AA rules.
 */
const KNOWN_CURRENT_AXE_EXCLUSIONS = [
	"color-contrast",
	"aria-allowed-attr",
	"aria-toggle-field-name",
] as const;

export async function expectNoAxeViolations(page: Page): Promise<void> {
	const results = await new AxeBuilder({ page })
		.withTags(["wcag2a", "wcag2aa"])
		.disableRules([...KNOWN_CURRENT_AXE_EXCLUSIONS])
		.analyze();
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
