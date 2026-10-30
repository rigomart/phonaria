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

export function skipUnlessLanguageHistoryEnabled(): void {
	const target = getTarget();
	test.skip(
		!target.languageHistoryEnabled,
		`History is disabled on ${target.name}, so enabled-route assertions do not apply.`,
	);
}

export function skipUnlessLanguageHistoryDisabled(): void {
	const target = getTarget();
	test.skip(
		target.languageHistoryEnabled,
		`History is enabled on ${target.name}, so disabled-route assertions do not apply.`,
	);
}

export function skipUnlessSpeechEnabled(): void {
	const target = getTarget();
	test.skip(
		!target.speechEnabled,
		`Speaking practice is off on ${target.name}, so enabled-practice assertions do not apply.`,
	);
}

export function skipUnlessSpeechDisabled(): void {
	const target = getTarget();
	test.skip(
		target.speechEnabled,
		`Speaking practice is on on ${target.name}, so practice-off assertions do not apply.`,
	);
}

export function skipUnlessBucketAssets(): void {
	const target = getTarget();
	test.skip(
		!target.bucketAssetsAvailable,
		`Static phoneme assets are not configured for ${target.name}.`,
	);
}
