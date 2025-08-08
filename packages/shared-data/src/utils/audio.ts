import { slugifyWord } from "./slug";

// Build a canonical audio URL for an example word
// Default base path can be overridden by consumers if needed
export function getExampleAudioUrl(word: string, base = "/audio/examples"): string {
	return `${base}/${slugifyWord(word)}.mp3`;
}
