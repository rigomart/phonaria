export function normalizeCmuWord(input: string): string {
	const trimmed = input.trim();
	const withoutVariant = trimmed.replace(/\(\d+\)$/, "");
	return withoutVariant.toUpperCase();
}

export interface TextTokenSpan {
	token: string;
	start: number;
	end: number;
}

function isTokenChar(character: string): boolean {
	return /[\w'-]/.test(character);
}

export function tokenizeTextWithSpans(text: string): TextTokenSpan[] {
	const normalized = text.replace(/[\u2018\u2019]/g, "'").replace(/[\u2010-\u2015]/g, "-");
	const spans: TextTokenSpan[] = [];
	let index = 0;

	while (index < normalized.length) {
		const character = normalized[index];
		if (character === undefined || !isTokenChar(character)) {
			index += 1;
			continue;
		}

		const start = index;
		index += 1;
		while (index < normalized.length) {
			const next = normalized[index];
			if (next === undefined || !isTokenChar(next)) break;
			index += 1;
		}
		spans.push({ token: normalized.slice(start, index), start, end: index });
	}

	return spans;
}

export function tokenizeText(text: string): string[] {
	return tokenizeTextWithSpans(text).map((span) => span.token);
}
