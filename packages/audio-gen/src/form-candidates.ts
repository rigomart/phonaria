import { tokenizePronunciation } from "@phonaria/phonetics-data";

const isVowel = (token: string) => /[012]$/.test(token);
const vowels = (variant: string) => tokenizePronunciation(variant).filter(isVowel);
const consonants = (variant: string) =>
	tokenizePronunciation(variant)
		.filter((token) => !isVowel(token))
		.join(" ");
const primaryStresses = (variant: string) => vowels(variant).filter((v) => v.endsWith("1")).length;

// Vowel pairs most US speakers merge, given the sound after the vowel.
function isMerged(a: string, b: string, next: string | undefined): boolean {
	const pair = [a, b].sort().join("/");
	if (pair === "A/O" || pair === "U/UX") return true; // cot–caught, /u/–/ʊ/
	if (next === "R")
		return ["AE/E", "E/EI", "AE/EI", "I/IX", "O/UX", "OU/UX", "AH/ER"].includes(pair);
	return (next === "N" || next === "M") && pair === "E/IX"; // pin–pen
}

/**
 * Whether another dictionary form differs from the chosen one in a way a learner hears:
 * the main stress moves, or a stressed vowel changes beyond a common US merger.
 */
export function isFormCandidate(chosen: string, other: string): boolean {
	if (vowels(other).length !== vowels(chosen).length) return false;
	if (primaryStresses(other) !== 1 || primaryStresses(chosen) !== 1) return false;
	if (consonants(other) !== consonants(chosen)) return false;
	const mainStress = (variant: string) => vowels(variant).findIndex((v) => v.endsWith("1"));
	if (mainStress(other) !== mainStress(chosen)) return true;
	const a = tokenizePronunciation(chosen);
	const b = tokenizePronunciation(other);
	return a.some((token, index) => {
		if (!isVowel(token) || token === b[index]) return false;
		const [vowelA, stressA] = [token.slice(0, -1), token.slice(-1)];
		const [vowelB, stressB] = [b[index].slice(0, -1), b[index].slice(-1)];
		if (stressA === "0" || stressB === "0" || vowelA === vowelB) return false;
		return !isMerged(vowelA, vowelB, a[index + 1]);
	});
}

/** Candidates reviewed and left out, as "word: VARIANT", by reason. */
export const rejectedForms: Readonly<Record<string, readonly string[]>> = {
	"a proper noun: Nice, Job, the Korean won, places and people": [
		"ana: AE1 N AX0",
		"andrea: A2 N D R EI1 AX0",
		"bangkok: B AE1 NG K A0 K",
		"barack: B AE0 R A1 K",
		"colorado: K A2 L ER0 AE1 D OU0",
		"detroit: D I1 T R OI2 T",
		"eugene: Y U1 J I0 N",
		"eva: I1 V AX0",
		"han: H AE1 N",
		"iran: AI2 R AE1 N",
		"iranian: AI0 R EI1 N I0 AX0 N",
		"iraq: AI2 R A1 K",
		"iraqi: AI2 R AE1 K I0",
		"islam: IX1 S L A2 M",
		"job: J OU1 B",
		"kenya: K I1 N Y AX0",
		"levy: L I1 V I0",
		"milan: M AI1 L AE2 N",
		"moscow: M O1 S K AU2",
		"nevada: N AX0 V AE1 D AX0",
		"nice: N I1 S",
		"reading: R E1 D IX0 NG",
		"reagan: R I1 G AX0 N",
		"roosevelt: R U1 Z AX0 V E2 L T",
		"saudi: S AU1 D I0",
		"sharon: SH AX0 R OU1 N",
		"silva: S E1 L V AX0",
		"uganda: Y U2 G A1 N D A0",
		"won: W A1 N",
	],
	"a dictionary emphasis form: stress moved to a prefix for contrast": [
		"decreased: D I1 K R I2 S T",
		"effect: I1 F E0 K T",
		"effective: I1 F E0 K T IX0 V",
		"effectively: I1 F E0 K T IX0 V L I0",
		"effectiveness: I1 F E0 K T IX0 V N AX0 S",
		"effects: I1 F E0 K T S",
		"eleven: I1 L E0 V AX0 N",
		"emerge: I1 M ER0 J",
		"emerged: I1 M ER0 J D",
		"emergency: I1 M ER0 J AX0 N S I0",
		"emerging: I1 M ER0 J IX0 NG",
		"emotion: I1 M OU2 SH AX0 N",
		"emotional: I1 M OU2 SH AX0 N AX0 L",
		"emotionally: I1 M OU2 SH N AX0 L I0",
		"emotions: I1 M OU0 SH AX0 N Z",
		"increased: IX1 N K R I2 S T",
	],
	"colloquial, regional, British or odd for US English": [
		"as: E1 Z",
		"begun: B EI1 G AX0 N",
		"color: K O1 L ER0",
		"concert: K AX0 N S ER1 T",
		"concerts: K AX0 N S ER1 T S",
		"evolution: I2 V OU0 L U1 SH AX0 N",
		"evolutionary: I2 V OU0 L U1 SH AX0 N E2 R I0",
		"fried: F R I1 D",
		"get: G IX1 T",
		"gets: G IX1 T S",
		"getting: G IX1 T IX0 NG",
		"hostile: H A0 S T AI1 L",
		"impress: IX1 M P R E2 S",
		"kept: K AE1 P T",
		"leverage: L I1 V ER0 IX0 J",
		"museum: M Y U1 Z I0 AX0 M",
		"museums: M Y U1 Z I0 AX0 M Z",
		"rather: R AH1 DH ER0",
		"regular: R EI1 G Y AX0 L ER0",
		"robot: R OU1 B AH2 T",
		"robots: R OU1 B AH2 T S",
		"says: S IX1 Z",
		"specialty: S P EI1 SH AX0 L T I0",
		"tomato: T AX0 M A1 T OU2",
		"tomatoes: T AX0 M A1 T OU0 Z",
		"transferred: T R AE1 N S F ER0 D",
		"umbrella: AH1 M B R E2 L AX0",
		"wifi: W I1 F I2",
		"yourselves: Y O1 R S E0 L V Z",
	],
	"a fragment or abbreviation, or a British spelling": [
		"ca: K A1",
		"de: D EI1",
		"di: D AI1",
		"fi: F I1",
		"hon: H AH1 N",
		"ios: AI1 OU0 S",
		"kilometres: K IX2 L AX0 M I1 T ER0 Z",
		"los: L O1 S",
		"mon: M A1 N",
		"ne: N EI1",
		"re: R I1",
		"seo: S EI1 OU0",
		"vi: V I1",
		"ye: Y E1",
	],
	"a weak form, or the stress the chosen form corrects": [
		"into: IX0 N T U1",
		"sometimes: S AX0 M T AI1 M Z",
	],
	"recorded, but Azure says it the same as the chosen form (#358)": ["because: B IX0 K AH1 Z"],
	"the form a reviewed choice replaced": [
		"costume: K A0 S T U1 M",
		"costumes: K A0 S T U1 M Z",
		"decade: D E0 K EI1 D",
		"decades: D E0 K EI1 D Z",
		"essay: E0 S EI1",
		"essays: E0 S EI1 Z",
		"legit: L E1 J IX0 T",
		"outta: U1 T AX0",
		"presenter: P R E1 Z AX0 N T ER0",
	],
};
