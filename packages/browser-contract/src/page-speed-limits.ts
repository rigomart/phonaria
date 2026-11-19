import type { PAGE_SPEED_PAGES } from "./page-speed";

/**
 * Each limit applies to the median of a page's runs, never to a single run.
 * LCP and TBT are milliseconds, CLS has no unit, scores are 0–100.
 */
export interface PageSpeedLimits {
	maxLcpMs: number;
	maxCls: number;
	maxTbtMs: number;
	minSeo: number;
	minAccessibility: number;
}

/** A page with fewer good runs than this fails, since its medians can't be trusted. */
export const PAGE_SPEED_MIN_RUNS = 2;

/**
 * Set in #464 from the `medians.json` of the 23 successful Preview runs from
 * 2026-11-07 to 2026-11-18 whose head included #477 (13 PR branches).
 * Highest median seen on any page:
 * - LCP 0.97 s (0.91–0.97 s on every page; the sound page only since #487 on
 *   2026-11-10, 1.9–3.4 s before it)
 * - CLS 0.009 (`/ipa-chart/vowels`)
 * - TBT 181 ms on `/`, 63 ms or less on the others; single `/` runs reach
 *   about 2,000 ms, which is why limits apply to the median
 * - SEO 100 on every page in every run
 * - Accessibility 96 on `/` and the minimal-pair page, 100 on the others,
 *   in every run
 * Performance has no limit: it's a weighted mix of the metrics above.
 */
const SHARED = { maxLcpMs: 1500, maxCls: 0.05, maxTbtMs: 300, minSeo: 100 } as const;

export const PAGE_SPEED_LIMITS: Record<(typeof PAGE_SPEED_PAGES)[number], PageSpeedLimits> = {
	"/": { ...SHARED, minAccessibility: 96 },
	"/sounds/th-thin": { ...SHARED, minAccessibility: 100 },
	"/minimal-pairs/p-b?word=pet": { ...SHARED, minAccessibility: 96 },
	"/ipa-chart/vowels": { ...SHARED, minAccessibility: 100 },
};
