type Form = { variant: string; label: string };

/**
 * Recordings beyond a word's chosen form: a heteronym's labelled meanings, or "also said"
 * forms. `n` is the file suffix (minute--2.ogg); once published, an n must keep its sound.
 */
export type WordForms = { primary?: Form; extra: readonly (Form & { n: number })[] };

const meanings = (primary: Form, ...extra: Form[]): WordForms => ({
	primary,
	extra: extra.map((form, index) => ({ ...form, n: index + 2 })),
});
const nounVerb = (noun: string, verb: string, moreCommon: "noun" | "verb" = "noun") =>
	moreCommon === "noun"
		? meanings({ variant: noun, label: "noun" }, { variant: verb, label: "verb" })
		: meanings({ variant: verb, label: "verb" }, { variant: noun, label: "noun" });
const alsoSaid = (variant: string): WordForms => ({
	extra: [{ variant, label: "also said", n: 2 }],
});

export const wordForms: Readonly<Record<string, WordForms>> = {
	bass: meanings(
		{ variant: "B EI1 S", label: "low sound" },
		{ variant: "B AE1 S", label: "the fish" },
	),
	bow: meanings(
		{ variant: "B AU1", label: "to bend forward" },
		{ variant: "B OU1", label: "a ribbon or weapon" },
	),
	close: meanings(
		{ variant: "K L OU1 Z", label: "to shut" },
		{ variant: "K L OU1 S", label: "near" },
	),
	contrary: meanings(
		{ variant: "K A1 N T R E0 R I0", label: "opposite" },
		{ variant: "K AX0 N T R E1 R I0", label: "stubborn" },
	),
	content: meanings(
		{ variant: "K A1 N T E0 N T", label: "what something holds" },
		{ variant: "K AX0 N T E1 N T", label: "satisfied" },
	),
	contents: meanings(
		{ variant: "K A1 N T E0 N T S", label: "what something holds" },
		{ variant: "K AX0 N T E1 N T S", label: "satisfies" },
	),
	invalid: meanings(
		{ variant: "IX2 N V AE1 L AX0 D", label: "not valid" },
		{ variant: "IX1 N V AX0 L AX0 D", label: "a sick person" },
	),
	lead: meanings(
		{ variant: "L I1 D", label: "to guide" },
		{ variant: "L E1 D", label: "the metal" },
	),
	live: meanings({ variant: "L IX1 V", label: "verb" }, { variant: "L AI1 V", label: "adjective" }),
	lived: meanings(
		{ variant: "L IX1 V D", label: "past of live" },
		{ variant: "L AI1 V D", label: "as in long-lived" },
	),
	lives: meanings(
		{ variant: "L AI1 V Z", label: "plural of life" },
		{ variant: "L IX1 V Z", label: "verb" },
	),
	minute: meanings(
		{ variant: "M IX1 N AX0 T", label: "60 seconds" },
		{ variant: "M AI0 N U1 T", label: "tiny" },
	),
	polish: meanings(
		{ variant: "P A1 L IX0 SH", label: "to shine" },
		{ variant: "P OU1 L IX0 SH", label: "from Poland" },
	),
	putting: meanings(
		{ variant: "P UX1 T IX0 NG", label: "from put" },
		{ variant: "P AH1 T IX0 NG", label: "in golf" },
	),
	read: meanings(
		{ variant: "R I1 D", label: "present tense" },
		{ variant: "R E1 D", label: "past tense" },
	),
	tear: meanings(
		{ variant: "T IX1 R", label: "from crying" },
		{ variant: "T E1 R", label: "to rip" },
	),
	tearing: meanings(
		{ variant: "T E1 R IX0 NG", label: "ripping" },
		{ variant: "T IX1 R IX0 NG", label: "crying" },
	),
	tears: meanings(
		{ variant: "T IX1 R Z", label: "from crying" },
		{ variant: "T E1 R Z", label: "rips" },
	),
	use: meanings({ variant: "Y U1 Z", label: "verb" }, { variant: "Y U1 S", label: "noun" }),
	// The dictionary lacks "used to"; written by hand.
	used: meanings(
		{ variant: "Y U1 Z D", label: "past of use" },
		{ variant: "Y U1 S T", label: "as in used to" },
	),
	wind: meanings(
		{ variant: "W IX1 N D", label: "moving air" },
		{ variant: "W AI1 N D", label: "to turn" },
	),
	winds: meanings(
		{ variant: "W IX1 N D Z", label: "moving air" },
		{ variant: "W AI1 N D Z", label: "turns" },
	),
	wound: meanings(
		{ variant: "W U1 N D", label: "an injury" },
		{ variant: "W AU1 N D", label: "past of wind" },
	),
	perfect: meanings(
		{ variant: "P ER1 F IX2 K T", label: "adjective" },
		{ variant: "P ER0 F E1 K T", label: "verb" },
	),
	present: meanings(
		{ variant: "P R E1 Z AX0 N T", label: "noun or adjective" },
		{ variant: "P R I0 Z E1 N T", label: "verb" },
	),
	presents: nounVerb("P R E1 Z AX0 N T S", "P R I0 Z E1 N T S"),
	complex: meanings(
		{ variant: "K A1 M P L E0 K S", label: "noun" },
		{ variant: "K AX0 M P L E1 K S", label: "adjective" },
	),
	compact: meanings(
		{ variant: "K AX0 M P AE1 K T", label: "adjective" },
		{ variant: "K A1 M P AE0 K T", label: "noun" },
	),
	abstract: meanings(
		{ variant: "AE1 B S T R AE2 K T", label: "noun or adjective" },
		{ variant: "AE0 B S T R AE1 K T", label: "verb" },
	),
	desert: meanings(
		{ variant: "D E1 Z ER0 T", label: "dry land" },
		{ variant: "D IX0 Z ER1 T", label: "to abandon" },
	),
	accent: nounVerb("AE1 K S E2 N T", "AX0 K S E1 N T"),
	address: nounVerb("AE1 D R E2 S", "AX0 D R E1 S"),
	// The dictionary stresses both syllables of the noun; written by hand.
	addresses: nounVerb("AE1 D R E2 S IX0 Z", "AX0 D R E1 S IX0 Z"),
	allies: nounVerb("AE1 L AI0 Z", "AX0 L AI1 Z"),
	ally: nounVerb("AE1 L AI0", "AX0 L AI1"),
	attribute: nounVerb("AE1 T R AX0 B Y U2 T", "AX0 T R IX1 B Y U2 T"),
	attributes: nounVerb("AE1 T R AX0 B Y U2 T S", "AX0 T R IX1 B Y U2 T S"),
	combat: nounVerb("K A1 M B AE0 T", "K AX0 M B AE1 T"),
	combine: nounVerb("K A1 M B AI0 N", "K AX0 M B AI1 N", "verb"),
	compound: nounVerb("K A1 M P AU0 N D", "K AX0 M P AU1 N D"),
	compounds: nounVerb("K A1 M P AU0 N D Z", "K AX0 M P AU1 N D Z"),
	conduct: nounVerb("K A1 N D AX0 K T", "K A0 N D AH1 K T"),
	conflict: nounVerb("K A1 N F L IX0 K T", "K AX0 N F L IX1 K T"),
	conflicts: nounVerb("K A1 N F L IX0 K T S", "K AX0 N F L IX1 K T S"),
	console: nounVerb("K A1 N S OU0 L", "K AX0 N S OU1 L"),
	construct: nounVerb("K A1 N S T R AX0 K T", "K AX0 N S T R AH1 K T", "verb"),
	contest: nounVerb("K A1 N T E0 S T", "K AX0 N T E1 S T"),
	contract: nounVerb("K A1 N T R AE2 K T", "K AX0 N T R AE1 K T"),
	contracts: nounVerb("K A1 N T R AE2 K T S", "K AX0 N T R AE1 K T S"),
	contrast: nounVerb("K A1 N T R AE0 S T", "K AX0 N T R AE1 S T"),
	convert: nounVerb("K A1 N V ER0 T", "K AX0 N V ER1 T", "verb"),
	decrease: nounVerb("D I1 K R I2 S", "D IX0 K R I1 S", "verb"),
	defects: nounVerb("D I1 F E0 K T S", "D IX0 F E1 K T S"),
	discharge: nounVerb("D IX1 S CH A2 R J", "D IX0 S CH A1 R J", "verb"),
	discount: nounVerb("D IX1 S K AU0 N T", "D IX0 S K AU1 N T"),
	discounts: nounVerb("D IX1 S K AU2 N T S", "D IX0 S K AU1 N T S"),
	escort: nounVerb("E1 S K O0 R T", "E0 S K O1 R T"),
	exploit: nounVerb("E1 K S P L OI2 T", "E2 K S P L OI1 T", "verb"),
	extract: nounVerb("E1 K S T R AE2 K T", "IX0 K S T R AE1 K T", "verb"),
	impact: nounVerb("IX1 M P AE0 K T", "IX2 M P AE1 K T"),
	impacts: nounVerb("IX1 M P AE0 K T S", "IX2 M P AE1 K T S"),
	import: nounVerb("IX1 M P O2 R T", "IX2 M P O1 R T"),
	imports: nounVerb("IX1 M P O2 R T S", "IX2 M P O1 R T S"),
	increase: nounVerb("IX1 N K R I2 S", "IX2 N K R I1 S", "verb"),
	increases: nounVerb("IX1 N K R I2 S IX0 Z", "IX0 N K R I1 S AX0 Z", "verb"),
	insert: nounVerb("IX1 N S ER2 T", "IX2 N S ER1 T", "verb"),
	insult: nounVerb("IX1 N S AH2 L T", "IX2 N S AH1 L T"),
	object: nounVerb("A1 B J E0 K T", "AX0 B J E1 K T"),
	objects: nounVerb("A1 B J E0 K T S", "AX0 B J E1 K T S"),
	offset: nounVerb("O1 F S E2 T", "O0 F S E1 T", "verb"),
	permit: nounVerb("P ER1 M IX2 T", "P ER0 M IX1 T", "verb"),
	permits: nounVerb("P ER1 M IX2 T S", "P ER0 M IX1 T S"),
	produce: nounVerb("P R OU1 D U0 S", "P R AX0 D U1 S", "verb"),
	progress: nounVerb("P R A1 G R E2 S", "P R AX0 G R E1 S"),
	project: nounVerb("P R A1 J E0 K T", "P R AX0 J E1 K T"),
	projects: nounVerb("P R A1 J E0 K T S", "P R AX0 J E1 K T S"),
	protest: nounVerb("P R OU1 T E2 S T", "P R AX0 T E1 S T"),
	protests: nounVerb("P R OU1 T E2 S T S", "P R AX0 T E1 S T S"),
	rebel: nounVerb("R E1 B AX0 L", "R IX0 B E1 L"),
	rebels: nounVerb("R E1 B AX0 L Z", "R IX0 B E1 L Z"),
	recall: nounVerb("R I1 K O2 L", "R IX0 K O1 L", "verb"),
	record: nounVerb("R E1 K ER0 D", "R IX0 K O1 R D"),
	records: nounVerb("R E1 K ER0 D Z", "R IX0 K O1 R D Z"),
	refund: nounVerb("R I1 F AH2 N D", "R IX0 F AH1 N D"),
	// The dictionary's noun ends in /z/; refuse (garbage) ends in /s/. Written by hand.
	refuse: nounVerb("R E1 F Y U2 S", "R IX0 F Y U1 Z", "verb"),
	reject: nounVerb("R I1 J E0 K T", "R IX0 J E1 K T", "verb"),
	reset: nounVerb("R I1 S E0 T", "R I0 S E1 T", "verb"),
	segment: nounVerb("S E1 G M AX0 N T", "S E2 G M E1 N T"),
	segments: nounVerb("S E1 G M AX0 N T S", "S E2 G M E1 N T S"),
	subject: nounVerb("S AH1 B J IX0 K T", "S AX0 B J E1 K T"),
	subjects: nounVerb("S AH1 B J IX0 K T S", "S AX0 B J E1 K T S"),
	supplement: nounVerb("S AH1 P L AX0 M AX0 N T", "S AH2 P L AX0 M E1 N T"),
	survey: nounVerb("S ER1 V EI2", "S ER0 V EI1"),
	surveys: nounVerb("S ER1 V EI2 Z", "S ER0 V EI1 Z"),
	suspect: nounVerb("S AH1 S P E2 K T", "S AX0 S P E1 K T", "verb"),
	suspects: nounVerb("S AH1 S P E2 K T S", "S AX0 S P E1 K T S"),
	transfer: nounVerb("T R AE1 N S F ER0", "T R AE0 N S F ER1", "verb"),
	transfers: nounVerb("T R AE1 N S F ER0 Z", "T R AE0 N S F ER1 Z"),
	transform: nounVerb("T R AE1 N S F O0 R M", "T R AE0 N S F O1 R M", "verb"),
	transport: nounVerb("T R AE1 N S P O0 R T", "T R AE0 N S P O1 R T"),
	update: nounVerb("AH1 P D EI2 T", "AX0 P D EI1 T"),
	updates: nounVerb("AH1 P D EI2 T S", "AX0 P D EI1 T S"),
	// The dictionary stresses both syllables of the noun; written by hand.
	upgrade: nounVerb("AH1 P G R EI2 D", "AX0 P G R EI1 D"),
	upgrades: nounVerb("AH1 P G R EI2 D Z", "AX0 P G R EI1 D Z"),
	upset: meanings(
		{ variant: "AX0 P S E1 T", label: "verb or adjective" },
		{ variant: "AH1 P S E2 T", label: "noun" },
	),

	adult: alsoSaid("AE1 D AX0 L T"),
	adults: alsoSaid("AE1 D AX0 L T S"),
	adverse: alsoSaid("AE1 D V ER2 S"),
	advertisement: alsoSaid("AE2 D V ER0 T AI1 Z M AX0 N T"),
	again: alsoSaid("AX0 G EI1 N"),
	against: alsoSaid("AX0 G EI1 N S T"),
	allied: alsoSaid("AE1 L AI2 D"),
	anti: alsoSaid("AE1 N T AI2"),
	aunt: alsoSaid("O1 N T"),
	automobile: alsoSaid("O2 T AX0 M OU0 B I1 L"),
	because: alsoSaid("B IX0 K AH1 Z"),
	cannot: alsoSaid("K AX0 N A1 T"),
	concrete: alsoSaid("K A1 N K R I0 T"),
	data: alsoSaid("D AE1 T AX0"),
	database: alsoSaid("D AE1 T AX0 B EI2 S"),
	debut: alsoSaid("D EI1 B Y U0"),
	detail: alsoSaid("D I1 T EI0 L"),
	details: alsoSaid("D I1 T EI0 L Z"),
	economic: alsoSaid("I2 K AX0 N A1 M IX0 K"),
	economically: alsoSaid("I2 K AX0 N A1 M IX0 K L I0"),
	economics: alsoSaid("I2 K AX0 N A1 M IX0 K S"),
	either: alsoSaid("AI1 DH ER0"),
	era: alsoSaid("IX1 R AX0"),
	evolution: alsoSaid("I2 V AX0 L U1 SH AX0 N"),
	evolutionary: alsoSaid("I2 V AX0 L U1 SH AX0 N E2 R I0"),
	excess: alsoSaid("IX0 K S E1 S"),
	finance: alsoSaid("F AI1 N AE2 N S"),
	finances: alsoSaid("F AI1 N AE2 N S IX0 Z"),
	inherent: alsoSaid("IX0 N H E1 R AX0 N T"),
	inside: alsoSaid("IX1 N S AI2 D"),
	kilometers: alsoSaid("K IX1 L AX0 M I2 T ER0 Z"),
	leisure: alsoSaid("L I1 ZH ER0"),
	madame: alsoSaid("M AX0 D AE1 M"),
	neither: alsoSaid("N AI1 DH ER0"),
	omega: alsoSaid("OU0 M EI1 G AX0"),
	plaza: alsoSaid("P L AE1 Z AX0"),
	really: alsoSaid("R I1 L I0"),
	research: alsoSaid("R I1 S ER0 CH"),
	romance: alsoSaid("R OU1 M AE0 N S"),
	route: alsoSaid("R AU1 T"),
	routes: alsoSaid("R AU1 T S"),
	status: alsoSaid("S T EI1 T AX0 S"),
	submarine: alsoSaid("S AH2 B M ER0 I1 N"),
	sunday: alsoSaid("S AH1 N D I2"),
	updated: alsoSaid("AH1 P D EI2 T IX0 D"),
	upgraded: alsoSaid("AH1 P G R EI2 D IX0 D"),
	via: alsoSaid("V I1 AX0"),
};

/** The recording's file name without extension: the word, or word--n for an extra form. */
export const formSlug = (word: string, n?: number) => (n ? `${word}--${n}` : word);
export const isPlainWord = (word: string) => /^[a-z]+$/.test(word);
export const isFormSlug = (slug: string) => /^[a-z]+(--[2-9])?$/.test(slug);
