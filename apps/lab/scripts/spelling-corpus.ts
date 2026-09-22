/**
 * The reusable spelling-suggestion evaluation corpus.
 *
 * Grown from the small reviewed set behind issue #247. Each case records what a learner could
 * reasonably have meant rather than one blessed answer, so a case can be scored without
 * forcing an interpretation onto genuinely ambiguous input.
 *
 * The corpus is split. **Tuning** cases are the ones the thresholds were chosen against —
 * every #247 case is tuning, because the one-edit policy was fitted to them. **Holdout** cases
 * were written before any constant in this change was picked and were read only after, so the
 * holdout numbers are not a restatement of the examples used to choose the weights.
 */

export type ErrorCategory =
	| "transposition"
	| "omitted letter"
	| "doubled letter"
	| "vowel confusion"
	| "consonant confusion"
	| "two slips"
	| "short ambiguous"
	| "name"
	| "intentional unknown"
	| "contraction"
	| "uncommon valid"
	| "dictionary hit";

export type CorpusSplit = "tuning" | "holdout";

export interface CorpusCase {
	token: string;
	/**
	 * Every correction a learner could reasonably have meant. Empty means silence is the only
	 * right answer. An offer outside this list is wrong; an offer inside it is correct.
	 */
	acceptable: string[];
	/**
	 * The one reading a learner almost certainly meant, when there is one. Null marks input
	 * where intent genuinely cannot be settled, and silence is then as acceptable as any
	 * listed alternative — those cases are reported as abstentions, not as misses.
	 */
	intended: string | null;
	category: ErrorCategory;
	split: CorpusSplit;
	note?: string;
}

/** A case as written. The split comes from the list it is written in, not from the case. */
type UnsplitCase = Omit<CorpusCase, "split">;

