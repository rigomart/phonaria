import type { WordAudioManifest } from "@phonaria/phonetics-data";
import manifest from "./word-audio-before-top-10k.json";

/**
 * The word-audio manifest before the top-1k and top-10k uploads (commit 4074ca1): the 809
 * words of the catalog, spelling and Practice batches. Tests of the curated sources plan
 * against it, since the live manifest lists nearly every curated word now.
 */
export const wordAudioBeforeTop10k: WordAudioManifest = manifest;
export const recordedBeforeTop10k: ReadonlySet<string> = new Set(manifest.words);
