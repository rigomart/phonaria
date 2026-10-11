/**
 * Splits an English spelling into letter groups and pairs each group with the
 * sounds it spells, for one pronunciation of the word. A group may spell no
 * sound (the k in "knight") or two (the x in "box"). See
 * docs/research/issue-283-letter-sound-matcher.md for how the table was built
 * and how much of the top-10k list it splits.
 */
import type { PhonemeSymbolId } from "../../core/ipa-map";
import { deepFreeze } from "../../shared/readonly";
import type { EnglishPhonemeSymbolId } from "../inventories";

type SoundSequence =
	| ""
	| EnglishPhonemeSymbolId
	| `${EnglishPhonemeSymbolId} ${EnglishPhonemeSymbolId}`;

/**
 * Letter groups and the sounds each can spell, most common first. "" is a
 * silent group. Order matters: when several splits fit, the matcher prefers
 * earlier entries. Split spellings (a-e as in "make") are not modelled; the
 * final e is a silent group instead.
 */
const EnglishLetterSoundTable = deepFreeze({
	// Consonant letters
	b: ["B"],
	bb: ["B"],
	c: ["K", "S", "SH", "CH"],
	cc: ["K", "K S"],
	ch: ["CH", "K", "SH"],
	ci: ["SH"],
	ck: ["K"],
	d: ["D", "T", "J"],
	dd: ["D"],
	dg: ["J"],
	dj: ["J"],
	f: ["F", "V"],
	ff: ["F"],
	g: ["G", "J", "ZH"],
	gg: ["G", "J"],
	gi: ["J"],
	gh: ["F", "G", ""],
	gn: ["N"],
	gu: ["G", "G W"],
	h: ["H", ""],
	j: ["J", "Y", "H"],
	k: ["K"],
	kn: ["N"],
	l: ["L", "AX L"],
	le: ["AX L"],
	ll: ["L"],
	m: ["M", "AX M"],
	mb: ["M"],
	mm: ["M"],
	mn: ["M"],
	n: ["N", "NG", "AX N"],
	ng: ["NG", "NG G", "NG K"],
	nn: ["N"],
	p: ["P"],
	ph: ["F", "V"],
	pp: ["P"],
	ps: ["S"],
	q: ["K"],
	qu: ["K W", "K"],
	r: ["R", "ER"],
	rh: ["R"],
	rr: ["R"],
	s: ["S", "Z", "SH", "ZH"],
	sc: ["S"],
	sci: ["SH"],
	sh: ["SH"],
	si: ["ZH", "SH", "CH"],
	ss: ["S", "SH", "Z"],
	ssi: ["SH"],
	t: ["T", "SH", "CH", "D"],
	tch: ["CH"],
	th: ["TH", "DH", "T"],
	ti: ["SH", "CH", "ZH"],
	tt: ["T", "D"],
	v: ["V"],
	w: ["W"],
	wh: ["W", "H"],
	wr: ["R"],
	x: ["K S", "G Z", "Z", "K SH", "G ZH"],
	y: ["Y", "I", "AI", "IX", "AX"],
	z: ["Z", "S", "ZH", "T S"],
	zz: ["Z", "T S"],

	// Vowel letters and vowel teams
	a: ["AE", "AX", "EI", "A", "O", "E", "IX", "AH"],
	ai: ["EI", "E", "AX", "AI"],
	au: ["O", "A", "AE"],
	aw: ["O", "A"],
	ay: ["EI", "I", "E"],
	e: ["E", "I", "AX", "IX", "", "EI"],
	ea: ["I", "E", "EI", "IX"],
	eau: ["OU", "Y U"],
	ee: ["I"],
	ei: ["EI", "I", "AI", "E"],
	eigh: ["EI"],
	eu: ["U"],
	eo: ["I"],
	ew: ["U", "Y U", "OU"],
	ey: ["I", "EI"],
	i: ["IX", "AI", "I", "AX", "Y"],
	ie: ["I", "AI", "E"],
	igh: ["AI"],
	o: ["A", "OU", "AX", "AH", "U", "O", "UX", "IX", "W AH"],
	oa: ["OU", "O"],
	oe: ["OU", "U"],
	oi: ["OI", "W A"],
	oo: ["U", "UX", "AH", "O"],
	ou: ["AU", "U", "AH", "OU", "O", "AX", "UX"],
	ough: ["O", "OU", "U", "AU"],
	ow: ["OU", "AU"],
	oy: ["OI"],
	u: ["AH", "AX", "U", "UX", "Y U", "Y UX", "Y AX", "IX", "W", "Y ER", "AX W", "E"],
	ue: ["U", "Y U"],
	ui: ["U", "IX"],
	uy: ["AI"],

	// R-controlled vowels spelling /ɝ/ on their own
	ar: ["ER"],
	arr: ["ER"],
	ear: ["ER"],
	er: ["ER"],
	err: ["ER"],
	ir: ["ER"],
	or: ["ER"],
	orr: ["ER"],
	our: ["ER"],
	ur: ["ER", "Y ER"],
	ure: ["ER", "Y ER"],
	urr: ["ER"],
} satisfies Record<string, readonly SoundSequence[]>);

