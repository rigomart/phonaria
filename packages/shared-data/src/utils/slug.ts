// Utility to create a stable, URL-safe slug from an example word
// Rules:
// - lowercase
// - trim whitespace
// - collapse spaces to single hyphen
// - remove non-alphanumeric except hyphen
export function slugifyWord(word: string): string {
	return word
		.toLowerCase()
		.trim()
		.replace(/['’`]/g, "")
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/(^-|-$)/g, "");
}
