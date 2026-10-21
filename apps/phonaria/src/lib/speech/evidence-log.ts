/**
 * Opt-in evidence logging (#336): after a learner's next action, the browser posts
 * what the scorer reported and what the judge decided, so thresholds can be tuned
 * on real use. Never audio. The Worker validates this shape in
 * `src/server/evidence-log.ts` and keeps each row for `EVIDENCE_LOG_RETENTION_DAYS`.
 */
import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import type { RecordingEvidence, WordGate, WordJudgement } from "@phonaria/pronunciation";
import { CatalogWordPronunciations } from "@/lib/speech/catalog-pronunciations";

export const EVIDENCE_LOG_PATH = "/api/speech/evidence-log";
export const EVIDENCE_LOG_SCHEMA_VERSION = 1;
export const EVIDENCE_LOG_RETENTION_DAYS = 90;

/** Copy for the consent setting and anywhere the app describes its data use. */
export const EvidenceLogNotice = {
	label: "Share results to improve the checks",
	description:
		"Phonaria keeps the word, its scores and whether you tried again, for 90 days. Never your recording, and no words outside the practice list.",
} as const;

/**
 * Stands in for any heard word outside the minimal-pair catalog, so a name or a
 * number a learner says is never stored. The angle brackets keep it from ever
 * being a word.
 */
export const EVIDENCE_LOG_OTHER_WORD = "<other>";

/** The only words the log holds: catalog words and the placeholder. */
export function isLoggableWord(word: string): boolean {
	return word === EVIDENCE_LOG_OTHER_WORD || CatalogWordPronunciations.has(word);
}

/**
 * The only word lists the log holds: one loggable word, or placeholders only. Several
 * catalog words can still spell a name ("Sue Park"), and the gate reads only the
 * length of a transcript longer than one word, so those words are never kept.
 */
export function isLoggableWordList(words: readonly string[]): boolean {
	return words.length === 1
		? isLoggableWord(words[0])
		: words.every((word) => word === EVIDENCE_LOG_OTHER_WORD);
}

const loggedWord = (word: string) =>
	CatalogWordPronunciations.has(word) ? word : EVIDENCE_LOG_OTHER_WORD;

const loggedWords = (words: readonly string[]) =>
	words.length === 1 ? [loggedWord(words[0])] : words.map(() => EVIDENCE_LOG_OTHER_WORD);

/**
 * Keeps a real word only where re-judging needs it: a one-word transcript, a
 * one-word `heard` from the word gate, and a swap's `heardWord`, and only when it
 * is a catalog word. Every other heard word becomes `EVIDENCE_LOG_OTHER_WORD`,
 * including every word of a longer transcript or `heard` and every inserted word,
 * which the gate never reads. Word counts and confidence stay.
 */
export function withCatalogWordsOnly(payload: EvidenceLogPayload): EvidenceLogPayload {
	const { evidence, verdicts } = payload;
	const { gate, judgement } = verdicts;
	return {
		...payload,
		evidence: {
			...evidence,
			...(evidence.transcript && {
				transcript: { ...evidence.transcript, words: loggedWords(evidence.transcript.words) },
			}),
			...(evidence.insertedWords && {
				insertedWords: evidence.insertedWords.map(() => EVIDENCE_LOG_OTHER_WORD),
			}),
		},
		verdicts: {
			...verdicts,
			gate: gate.type === "different-word" ? { ...gate, heard: loggedWords(gate.heard) } : gate,
			judgement: judgement && {
				...judgement,
				sounds: judgement.sounds.map((sound) =>
					sound.verdict.type === "swapped" && sound.verdict.heardWord !== undefined
						? {
								...sound,
								verdict: { ...sound.verdict, heardWord: loggedWord(sound.verdict.heardWord) },
							}
						: sound,
				),
			},
		},
	};
}

/** What the learner did after seeing the result. */
export type EvidenceLogNext = "retried" | "moved-on";

export type EvidenceLogVerdicts = {
	/** The sounds the judge and the word gate were told to judge. Absent when every sound was. */
	readonly judgedPhonemeIds?: readonly PhonemeSymbolId[];
	readonly gate: WordGate;
	/** Null when the gate stopped the recording or the judge lined up no pronunciation. */
	readonly judgement: WordJudgement | null;
};

/** One attempt at one catalog word. Holds no audio, account, IP or user agent. */
export type EvidenceLogPayload = {
	readonly schemaVersion: typeof EVIDENCE_LOG_SCHEMA_VERSION;
	/** When the attempt was scored, in Unix milliseconds. */
	readonly attemptedAt: number;
	readonly word: string;
	readonly targetAccent: "en-us";
	readonly evidence: RecordingEvidence;
	readonly verdicts: EvidenceLogVerdicts;
	readonly next: EvidenceLogNext;
};

export type EvidenceLogFetch = (input: string, init: RequestInit) => Promise<Response>;

export type EvidenceLogResult = "sent" | "rejected" | "rate_limited" | "unavailable" | "failed";

/**
 * Posts one attempt, with every word outside the catalog replaced by the
 * placeholder first. Never throws: logging is best effort, so the page can fire and
 * forget it. `keepalive` lets the request finish when moving on leaves the page.
 * Call it only when the learner has turned sharing on.
 */
export async function sendEvidenceLog(
	payload: EvidenceLogPayload,
	fetch: EvidenceLogFetch,
): Promise<EvidenceLogResult> {
	try {
		const response = await fetch(EVIDENCE_LOG_PATH, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(withCatalogWordsOnly(payload)),
			keepalive: true,
		});
		if (response.ok) return "sent";
		if (response.status === 429) return "rate_limited";
		if (response.status === 404 || response.status === 503) return "unavailable";
		if (response.status >= 400 && response.status < 500) return "rejected";
		return "failed";
	} catch {
		return "failed";
	}
}
