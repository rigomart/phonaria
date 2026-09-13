import { test } from "@playwright/test";
import type { TargetCapability } from "./constants";
import { getTarget } from "./target";

export function skipUnlessCapability(capability: TargetCapability): void {
	const target = getTarget();
	const enabled = target.capabilities[capability];
	const reason =
		target.skipReasons[capability] ?? `${capability} is not available on ${target.name}.`;
	test.skip(!enabled, reason);
}

export function skipUnlessPracticeEnabled(): void {
	const target = getTarget();
	test.skip(
		!target.practiceEnabled,
		target.skipReasons.practiceSession ??
			`Practice is disabled on ${target.name}, so enabled-route assertions do not apply.`,
	);
}

export function skipUnlessPracticeDisabled(): void {
	const target = getTarget();
	test.skip(
		target.practiceEnabled,
		`Practice is enabled on ${target.name}, so disabled-route assertions do not apply.`,
	);
}

export function skipUnlessBucketAssets(): void {
	const target = getTarget();
	test.skip(
		!target.bucketAssetsAvailable,
		`Static phoneme assets are not configured for ${target.name}.`,
	);
}
