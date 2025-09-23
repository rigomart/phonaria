export { normalizeCmuWord } from "shared-data";

export function tokenizeText(text: string): string[] {
	return text
		.replace(/[^\w\s'-]/g, " ")
		.split(/\s+/)
		.filter((word) => word.length > 0)
		.map((word) => word.trim());
}
