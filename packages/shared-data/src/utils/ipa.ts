// Helper to render slash-delimited IPA for UI without storing slashes in data
export function toPhonemic(ipa: string): string {
	return `/${ipa}/`;
}
