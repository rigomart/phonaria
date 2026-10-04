/**
 * Proposes minimal-pair candidates per sound contrast from the bundled top-10k
 * word list, for a human to review and hand-pick into the contrast catalog
 * (#168). The script only proposes: it never writes to the catalog.
 *
 * Usage:
 *   bun run --cwd packages/helper-scripts find-minimal-pairs
 *   bun run --cwd packages/helper-scripts find-minimal-pairs --contrast AE-AH --contrast AE-A --limit 20
 *
 * Writes output/minimal-pair-candidates.{json,md} (git-ignored).
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { parseArgs } from "node:util";
import {
	EnglishPhonemeContrasts,
	findSubstitution,
	getIpaForPhonemeId,
	getSinglePronunciation,
	isEnglishPhonemeSymbolId,
	PhonemeIpaMap,
	type PhonemeSymbolId,
	parsePhonemePronunciation,
	phonemeVariantToIpa,
} from "@phonaria/phonetics-data";
import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import { ensureDirectoryForFile } from "./utils/fs";

const DEFAULT_LIMIT = 40;
const outputDir = path.resolve(__dirname, "../output");
const jsonOutputPath = path.join(outputDir, "minimal-pair-candidates.json");
const markdownOutputPath = path.join(outputDir, "minimal-pair-candidates.md");

/**
 * Editorial hints for the reviewer, not a filter: flagged words still appear,
 * marked, so the reviewer decides. Deliberately short (a few profanities,
 * interjections, and first names that are rarely anything else); the human
 * review is the real filter and will catch plenty this list misses.
 */
const EditorialFlags = {
	profanity: new Set([
		"ass",
		"asses",
		"asshole",
		"bastard",
		"bitch",
		"bitches",
		"bullshit",
		"cock",
		"crap",
		"cunt",
		"damn",
		"dick",
		"fuck",
		"fucked",
		"fuckin",
		"fucking",
		"fucks",
		"piss",
		"pussy",
		"shit",
		"shitty",
		"tits",
		"whore",
	]),
	interjection: new Set([
		"ahh",
		"aww",
		"duh",
		"hey",
		"hmm",
		"huh",
		"nah",
		"ooh",
		"ugh",
		"whoa",
		"wow",
		"yay",
		"yeah",
		"yep",
	]),
	name: new Set([
		"adam",
		"alex",
		"amy",
		"andy",
		"ann",
		"anne",
		"ben",
		"beth",
		"brian",
		"carl",
		"charlie",
		"chris",
		"dan",
		"dave",
		"david",
		"eric",
		"fred",
		"george",
		"greg",
		"harry",
		"henry",
		"jake",
		"james",
		"jane",
		"jason",
		"jeff",
		"jim",
		"joe",
		"john",
		"josh",
		"kate",
		"kevin",
		"lisa",
		"luke",
		"mary",
		"matt",
		"michael",
		"mike",
		"neil",
		"paul",
		"pete",
		"peter",
		"ryan",
		"sam",
		"sarah",
		"seth",
		"steve",
		"ted",
		"tim",
		"tom",
		"tony",
	]),
} as const satisfies Record<string, ReadonlySet<string>>;

type Position = "initial" | "medial" | "final";

/** Words sharing one stress-stripped pronunciation, led by the most frequent. */
interface HomophoneGroup {
	word: string;
	/** 1-based frequency rank of `word` in the top-10k list. */
	rank: number;
	ids: readonly PhonemeSymbolId[];
	/** Stress pattern of `word`'s first CMU variant, e.g. "1 0". */
	stress: string;
	ipa: string;
	homophones: string[];
}

interface Contrast {
	a: PhonemeSymbolId;
	b: PhonemeSymbolId;
	/** Pairs already in the catalog, keyed "wordA|wordB" in a→b orientation. */
	catalogPairs: ReadonlySet<string>;
}

interface Candidate {
	words: [string, string];
	ipa: [string, string];
	position: Position;
	ranks: [number, number];
	homophones: [string[], string[]];
	flags: string[];
	/** Already in the contrast catalog, so the reviewer can skip it. */
	inCatalog: boolean;
	/** max(rankA, rankB): lower means both words are common. */
	score: number;
}

interface ContrastResult {
	id: string;
	phonemeIds: [PhonemeSymbolId, PhonemeSymbolId];
	ipa: [string, string];
	totalCandidates: number;
	positions: Record<Position, number>;
	candidates: Candidate[];
}

/**
 * The regex and length rules of the Practice word-suitability filter in
 * apps/phonaria/src/lib/practice/word-pool.ts (`isSuitableWord`): alphabetic
 * only, at least 3 letters. Its editorial blocklist is not mirrored; the
 * reviewer drops such words. Not imported, since scripts do not depend on the app.
 */
function isSuitableWord(word: string): boolean {
	return /^[a-z]+$/.test(word) && word.length >= 3;
}

