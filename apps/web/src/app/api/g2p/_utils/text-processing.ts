export function normalizeCmuWord(input: string): string {
	const base = input.includes("(") ? input.replace(/\(\d+\)$/, "") : input;
	return base.toUpperCase();
}

export function tokenizeText(text: string): string[] {
	return text
		.replace(/[^\w\s'-]/g, " ")
		.split(/\s+/)
		.filter((word) => word.length > 0)
		.map((word) => word.trim());
}
