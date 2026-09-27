/**
 * Starter phrases on the empty page. The IPA is stored so the list can show it
 * before anything is looked up; a test keeps it in step with the word lists.
 */
export interface TranscriptionExample {
	text: string;
	ipa: string;
}

export const TRANSCRIPTION_EXAMPLES: readonly TranscriptionExample[] = [
	{ text: "Hello world", ipa: "hə.ˈloʊ ˈwɝld" },
	{ text: "Judge the rhythm", ipa: "ˈdʒʌdʒ ðə ˈɹɪ.ðəm" },
	{ text: "She chose well", ipa: "ˈʃi ˈtʃoʊz ˈwɛl" },
	{ text: "Through thick fog", ipa: "ˈθɹu ˈθɪk ˈfɑɡ" },
];