const TUNING_CASES: UnsplitCase[] = [
	// The reviewed set from #247. Thresholds were fitted here, so it is all tuning.
	{ token: "recieve", acceptable: ["receive"], intended: "receive", category: "transposition" },
	{ token: "teh", acceptable: ["the"], intended: "the", category: "short ambiguous" },
	{ token: "receve", acceptable: ["receive"], intended: "receive", category: "omitted letter" },
	{ token: "recceive", acceptable: ["receive"], intended: "receive", category: "doubled letter" },
	{
		token: "seperate",
		acceptable: ["separate"],
		intended: "separate",
		category: "vowel confusion",
	},
	{ token: "occured", acceptable: ["occurred"], intended: "occurred", category: "omitted letter" },
	{ token: "becuase", acceptable: ["because"], intended: "because", category: "transposition" },
	{
		token: "adress",
		acceptable: ["address"],
		intended: "address",
		category: "omitted letter",
		note: "`dress` is the one-edit rival: a dropped letter against a supplied one.",
	},
	{
		token: "wnat",
		acceptable: ["want", "what"],
		intended: null,
		category: "short ambiguous",
		note: "A transposition reads `want`, a substitution reads `what` (rank 95 against 45).",
	},
	{ token: "thnik", acceptable: ["think"], intended: "think", category: "transposition" },
	{ token: "alwasy", acceptable: ["always"], intended: "always", category: "transposition" },
	{
		token: "becomming",
		acceptable: ["becoming"],
		intended: "becoming",
		category: "doubled letter",
	},

	// The three offers #247 set out to stop making.
	{
		token: "reciv",
		acceptable: [],
		intended: null,
		category: "intentional unknown",
		note: "The old policy offered `recio` because it was the only candidate.",
	},
	{
		token: "langwidge",
		acceptable: [],
		intended: null,
		category: "intentional unknown",
		note: "The old policy offered `langridge`, a surname CMUDict happens to know.",
	},
	{
		token: "definatly",
		acceptable: ["definitely"],
		intended: null,
		category: "two slips",
		note: "The ticket names this one ambiguous, so silence is recorded as acceptable and no policy is required to reach `definitely`. What is *not* acceptable is `defiantly`: it is the nearer word, one edit away against two, but the edit reorders a consonant and nothing vouches for the word, so offering it would need the learner to have made a second, different slip onto a rarer word. Reaching `definitely` is therefore credited, and abstaining is not penalised.",
	},

	{
		token: "frm",
		acceptable: ["from", "form", "farm"],
		intended: null,
		category: "short ambiguous",
	},
	{ token: "bg", acceptable: [], intended: null, category: "short ambiguous" },
	{ token: "cn", acceptable: [], intended: null, category: "short ambiguous" },
	{ token: "wrk", acceptable: ["work"], intended: "work", category: "short ambiguous" },

	{ token: "sanjeev", acceptable: [], intended: null, category: "name" },
	{ token: "kowalevski", acceptable: [], intended: null, category: "name" },
	{ token: "rigomart", acceptable: [], intended: null, category: "name" },

	{ token: "zxqvwoplmj", acceptable: [], intended: null, category: "intentional unknown" },
	{ token: "blorptastic", acceptable: [], intended: null, category: "intentional unknown" },
	{ token: "flumoxinate", acceptable: [], intended: null, category: "intentional unknown" },

	{ token: "dont", acceptable: ["don't"], intended: "don't", category: "contraction" },
	{ token: "isnt", acceptable: ["isn't"], intended: "isn't", category: "contraction" },
	{ token: "doesnt", acceptable: ["doesn't"], intended: "doesn't", category: "contraction" },
	{ token: "wouldnt", acceptable: ["wouldn't"], intended: "wouldn't", category: "contraction" },

	{ token: "aardvrk", acceptable: ["aardvark"], intended: "aardvark", category: "uncommon valid" },
	{
		token: "zucchinni",
		acceptable: ["zucchini"],
		intended: "zucchini",
		category: "uncommon valid",
	},
	{
		token: "rhinocerus",
		acceptable: ["rhinoceros"],
		intended: "rhinoceros",
		category: "uncommon valid",
	},
	{
		token: "asparagas",
		acceptable: ["asparagus"],
		intended: "asparagus",
		category: "uncommon valid",
	},
	{
		token: "wierdness",
		acceptable: ["weirdness"],
		intended: "weirdness",
		category: "uncommon valid",
	},

	{ token: "fone", acceptable: [], intended: null, category: "dictionary hit" },
	{ token: "nite", acceptable: [], intended: null, category: "dictionary hit" },
	{ token: "alot", acceptable: [], intended: null, category: "dictionary hit" },
	{ token: "thier", acceptable: [], intended: null, category: "dictionary hit" },

	// Added for this change: the two-edit recovery the ticket is about.
	{
		token: "acomodate",
		acceptable: ["accommodate"],
		intended: "accommodate",
		category: "two slips",
		note: "Two letters left out. Nothing the learner typed is contradicted.",
	},
	{
		token: "reccomend",
		acceptable: ["recommend"],
		intended: "recommend",
		category: "two slips",
		note: "A doubled keystroke in the wrong place: drop one `c`, supply the second `m`.",
	},
];