function buildHomophoneGroups(words: Record<string, string[]>): HomophoneGroup[] {
	const groups = new Map<string, HomophoneGroup>();
	let rank = 0;
	for (const [word, variants] of Object.entries(words)) {
		rank++;
		if (!isSuitableWord(word)) continue;
		for (const variant of variants) parsePhonemePronunciation(variant);
		const ids = getSinglePronunciation(variants);
		if (!ids) continue;
		const key = ids.join(" ");
		const existing = groups.get(key);
		if (existing) {
			existing.homophones.push(word);
			continue;
		}
		groups.set(key, {
			word,
			rank,
			ids,
			stress: variants[0]
				.replace(/[^012 ]/g, "")
				.replace(/\s+/g, " ")
				.trim(),
			ipa: phonemeVariantToIpa(variants[0]),
			homophones: [],
		});
	}
	return [...groups.values()];
}

function wildcardKey(ids: readonly PhonemeSymbolId[], index: number): string {
	return [...ids.slice(0, index), "_", ...ids.slice(index + 1)].join(" ");
}

/** Groups indexed by each pronunciation with one position blanked out. */
function buildWildcardIndex(groups: readonly HomophoneGroup[]): Map<string, HomophoneGroup[]> {
	const index = new Map<string, HomophoneGroup[]>();
	for (const group of groups) {
		for (let position = 0; position < group.ids.length; position++) {
			const key = wildcardKey(group.ids, position);
			const bucket = index.get(key);
			if (bucket) bucket.push(group);
			else index.set(key, [group]);
		}
	}
	return index;
}

function positionOf(index: number, length: number): Position {
	if (index === 0) return "initial";
	if (index === length - 1) return "final";
	return "medial";
}

function flagsFor(words: readonly string[]): string[] {
	const flags: string[] = [];
	for (const word of words) {
		for (const [flag, list] of Object.entries(EditorialFlags)) {
			if (list.has(word)) flags.push(`${word}: ${flag}`);
		}
	}
	return flags;
}

function findCandidates(
	contrast: Contrast,
	groups: readonly HomophoneGroup[],
	index: Map<string, HomophoneGroup[]>,
): Candidate[] {
	const candidates: Candidate[] = [];
	for (const groupA of groups) {
		groupA.ids.forEach((id, position) => {
			if (id !== contrast.a) return;
			for (const groupB of index.get(wildcardKey(groupA.ids, position)) ?? []) {
				const substitution = findSubstitution(groupA.ids, groupB.ids);
				if (substitution?.to !== contrast.b) continue;
				// Show the catalog's own spellings when a homophone of the lead word is listed.
				const catalogWords = [groupA.word, ...groupA.homophones]
					.flatMap((a) => [groupB.word, ...groupB.homophones].map((b) => [a, b] as const))
					.find(([a, b]) => contrast.catalogPairs.has(`${a}|${b}`));
				const flags = flagsFor([groupA.word, groupB.word]);
				// The catalog test rejects pairs stressed on different syllables.
				if (groupA.stress !== groupB.stress) flags.push("stress differs");
				candidates.push({
					words: catalogWords ? [...catalogWords] : [groupA.word, groupB.word],
					ipa: [groupA.ipa, groupB.ipa],
					position: positionOf(substitution.index, groupA.ids.length),
					ranks: [groupA.rank, groupB.rank],
					homophones: [groupA.homophones, groupB.homophones],
					flags,
					inCatalog: catalogWords !== undefined,
					score: Math.max(groupA.rank, groupB.rank),
				});
			}
		});
	}
	return candidates.sort(
		(x, y) =>
			x.score - y.score ||
			Math.min(...x.ranks) - Math.min(...y.ranks) ||
			x.words[0].localeCompare(y.words[0]),
	);
}

function contrastId({ a, b }: Contrast): string {
	return `${a}-${b}`.toLowerCase();
}

function catalogPairsFor(a: PhonemeSymbolId, b: PhonemeSymbolId): ReadonlySet<string> {
	const keys = new Set<string>();
	for (const contrast of EnglishPhonemeContrasts) {
		const [left, right] = contrast.phonemeIds;
		const flipped = left === b && right === a;
		if (!flipped && !(left === a && right === b)) continue;
		for (const { words } of contrast.minimalPairs) {
			keys.add(flipped ? `${words[1]}|${words[0]}` : `${words[0]}|${words[1]}`);
		}
	}
	return keys;
}

/** Every catalog contrast, in catalog order and orientation. */
function catalogContrasts(): Contrast[] {
	return EnglishPhonemeContrasts.map(({ phonemeIds: [a, b] }) => ({
		a,
		b,
		catalogPairs: catalogPairsFor(a, b),
	}));
}

function isEnglishPhonemeId(value: string | undefined): value is PhonemeSymbolId {
	return (
		value !== undefined &&
		value in PhonemeIpaMap &&
		isEnglishPhonemeSymbolId(value as PhonemeSymbolId)
	);
}

