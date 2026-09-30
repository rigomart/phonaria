import type { EnglishPhonemeSymbolId } from "../inventories";
import type { PhonemeContrast, PhonemeContrastMatch } from "../types";

/**
 * English sound contrasts that learners commonly confuse, each with minimal
 * pairs. Pronunciations are not stored here: contrasts.test.ts checks every
 * pair against the curated dictionary so the catalog cannot drift from it.
 *
 * Contrasts carry no authored explanations: Phonaria is a toolbox, so how two
 * sounds differ is shown through the existing articulation data instead.
 */
export const EnglishPhonemeContrasts: PhonemeContrast<"en-us">[] = [
	// Consonants: voice
	{
		id: "p-b",
		phonemeIds: ["P", "B"],
		minimalPairs: [
			{ words: ["pat", "bat"] },
			{ words: ["pack", "back"] },
			{ words: ["pet", "bet"] },
			{ words: ["path", "bath"] },
			{ words: ["pull", "bull"] },
			{ words: ["punch", "bunch"] },
			{ words: ["pin", "bin"] },
			{ words: ["pit", "bit"] },
			{ words: ["pig", "big"] },
			{ words: ["pill", "bill"] },
			{ words: ["pad", "bad"] },
			{ words: ["pump", "bump"] },
			{ words: ["peach", "beach"] },
			{ words: ["park", "bark"] },
			{ words: ["lap", "lab"] },
			{ words: ["cap", "cab"] },
		],
	},
	{
		id: "t-d",
		phonemeIds: ["T", "D"],
		minimalPairs: [
			{ words: ["seat", "seed"] },
			{ words: ["town", "down"] },
			{ words: ["try", "dry"] },
			{ words: ["tie", "die"] },
			{ words: ["tip", "dip"] },
			{ words: ["train", "drain"] },
			{ words: ["set", "said"] },
			{ words: ["sent", "send"] },
			{ words: ["bet", "bed"] },
			{ words: ["feet", "feed"] },
			{ words: ["sat", "sad"] },
			{ words: ["coat", "code"] },
			{ words: ["kit", "kid"] },
			{ words: ["bit", "bid"] },
			{ words: ["bat", "bad"] },
		],
	},
	{
		id: "k-g",
		phonemeIds: ["K", "G"],
		minimalPairs: [
			{ words: ["coat", "goat"] },
			{ words: ["came", "game"] },
			{ words: ["cold", "gold"] },
			{ words: ["class", "glass"] },
			{ words: ["card", "guard"] },
			{ words: ["crew", "grew"] },
			{ words: ["coal", "goal"] },
			{ words: ["cap", "gap"] },
			{ words: ["coast", "ghost"] },
			{ words: ["cave", "gave"] },
			{ words: ["cut", "gut"] },
			{ words: ["clue", "glue"] },
			{ words: ["crow", "grow"] },
			{ words: ["back", "bag"] },
			{ words: ["pick", "pig"] },
		],
	},
	{
		id: "f-v",
		phonemeIds: ["F", "V"],
		minimalPairs: [
			{ words: ["fan", "van"] },
			{ words: ["few", "view"] },
			{ words: ["safe", "save"] },
			{ words: ["proof", "prove"] },
			{ words: ["fast", "vast"] },
			{ words: ["leaf", "leave"] },
			{ words: ["belief", "believe"] },
			{ words: ["fault", "vault"] },
			{ words: ["surf", "serve"] },
			{ words: ["rifle", "rival"] },
		],
	},
	{
		id: "s-z",
		phonemeIds: ["S", "Z"],
		minimalPairs: [
			{ words: ["price", "prize"] },
			{ words: ["sue", "zoo"] },
			{ words: ["ice", "eyes"] },
			{ words: ["race", "raise"] },
			{ words: ["face", "phase"] },
			{ words: ["rice", "rise"] },
			{ words: ["loose", "lose"] },
			{ words: ["bus", "buzz"] },
			{ words: ["niece", "knees"] },
			{ words: ["once", "ones"] },
			{ words: ["gross", "grows"] },
		],
	},
	{
		id: "ch-j",
		phonemeIds: ["CH", "J"],
		minimalPairs: [
			{ words: ["rich", "ridge"] },
			{ words: ["batch", "badge"] },
			{ words: ["search", "surge"] },
		],
	},

	// Consonants: where and how the sound is made
	{
		id: "s-sh",
		phonemeIds: ["S", "SH"],
		minimalPairs: [
			{ words: ["see", "she"] },
			{ words: ["sort", "short"] },
			{ words: ["suit", "shoot"] },
			{ words: ["same", "shame"] },
			{ words: ["seat", "sheet"] },
			{ words: ["sell", "shell"] },
			{ words: ["sue", "shoe"] },
			{ words: ["sign", "shine"] },
			{ words: ["self", "shelf"] },
			{ words: ["sore", "shore"] },
			{ words: ["save", "shave"] },
			{ words: ["sigh", "shy"] },
			{ words: ["sake", "shake"] },
			{ words: ["class", "clash"] },
		],
	},
	{
		id: "ch-sh",
		phonemeIds: ["CH", "SH"],
		minimalPairs: [
			{ words: ["cheap", "sheep"] },
			{ words: ["chair", "share"] },
			{ words: ["choose", "shoes"] },
			{ words: ["chip", "ship"] },
			{ words: ["cheat", "sheet"] },
			{ words: ["chop", "shop"] },
			{ words: ["catch", "cash"] },
			{ words: ["witch", "wish"] },
			{ words: ["ditch", "dish"] },
			{ words: ["batch", "bash"] },
			{ words: ["watching", "washing"] },
		],
	},
	{
		id: "th-t",
		phonemeIds: ["TH", "T"],
		minimalPairs: [
			{ words: ["thin", "tin"] },
			{ words: ["three", "tree"] },
			{ words: ["through", "true"] },
			{ words: ["thought", "taught"] },
			{ words: ["theme", "team"] },
			{ words: ["thank", "tank"] },
			{ words: ["thick", "tick"] },
			{ words: ["both", "boat"] },
			{ words: ["death", "debt"] },
			{ words: ["faith", "fate"] },
			{ words: ["bath", "bat"] },
			{ words: ["path", "pat"] },
			{ words: ["booth", "boot"] },
			{ words: ["tenth", "tent"] },
		],
	},
	{
		id: "th-s",
		phonemeIds: ["TH", "S"],
		minimalPairs: [
			{ words: ["thin", "sin"] },
			{ words: ["thing", "sing"] },
			{ words: ["think", "sink"] },
			{ words: ["thick", "sick"] },
			{ words: ["theme", "seem"] },
			{ words: ["faith", "face"] },
			{ words: ["path", "pass"] },
			{ words: ["mouth", "mouse"] },
			{ words: ["math", "mass"] },
			{ words: ["myth", "miss"] },
			{ words: ["tenth", "tense"] },
		],
	},
	{
		id: "dh-d",
		phonemeIds: ["DH", "D"],
		minimalPairs: [
			{ words: ["they", "day"] },
			{ words: ["then", "den"] },
			{ words: ["though", "dough"] },
			{ words: ["breathe", "breed"] },
		],
	},
	{
		id: "dh-z",
		phonemeIds: ["DH", "Z"],
		minimalPairs: [{ words: ["breathe", "breeze"] }, { words: ["clothing", "closing"] }],
	},
	{
		id: "n-ng",
		phonemeIds: ["N", "NG"],
		minimalPairs: [
			{ words: ["sin", "sing"] },
			{ words: ["win", "wing"] },
			{ words: ["thin", "thing"] },
			{ words: ["son", "sung"] },
		],
	},
	{
		id: "m-n",
		phonemeIds: ["M", "N"],
		minimalPairs: [
			{ words: ["sum", "sun"] },
			{ words: ["might", "night"] },
			{ words: ["mine", "nine"] },
			{ words: ["met", "net"] },
			{ words: ["moon", "noon"] },
			{ words: ["meet", "neat"] },
			{ words: ["map", "nap"] },
			{ words: ["seem", "seen"] },
			{ words: ["game", "gain"] },
			{ words: ["team", "teen"] },
			{ words: ["beam", "bean"] },
			{ words: ["scream", "screen"] },
			{ words: ["gum", "gun"] },
		],
	},
	{
		id: "w-v",
		phonemeIds: ["W", "V"],
		minimalPairs: [
			{ words: ["worse", "verse"] },
			{ words: ["wet", "vet"] },
			{ words: ["went", "vent"] },
		],
	},
	{
		id: "l-r",
		phonemeIds: ["L", "R"],
		minimalPairs: [
			{ words: ["led", "red"] },
			{ words: ["light", "right"] },
			{ words: ["long", "wrong"] },
			{ words: ["late", "rate"] },
			{ words: ["lock", "rock"] },
			{ words: ["lane", "rain"] },
			{ words: ["load", "road"] },
			{ words: ["lip", "rip"] },
			{ words: ["play", "pray"] },
			{ words: ["glass", "grass"] },
			{ words: ["lay", "ray"] },
			{ words: ["flesh", "fresh"] },
			{ words: ["cloud", "crowd"] },
			{ words: ["clue", "crew"] },
			{ words: ["liver", "river"] },
		],
	},
	{
		id: "y-j",
		phonemeIds: ["Y", "J"],
		minimalPairs: [{ words: ["yet", "jet"] }, { words: ["yell", "gel"] }],
	},
	{
		id: "b-v",
		phonemeIds: ["B", "V"],
		minimalPairs: [
			{ words: ["boat", "vote"] },
			{ words: ["ban", "van"] },
			{ words: ["bet", "vet"] },
			{ words: ["bent", "vent"] },
			{ words: ["berry", "very"] },
			{ words: ["curb", "curve"] },
		],
	},

	// Vowels
	{
		id: "i-ix",
		phonemeIds: ["I", "IX"],
		minimalPairs: [
			{ words: ["seat", "sit"] },
			{ words: ["sheep", "ship"] },
			{ words: ["beat", "bit"] },
			{ words: ["feet", "fit"] },
			{ words: ["heat", "hit"] },
			{ words: ["seek", "sick"] },
			{ words: ["peak", "pick"] },
			{ words: ["cheap", "chip"] },
			{ words: ["sleep", "slip"] },
			{ words: ["deep", "dip"] },
			{ words: ["bean", "bin"] },
			{ words: ["cheek", "chick"] },
			{ words: ["least", "list"] },
			{ words: ["teen", "tin"] },
			{ words: ["leak", "lick"] },
		],
	},
	{
		id: "u-ux",
		phonemeIds: ["U", "UX"],
		minimalPairs: [{ words: ["pool", "pull"] }, { words: ["fool", "full"] }],
	},
	{
		id: "e-ae",
		phonemeIds: ["E", "AE"],
		minimalPairs: [
			{ words: ["bed", "bad"] },
			{ words: ["dead", "dad"] },
			{ words: ["set", "sat"] },
			{ words: ["mess", "mass"] },
			{ words: ["bet", "bat"] },
			{ words: ["pet", "pat"] },
			{ words: ["flesh", "flash"] },
			{ words: ["guess", "gas"] },
			{ words: ["wreck", "rack"] },
			{ words: ["trek", "track"] },
			{ words: ["led", "lad"] },
		],
	},
	{
		id: "ae-ah",
		phonemeIds: ["AE", "AH"],
		minimalPairs: [
			{ words: ["cat", "cut"] },
			{ words: ["cap", "cup"] },
			{ words: ["match", "much"] },
			{ words: ["staff", "stuff"] },
			{ words: ["lack", "luck"] },
			{ words: ["track", "truck"] },
			{ words: ["crash", "crush"] },
			{ words: ["mad", "mud"] },
			{ words: ["bad", "bud"] },
			{ words: ["stack", "stuck"] },
			{ words: ["hat", "hut"] },
			{ words: ["flash", "flush"] },
			{ words: ["back", "buck"] },
			{ words: ["tab", "tub"] },
		],
	},
	{
		id: "ae-a",
		phonemeIds: ["AE", "A"],
		minimalPairs: [
			{ words: ["black", "block"] },
			{ words: ["hat", "hot"] },
			{ words: ["lack", "lock"] },
			{ words: ["add", "odd"] },
			{ words: ["cap", "cop"] },
			{ words: ["pat", "pot"] },
			{ words: ["stack", "stock"] },
			{ words: ["rack", "rock"] },
			{ words: ["adapt", "adopt"] },
		],
	},
	{
		id: "ux-ah",
		phonemeIds: ["UX", "AH"],
		minimalPairs: [{ words: ["look", "luck"] }, { words: ["book", "buck"] }],
	},
	{
		id: "ah-a",
		phonemeIds: ["AH", "A"],
		minimalPairs: [
			{ words: ["cup", "cop"] },
			{ words: ["shut", "shot"] },
			{ words: ["stuck", "stock"] },
			{ words: ["luck", "lock"] },
			{ words: ["nut", "not"] },
			{ words: ["gut", "got"] },
			{ words: ["rub", "rob"] },
			{ words: ["hut", "hot"] },
			{ words: ["buddy", "body"] },
			{ words: ["fund", "fond"] },
		],
	},

	// Diphthongs
	{
		id: "ai-ei",
		phonemeIds: ["AI", "EI"],
		minimalPairs: [
			{ words: ["light", "late"] },
			{ words: ["like", "lake"] },
			{ words: ["right", "rate"] },
			{ words: ["die", "day"] },
			{ words: ["buy", "bay"] },
			{ words: ["lie", "lay"] },
			{ words: ["line", "lane"] },
			{ words: ["rice", "race"] },
			{ words: ["type", "tape"] },
			{ words: ["fight", "fate"] },
			{ words: ["pie", "pay"] },
			{ words: ["ride", "raid"] },
			{ words: ["ice", "ace"] },
			{ words: ["bike", "bake"] },
			{ words: ["bite", "bait"] },
			{ words: ["might", "mate"] },
			{ words: ["pine", "pain"] },
		],
	},
	{
		id: "ou-au",
		phonemeIds: ["OU", "AU"],
		minimalPairs: [
			{ words: ["know", "now"] },
			{ words: ["load", "loud"] },
			{ words: ["tone", "town"] },
			{ words: ["coach", "couch"] },
			{ words: ["boat", "bout"] },
		],
	},
];

/**
 * Contrasts indexed under each of their two phonemes. Pairs are flipped for
 * the second phoneme so words[0] always contains the phoneme looked up.
 */
export const EnglishContrastsByPhonemeId: Partial<
	Record<EnglishPhonemeSymbolId, PhonemeContrastMatch<"en-us">[]>
> = (() => {
	const record: Partial<Record<EnglishPhonemeSymbolId, PhonemeContrastMatch<"en-us">[]>> = {};

	const addEntry = (phonemeId: EnglishPhonemeSymbolId, entry: PhonemeContrastMatch<"en-us">) => {
		const existing = record[phonemeId];
		if (existing) {
			existing.push(entry);
		} else {
			record[phonemeId] = [entry];
		}
	};

	for (const contrast of EnglishPhonemeContrasts) {
		const [leftId, rightId] = contrast.phonemeIds;

		addEntry(leftId, {
			contrastId: contrast.id,
			partnerId: rightId,
			minimalPairs: contrast.minimalPairs,
		});
		addEntry(rightId, {
			contrastId: contrast.id,
			partnerId: leftId,
			minimalPairs: contrast.minimalPairs.map(({ words: [left, right] }) => ({
				words: [right, left],
			})),
		});
	}

	return record;
})();
