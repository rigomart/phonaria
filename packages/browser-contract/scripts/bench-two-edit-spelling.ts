#!/usr/bin/env bun
/** Reproducible local CPU probe for issue #266. */
import { chromium } from "@playwright/test";
import { loadTier2 } from "../../../apps/phonaria/src/lib/phoneme-lookup/shared";
import { planSpellingContext } from "../../../apps/phonaria/src/lib/transcription/spelling-context-service";
import {
	remainingDistance,
	spellingEditDistanceWithinTwo,
} from "../../../apps/phonaria/src/lib/transcription/spelling-edit-distance";
import {
	createTwoEditCandidateIndex,
	findTwoEditCandidates,
} from "../../../apps/phonaria/src/lib/transcription/two-edit-candidates";

const misses = [
	"definatly",
	"neccesary",
	"acomodate",
	"tommorow",
	"exersize",
	"adres",
	"reciv",
	"langwidge",
];
const sentence =
	`${misses.join(" ")} ${"practice pronunciation with these spelling examples ".repeat(4)}`.slice(
		0,
		200,
	);
if (sentence.length !== 200) throw new Error("Benchmark sentence must be 200 characters");

function summary(samples: number[]) {
	const sorted = [...samples].sort((a, b) => a - b);
	return {
		median: sorted[Math.floor(sorted.length * 0.5)]?.toFixed(2),
		p95: sorted[Math.floor(sorted.length * 0.95)]?.toFixed(2),
		max: sorted.at(-1)?.toFixed(2),
	};
}

const rankedWords = Object.keys((await loadTier2()).words);
const candidateIndex = createTwoEditCandidateIndex(rankedWords);
const scan = () => {
	for (const token of misses) findTwoEditCandidates(token, candidateIndex);
};
for (let index = 0; index < 10; index += 1) scan();
const bunSamples: number[] = [];
for (let index = 0; index < 100; index += 1) {
	const start = performance.now();
	scan();
	bunSamples.push(performance.now() - start);
}
console.log(JSON.stringify({ sentence, bun: summary(bunSamples) }));

const browser = await chromium.launch({ headless: true });
try {
	const page = await browser.newPage();
	await page.goto("about:blank");
	const cdp = await page.context().newCDPSession(page);
	await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
	await page.evaluate(
		({ indexEntries, tokens, remainingSource, distanceSource, candidateSource }) => {
			const remaining = Function(`return (${remainingSource})`)() as typeof remainingDistance;
			const distance = Function(
				"remainingDistance",
				`return (${distanceSource})`,
			)(remaining) as typeof spellingEditDistanceWithinTwo;
			const find = Function(
				"spellingEditDistanceWithinTwo",
				`return (${candidateSource})`,
			)(distance) as typeof findTwoEditCandidates;
			Object.assign(window, {
				benchmarkIndex: new Map(indexEntries),
				benchmarkTokens: tokens,
				benchmarkFind: find,
				longTasks: [],
			});
			new PerformanceObserver((list) => {
				(window as unknown as { longTasks: number[] }).longTasks.push(
					...list.getEntries().map((entry) => entry.duration),
				);
			}).observe({ entryTypes: ["longtask"] });
		},
		{
			indexEntries: [...candidateIndex],
			tokens: misses,
			remainingSource: remainingDistance.toString(),
			distanceSource: spellingEditDistanceWithinTwo.toString(),
			candidateSource: findTwoEditCandidates.toString(),
		},
	);
	const browserScan = () =>
		page.evaluate(() => {
			const { benchmarkIndex, benchmarkTokens, benchmarkFind } = window as unknown as {
				benchmarkIndex: typeof candidateIndex;
				benchmarkTokens: string[];
				benchmarkFind: typeof findTwoEditCandidates;
			};
			const start = performance.now();
			for (const token of benchmarkTokens) benchmarkFind(token, benchmarkIndex);
			return performance.now() - start;
		});
	for (let index = 0; index < 10; index += 1) await browserScan();
	const browserSamples: number[] = [];
	for (let index = 0; index < 100; index += 1) browserSamples.push(await browserScan());
	const longTasks = await page.evaluate(
		() => (window as unknown as { longTasks: number[] }).longTasks,
	);
	console.log(
		JSON.stringify({ chromium4x: summary(browserSamples), longTasksOver50ms: longTasks.length }),
	);
} finally {
	await browser.close();
}

const workerText = misses.join(" ");
const workerMisses = misses.map((token, tokenIndex) => ({
	tokenIndex,
	candidates: Array.from(
		{ length: 100 },
		(_, index) =>
			`${token.slice(0, -2)}${String.fromCharCode(97 + Math.floor(index / 26))}${String.fromCharCode(97 + (index % 26))}`,
	),
}));
for (let index = 0; index < 20; index += 1)
	planSpellingContext({ text: workerText, misses: workerMisses });
const workerSamples: number[] = [];
for (let index = 0; index < 200; index += 1) {
	const start = performance.now();
	planSpellingContext({ text: workerText, misses: workerMisses });
	workerSamples.push(performance.now() - start);
}
console.log(JSON.stringify({ workerValidation: summary(workerSamples) }));