function parseContrast(value: string): Contrast {
	const ids = value.toUpperCase().split("-");
	const [a, b] = ids;
	if (ids.length !== 2 || !isEnglishPhonemeId(a) || !isEnglishPhonemeId(b) || a === b) {
		throw new Error(
			`Invalid --contrast "${value}": expected two distinct English phoneme IDs, e.g. I-IX`,
		);
	}
	return { a, b, catalogPairs: catalogPairsFor(a, b) };
}

function parseOptions(): { contrasts: Contrast[]; limit: number } {
	const { values } = parseArgs({
		options: {
			contrast: { type: "string", multiple: true },
			limit: { type: "string", default: String(DEFAULT_LIMIT) },
		},
	});
	const limit = Number(values.limit);
	if (!Number.isInteger(limit) || limit < 1) {
		throw new Error(`Invalid --limit "${values.limit}": expected a positive integer`);
	}
	const contrasts = values.contrast?.map(parseContrast) ?? catalogContrasts();
	return { contrasts, limit };
}

function renderMarkdown(results: readonly ContrastResult[], meta: Record<string, unknown>): string {
	const lines = [
		"# Minimal-pair candidates",
		"",
		`Generated ${meta.generatedAt} from ${meta.source}. ${meta.filter}`,
		"",
		"Ranks are 1-based frequency ranks (1 = most frequent). Rows are sorted so pairs where both words are common come first. Flags are hints, not verdicts. Pairs already in the catalog are pre-ticked. Tick the pairs worth adding.",
		"",
	];
	for (const result of results) {
		const [ipaA, ipaB] = result.ipa;
		const [idA, idB] = result.phonemeIds;
		const { initial, medial, final } = result.positions;
		lines.push(
			`## /${ipaA}/ vs /${ipaB}/ (${idA}-${idB})`,
			"",
			`${result.totalCandidates} candidates (initial ${initial}, medial ${medial}, final ${final}); showing ${result.candidates.length}.`,
			"",
		);
		if (result.candidates.length === 0) continue;
		lines.push(
			"| | Word A | Word B | IPA A | IPA B | Position | Ranks | Homophones | Flags |",
			"| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
		);
		for (const candidate of result.candidates) {
			const homophones = candidate.words
				.map((word, side) =>
					candidate.homophones[side].length > 0
						? `${word}: ${candidate.homophones[side].join(", ")}`
						: null,
				)
				.filter((entry) => entry !== null)
				.join("; ");
			lines.push(
				`| ${candidate.inCatalog ? "[x]" : "[ ]"} | ${candidate.words[0]} | ${candidate.words[1]} | /${candidate.ipa[0]}/ | /${candidate.ipa[1]}/ | ${candidate.position} | ${candidate.ranks.join(", ")} | ${homophones} | ${candidate.flags.join("; ")} |`,
			);
		}
		lines.push("");
	}
	return lines.join("\n");
}

function main(): void {
	const { contrasts, limit } = parseOptions();
	const groups = buildHomophoneGroups(EnglishCuratedTop10k.words);
	const index = buildWildcardIndex(groups);

	const results: ContrastResult[] = contrasts.map((contrast) => {
		const candidates = findCandidates(contrast, groups, index);
		const positions: Record<Position, number> = { initial: 0, medial: 0, final: 0 };
		for (const candidate of candidates) positions[candidate.position]++;
		return {
			id: contrastId(contrast),
			phonemeIds: [contrast.a, contrast.b],
			ipa: [getIpaForPhonemeId(contrast.a), getIpaForPhonemeId(contrast.b)],
			totalCandidates: candidates.length,
			positions,
			candidates: candidates.slice(0, limit),
		};
	});

	const meta = {
		source: `@phonaria/phonetics-data curated top-10k (v${EnglishCuratedTop10k.meta.version}, ${EnglishCuratedTop10k.meta.wordCount} words)`,
		generatedAt: new Date().toISOString(),
		filter:
			"Words are lowercase alphabetic with at least 3 letters and one pronunciation (CMU variants agree apart from stress). Homophones are collapsed into their most frequent spelling. Pairs differ by exactly one substituted phoneme.",
		limitPerContrast: limit,
		groupCount: groups.length,
	};

	ensureDirectoryForFile(jsonOutputPath);
	fs.writeFileSync(jsonOutputPath, `${JSON.stringify({ meta, contrasts: results }, null, "\t")}\n`);
	fs.writeFileSync(markdownOutputPath, renderMarkdown(results, meta));

	for (const result of results) {
		const { initial, medial, final } = result.positions;
		console.log(
			`${result.id.padEnd(7)} /${result.ipa[0]}/-/${result.ipa[1]}/  ${String(result.totalCandidates).padStart(4)} candidates (initial ${initial}, medial ${medial}, final ${final})`,
		);
	}
	console.log(
		`\nWrote ${path.relative(process.cwd(), jsonOutputPath)} and ${path.relative(process.cwd(), markdownOutputPath)}`,
	);
}

main();