const HOLDOUT_CASES: UnsplitCase[] = [
	// Written before any threshold in this change was chosen, and read only afterwards.
	{ token: "rember", acceptable: ["remember"], intended: "remember", category: "two slips" },
	{ token: "probly", acceptable: ["probably"], intended: "probably", category: "two slips" },
	{
		token: "succesfull",
		acceptable: ["successful"],
		intended: "successful",
		category: "two slips",
	},
	{
		token: "enviroment",
		acceptable: ["environment"],
		intended: "environment",
		category: "omitted letter",
	},
	{
		token: "goverment",
		acceptable: ["government"],
		intended: "government",
		category: "omitted letter",
	},
	{
		token: "tommorrow",
		acceptable: ["tomorrow"],
		intended: "tomorrow",
		category: "doubled letter",
	},
	{
		token: "neccessary",
		acceptable: ["necessary"],
		intended: "necessary",
		category: "doubled letter",
	},
	{ token: "beleive", acceptable: ["believe"], intended: "believe", category: "transposition" },
	{ token: "acheive", acceptable: ["achieve"], intended: "achieve", category: "transposition" },
	{ token: "buisness", acceptable: ["business"], intended: "business", category: "transposition" },
	{
		token: "diffrent",
		acceptable: ["different"],
		intended: "different",
		category: "omitted letter",
	},
	{
		token: "intresting",
		acceptable: ["interesting"],
		intended: "interesting",
		category: "omitted letter",
	},
	{ token: "untill", acceptable: ["until"], intended: "until", category: "doubled letter" },
	{ token: "wich", acceptable: ["which"], intended: "which", category: "omitted letter" },
	{ token: "libary", acceptable: ["library"], intended: "library", category: "omitted letter" },
	{
		token: "definate",
		acceptable: ["definite"],
		intended: "definite",
		category: "vowel confusion",
	},
	{
		token: "existance",
		acceptable: ["existence"],
		intended: "existence",
		category: "vowel confusion",
	},
	{
		token: "independant",
		acceptable: ["independent"],
		intended: "independent",
		category: "vowel confusion",
	},
	{
		token: "calender",
		acceptable: ["calendar"],
		intended: "calendar",
		category: "vowel confusion",
	},
	{ token: "grammer", acceptable: ["grammar"], intended: "grammar", category: "vowel confusion" },
	{ token: "seige", acceptable: ["siege"], intended: "siege", category: "transposition" },
	{
		token: "arguement",
		acceptable: ["argument"],
		intended: "argument",
		category: "omitted letter",
	},
	{
		token: "alchohol",
		acceptable: ["alcohol"],
		intended: "alcohol",
		category: "consonant confusion",
		note: "The stray `h` is not doubled, so the reading rests on `alcohol` being common.",
	},
	{
		token: "ther",
		acceptable: ["the", "there", "their", "other"],
		intended: null,
		category: "short ambiguous",
		note: "Four common words are one edit away; nothing settles which.",
	},
	{
		token: "wether",
		acceptable: ["whether", "weather"],
		intended: null,
		category: "short ambiguous",
		note: "Both readings are one omitted letter away and both are common.",
	},
	{ token: "brocolli", acceptable: ["broccoli"], intended: "broccoli", category: "uncommon valid" },
	{ token: "gnocci", acceptable: ["gnocchi"], intended: "gnocchi", category: "uncommon valid" },
	{ token: "hendricksen", acceptable: [], intended: null, category: "name" },
	{ token: "marquetta", acceptable: [], intended: null, category: "name" },
	{ token: "obrien", acceptable: [], intended: null, category: "name" },
	{ token: "grintaloth", acceptable: [], intended: null, category: "intentional unknown" },
	{ token: "quibberly", acceptable: [], intended: null, category: "intentional unknown" },
	{ token: "sprandling", acceptable: [], intended: null, category: "intentional unknown" },
	{ token: "morphlex", acceptable: [], intended: null, category: "intentional unknown" },
	{ token: "vantorial", acceptable: [], intended: null, category: "intentional unknown" },
];

export const CORPUS_CASES: CorpusCase[] = [
	...TUNING_CASES.map((entry) => ({ ...entry, split: "tuning" as const })),
	...HOLDOUT_CASES.map((entry) => ({ ...entry, split: "holdout" as const })),
];

/**
 * How a case came out.
 *
 * - `correct` — offered a correction the learner could have meant.
 * - `wrong` — offered something outside the acceptable set. The one a learner has to undo.
 * - `missed` — stayed silent although one reading was clearly intended.
 * - `abstained` — stayed silent on input whose intent is genuinely unsettled. Acceptable.
 * - `correctly silent` — stayed silent on input with no correction behind it.
 * - `not offered` — the pronunciation dictionary already knows the token, so suggestion is
 *   never reached. Read from the real dictionary rather than from the case, so a token that
 *   turns out to be a CMUDict entry cannot be scored as though suggestion had a say.
 */
export type Verdict =
	| "correct"
	| "wrong"
	| "missed"
	| "abstained"
	| "correctly silent"
	| "not offered";

export function verdictFor(
	entry: CorpusCase,
	offered: string | null,
	dictionaryHit: boolean,
): Verdict {
	if (dictionaryHit) return "not offered";
	if (offered === null) {
		if (entry.acceptable.length === 0) return "correctly silent";
		return entry.intended === null ? "abstained" : "missed";
	}
	return entry.acceptable.includes(offered) ? "correct" : "wrong";
}