/** One stretch of the spelling and the sounds it spells, in order. */
export interface LetterGroup {
	readonly letters: string;
	/** Empty for a silent group. */
	readonly phonemes: readonly PhonemeSymbolId[];
}

/** The part of a spelling and pronunciation the matcher could not pair up. */
export interface LetterSoundGap {
	readonly letters: string;
	readonly phonemes: readonly PhonemeSymbolId[];
}

/** Base cost of one group; fewer, longer groups win ties. */
const GROUP_COST = 1;
/** Added per step down an entry's list, so common readings win. */
const RANK_COST = 0.1;
/** A letter the table does not list as silent; costs more than any listed group. */
const UNLISTED_SILENT_COST = 3;
const LETTER = /^[a-z]$/;
/** Written but never spoken; each is its own free silent group. */
const PUNCTUATION = /^[-'’.]$/;

interface Move {
	readonly length: number;
	readonly phonemes: readonly PhonemeSymbolId[];
	readonly cost: number;
}

const MovesByLetters: ReadonlyMap<string, readonly Move[]> = new Map(
	Object.entries(EnglishLetterSoundTable).map(([letters, readings]) => [
		letters,
		readings.map((reading, rank) => ({
			length: letters.length,
			phonemes: reading ? (reading.split(" ") as PhonemeSymbolId[]) : [],
			cost: GROUP_COST + rank * RANK_COST,
		})),
	]),
);
const LONGEST_GROUP = Math.max(...[...MovesByLetters.keys()].map((letters) => letters.length));

interface Step {
	readonly cost: number;
	readonly from: readonly [number, number];
	readonly phonemes: readonly PhonemeSymbolId[];
}

/**
 * Cheapest way to reach each (letters used, sounds used) state, filled left to
 * right. Any character other than a-z and PUNCTUATION blocks the match.
 */
function alignSteps(
	spelling: string,
	phonemes: readonly PhonemeSymbolId[],
): (Step | undefined)[][] {
	// ASCII-only lowercasing keeps indexes aligned with the original spelling.
	const word = spelling.replace(/[A-Z]/g, (letter) => letter.toLowerCase());
	const steps: (Step | undefined)[][] = Array.from({ length: word.length + 1 }, () =>
		Array.from({ length: phonemes.length + 1 }),
	);
	steps[0][0] = { cost: 0, from: [0, 0], phonemes: [] };

	const relax = (i: number, j: number, move: Move, base: number) => {
		const next = steps[i + move.length];
		const nj = j + move.phonemes.length;
		const cost = base + move.cost;
		const current = next[nj];
		if (!current || cost < current.cost) {
			next[nj] = { cost, from: [i, j], phonemes: move.phonemes };
		}
	};

	for (let i = 0; i < word.length; i++) {
		for (let j = 0; j <= phonemes.length; j++) {
			const base = steps[i][j]?.cost;
			if (base === undefined) continue;
			if (PUNCTUATION.test(word[i])) {
				relax(i, j, { length: 1, phonemes: [], cost: 0 }, base);
				continue;
			}
			if (!LETTER.test(word[i])) continue;
			relax(i, j, { length: 1, phonemes: [], cost: UNLISTED_SILENT_COST }, base);
			for (let length = 1; length <= LONGEST_GROUP && i + length <= word.length; length++) {
				for (const move of MovesByLetters.get(word.slice(i, i + length)) ?? []) {
					if (move.phonemes.every((id, k) => phonemes[j + k] === id)) {
						relax(i, j, move, base);
					}
				}
			}
		}
	}
	return steps;
}

/**
 * Split a spelling into letter groups for one pronunciation, given as base
 * phoneme IDs (see toBasePhonemeIds). Returns null when no split accounts for
 * every letter and every sound. Joining the groups' letters gives back the
 * spelling unchanged, including case and apostrophes.
 */
export function matchLettersToSounds(
	spelling: string,
	phonemes: readonly PhonemeSymbolId[],
): LetterGroup[] | null {
	if (!spelling || !phonemes.length) return null;
	const steps = alignSteps(spelling, phonemes);
	const groups: LetterGroup[] = [];
	let i = spelling.length;
	let j = phonemes.length;
	while (i > 0) {
		const step = steps[i][j];
		if (!step) return null;
		const [fromI, fromJ] = step.from;
		groups.push({ letters: spelling.slice(fromI, i), phonemes: step.phonemes });
		i = fromI;
		j = fromJ;
	}
	return groups.reverse();
}

/**
 * Where matching gave up: the letters and sounds left after the furthest point
 * the table could reach, or null when the word splits. Used by the coverage
 * report to group failures.
 */
export function findLetterSoundGap(
	spelling: string,
	phonemes: readonly PhonemeSymbolId[],
): LetterSoundGap | null {
	if (matchLettersToSounds(spelling, phonemes)) return null;
	const steps = alignSteps(spelling, phonemes);
	for (let j = phonemes.length; j >= 0; j--) {
		const i = steps.findIndex((row) => row[j] !== undefined);
		if (i !== -1) return { letters: spelling.slice(i), phonemes: phonemes.slice(j) };
	}
	return { letters: spelling, phonemes };
}
