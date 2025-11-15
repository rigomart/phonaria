export function normalizeCmuWord(input: string): string {
	const trimmed = input.trim();
	const withoutVariant = trimmed.replace(/\(\d+\)$/, "");
	return withoutVariant.toUpperCase();
}

export function tokenizeText(text: string): string[] {
	return text
		.replace(/[^\w\s'-]/g, " ")
		.split(/\s+/)
		.filter((word) => word.length > 0)
		.map((word) => word.trim());
}
