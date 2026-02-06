import * as path from "node:path";
import cmudictJson from "../../phonetics-data/data/en/dict/cmudict.json";
import type { CmudictPayload } from "../../phonetics-data/src/dict/types";
import {
	getArpabetForEnglishPhonemeId,
	isEnglishPhonemeSymbolId,
	tryExtractBasePhonemeId,
} from "../../phonetics-data/src/languages/en/cmu-arpa";
import { ensureDirectoryForFile, writeJsonFile } from "./utils/fs";

type PhonemeTrieNode = {
	words: string[];
	count: number;
	next: Record<string, PhonemeTrieNode>;
};

type PhonemeTriePayload = {
	meta: {
		formatVersion: number;
		source: string;
		generatedAt: string;
		wordCount: number;
		phonemePathCount: number;
		totalEntries: number;
	};
	data: PhonemeTrieNode;
};

const outputPath = path.resolve(
	__dirname,
	"../../phonetics-data/data/en/dict/cmudict-phoneme-trie.json",
);

function createTrieNode(): PhonemeTrieNode {
	return {
		words: [],
		count: 0,
		next: {},
	};
}

function insertIntoTrie(trie: PhonemeTrieNode, phonemes: string[], word: string): void {
	let currentNode = trie;
	currentNode.count++;

	for (const phoneme of phonemes) {
		if (!currentNode.next[phoneme]) {
			currentNode.next[phoneme] = createTrieNode();
		}
		currentNode = currentNode.next[phoneme];
		currentNode.count++;
	}

	currentNode.words.push(word);
}

function normalizeCmuWord(input: string): string {
	const base = input.includes("(") ? input.replace(/\(\d+\)$/, "") : input;
	return base.toUpperCase();
}

function buildTrieFromCmudict(cmudict: CmudictPayload): {
	trie: PhonemeTrieNode;
	phonemePathCount: number;
	totalEntries: number;
	skippedWords: number;
} {
	const trie = createTrieNode();
	let phonemePathCount = 0;
	let totalEntries = 0;
	let skippedWords = 0;

	for (const [word, variants] of Object.entries(cmudict.data)) {
		for (const variant of variants as string[]) {
			const tokens = variant.trim().split(/\s+/);
			const standardArpabetPhonemes: string[] = [];

			let allMapped = true;

			for (const token of tokens) {
				const phonemeId = tryExtractBasePhonemeId(token);
				if (!phonemeId || !isEnglishPhonemeSymbolId(phonemeId)) {
					console.warn(`Warning: Could not map token '${token}' for word '${word}'`);
					allMapped = false;
					break;
				}

				// Get standard ARPABET label for trie key
				const standardArpabet = getArpabetForEnglishPhonemeId(phonemeId);
				standardArpabetPhonemes.push(standardArpabet);
			}

			if (allMapped && standardArpabetPhonemes.length > 0) {
				const normalizedWord = normalizeCmuWord(word);
				insertIntoTrie(trie, standardArpabetPhonemes, normalizedWord);
				phonemePathCount++;
				totalEntries++;
			} else {
				skippedWords++;
			}
		}
	}

	console.log(`Built trie with ${Object.keys(trie.next).length} root phonemes`);
	console.log(`Processed ${totalEntries} entries`);
	console.log(`Skipped ${skippedWords} entries due to unmapped phonemes`);

	return { trie, phonemePathCount, totalEntries, skippedWords };
}

function saveToJson(payload: PhonemeTriePayload): void {
	console.log(`Saving phoneme trie to ${outputPath}`);

	const bytesWritten = writeJsonFile(outputPath, payload);
	console.log(`Saved ${bytesWritten} bytes to ${outputPath}`);
}

async function main(): Promise<void> {
	console.log("Starting phoneme trie generation...");

	ensureDirectoryForFile(outputPath);

	try {
		const { trie, phonemePathCount, totalEntries } = buildTrieFromCmudict(
			cmudictJson as unknown as CmudictPayload,
		);

		const payload: PhonemeTriePayload = {
			meta: {
				formatVersion: 2, // Bump version for new format
				source: "cmudict",
				generatedAt: new Date().toISOString(),
				wordCount: (cmudictJson as unknown as CmudictPayload).meta.wordCount,
				phonemePathCount,
				totalEntries,
			},
			data: trie,
		};

		saveToJson(payload);

		console.log("\nGeneration Summary:");
		console.log(`Source words: ${payload.meta.wordCount}`);
		console.log(`Phoneme paths: ${payload.meta.phonemePathCount}`);
		console.log(`Output file: ${outputPath}`);
		console.log("\nPhoneme trie generation complete.");
	} catch (error) {
		console.error("Error during phoneme trie generation:", error);
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}
