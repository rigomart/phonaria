import { cmuArpaVariantToPhonemeVariant } from "@phonaria/phonetics-data";

type CompactCmudict = Record<string, string[]>;

function normalizeCmuWord(input: string): string {
	const base = input.includes("(") ? input.replace(/\(\d+\)$/, "") : input;
	return base.toUpperCase();
}

export function parseCmudict(content: string): {
	result: CompactCmudict;
	wordCount: number;
	variantCount: number;
	skippedLineCount: number;
	deduplicatedVariantCount: number;
} {
	const dictMap = new Map<string, Set<string>>();
	const lines = content.split(/\r?\n/);

	let processed = 0;
	let deduplicatedVariants = 0;

	for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		const rawLine = lines[lineIndex];
		const line = rawLine.trim();
		if (!line) continue;
		if (line.startsWith(";") || line.startsWith("#")) continue;

		// Match word followed by phonemes, optionally followed by comment
		const match = line.match(/^(\S+)\s+(.+?)(?:\s*#.*)?$/);
		if (!match) {
			throw new Error(
				`Invalid pronunciation for '${line.split(/\s+/)[0]}' on line ${lineIndex + 1}: missing phonemes`,
			);
		}

		const rawWord = match[1];
		const arpaPhonemes = match[2].trim();

		const normalizedWord = normalizeCmuWord(rawWord);
		if (!normalizedWord) {
			throw new Error(`Invalid word '${rawWord}' on line ${lineIndex + 1}`);
		}

		// Convert ARPABET to our phoneme ID format
		let convertedVariant: string;
		try {
			convertedVariant = cmuArpaVariantToPhonemeVariant(arpaPhonemes);
		} catch (cause) {
			throw new Error(`Invalid pronunciation for '${rawWord}' on line ${lineIndex + 1}`, {
				cause,
			});
		}

		const existingVariants = dictMap.get(normalizedWord);
		if (existingVariants) {
			const sizeBefore = existingVariants.size;
			existingVariants.add(convertedVariant);
			if (existingVariants.size === sizeBefore) {
				deduplicatedVariants++;
			}
		} else {
			dictMap.set(normalizedWord, new Set([convertedVariant]));
		}

		processed++;
	}

	console.log(`Parsed ${processed} entries`);
	console.log(`Removed ${deduplicatedVariants} duplicate variants`);

	// Convert Map back to object for return type compatibility
	const result: CompactCmudict = {};
	let variantCount = 0;
	for (const [word, variants] of dictMap.entries()) {
		if (variants.size === 0) {
			continue;
		}

		result[word] = Array.from(variants);
		variantCount += variants.size;
	}

	const wordCount = Object.keys(result).length;

	return {
		result,
		wordCount,
		variantCount,
		skippedLineCount: 0, // Malformed entries now fail instead of being skipped.
		deduplicatedVariantCount: deduplicatedVariants,
	};
}
