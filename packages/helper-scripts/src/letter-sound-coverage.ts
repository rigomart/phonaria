/**
 * Measures how much of the bundled top-10k word list the English letter-to-sound
 * matcher can split (#283), and groups the failures by the letters and sounds
 * left over where matching gave up, so table gaps are easy to spot.
 *
 * Usage:
 *   bun run --cwd packages/helper-scripts letter-sound-coverage
 *
 * Writes output/letter-sound-coverage.md (git-ignored).
 */
import * as fs from "node:fs";
import * as path from "node:path";
import {
	findLetterSoundGap,
	getIpaForPhonemeId,
	matchLettersToSounds,
	toBasePhonemeIds,
} from "@phonaria/phonetics-data";
import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import { ensureDirectoryForFile } from "./utils/fs";

const TOP_TIER = 1000;
const EXAMPLES_PER_GAP = 5;
const outputPath = path.resolve(__dirname, "../output/letter-sound-coverage.md");

interface GapGroup {
	key: string;
	words: string[];
}

function percent(count: number, total: number): string {
	return `${((100 * count) / total).toFixed(1)}%`;
}

/** Letters and the first sound left over, e.g. `ure → /j/`. */
function gapKey(word: string, variant: string): string {
	const gap = findLetterSoundGap(word, toBasePhonemeIds(variant));
	const letters = gap?.letters.slice(0, 3) || "(no letters)";
	const sound = gap?.phonemes[0];
	return `${letters} → ${sound ? `/${getIpaForPhonemeId(sound)}/` : "(no sounds)"}`;
}

function main(): void {
	const entries = Object.entries(EnglishCuratedTop10k.words);
	let firstSplit = 0;
	let anySplit = 0;
	let topTierSplit = 0;
	const gaps = new Map<string, GapGroup>();

	entries.forEach(([word, variants], rank) => {
		const splits = variants.map((variant) => matchLettersToSounds(word, toBasePhonemeIds(variant)));
		if (splits[0]) {
			firstSplit++;
			if (rank < TOP_TIER) topTierSplit++;
		} else {
			const key = gapKey(word, variants[0]);
			const group = gaps.get(key) ?? { key, words: [] };
			group.words.push(`${word} /${variants[0]}/`);
			gaps.set(key, group);
		}
		if (splits.some(Boolean)) anySplit++;
	});

	const total = entries.length;
	const topTierTotal = Math.min(TOP_TIER, total);
	const sortedGaps = [...gaps.values()].sort(
		(a, b) => b.words.length - a.words.length || a.key.localeCompare(b.key),
	);
	const summary = [
		`First pronunciation split: ${firstSplit}/${total} (${percent(firstSplit, total)})`,
		`Top ${TOP_TIER} words, first pronunciation: ${topTierSplit}/${topTierTotal} (${percent(topTierSplit, topTierTotal)})`,
		`Any pronunciation split: ${anySplit}/${total} (${percent(anySplit, total)})`,
	];

	const lines = [
		"# Letter-to-sound matcher coverage",
		"",
		`Source: @phonaria/phonetics-data curated top-10k (v${EnglishCuratedTop10k.meta.version}, ${total} words), in frequency order.`,
		`Generated: ${new Date().toISOString()}`,
		"",
		...summary.map((line) => `- ${line}`),
		"",
		"## Failures by what was left over",
		"",
		"Each row is the first three letters and the first sound left after the furthest point the matcher reached, for the first pronunciation.",
		"",
		"| Words | Left over | Examples |",
		"| ---: | --- | --- |",
		...sortedGaps.map(
			(group) =>
				`| ${group.words.length} | ${group.key} | ${group.words.slice(0, EXAMPLES_PER_GAP).join(", ")} |`,
		),
		"",
	];

	ensureDirectoryForFile(outputPath);
	fs.writeFileSync(outputPath, lines.join("\n"));

	for (const line of summary) console.log(line);
	console.log("\nMost common failures:");
	for (const group of sortedGaps.slice(0, 10)) {
		console.log(
			`${String(group.words.length).padStart(4)}  ${group.key.padEnd(20)} ${group.words.slice(0, 3).join(", ")}`,
		);
	}
	console.log(`\nWrote ${path.relative(process.cwd(), outputPath)}`);
}

main();
