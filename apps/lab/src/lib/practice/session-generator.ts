/**
 * Session generation: a pure function of (pool, slot spec, rng). Each slot
 * draws randomly from its syllable band; topic-sound position/count act as
 * soft variety tie-breakers, never quotas; a session never repeats a word;
 * memoryless across sessions (#140).
 */
import type { SyllableBand } from "./topics/types";
import type { PoolWord } from "./word-pool";

/** Injectable random source returning values in [0, 1). */
export type SessionRng = () => number;

/**
 * Extra draws a slot may spend looking for a word whose variety facets are
 * unseen in the session before settling for its first draw.
 */
const VARIETY_REDRAWS = 4;

function varietyKey(word: PoolWord): string {
	return `${word.topicSoundCount}:${word.topicSoundPositions.join("+")}`;
}

export function isInSyllableBand(word: PoolWord, band: SyllableBand): boolean {
	return word.syllableCount >= band.min && (band.max === null || word.syllableCount <= band.max);
}

function drawSlot(
	candidates: PoolWord[],
	seenVariety: ReadonlySet<string>,
	rng: SessionRng,
): PoolWord {
	const firstDraw = candidates[Math.floor(rng() * candidates.length)];
	if (!seenVariety.has(varietyKey(firstDraw))) return firstDraw;
	for (let attempt = 0; attempt < VARIETY_REDRAWS; attempt++) {
		const candidate = candidates[Math.floor(rng() * candidates.length)];
		if (!seenVariety.has(varietyKey(candidate))) return candidate;
	}
	return firstDraw;
}

/**
 * Draws one word per slot, in slot order. Throws when a band has no unused
 * candidates — a data-shape failure the band-depth CI test exists to prevent.
 */
export function generateSession(
	pool: readonly PoolWord[],
	slots: readonly SyllableBand[],
	rng: SessionRng,
): PoolWord[] {
	const session: PoolWord[] = [];
	const usedWords = new Set<string>();
	const seenVariety = new Set<string>();

	for (const band of slots) {
		const candidates = pool.filter(
			(word) => isInSyllableBand(word, band) && !usedWords.has(word.word),
		);
		if (candidates.length === 0) {
			throw new Error(`No eligible words for slot band ${band.min}–${band.max ?? "∞"} syllables`);
		}
		const picked = drawSlot(candidates, seenVariety, rng);
		session.push(picked);
		usedWords.add(picked.word);
		seenVariety.add(varietyKey(picked));
	}

	return session;
}
