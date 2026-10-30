/**
 * The en-us contrast catalog as pages, one per contrast at
 * `/minimal-pairs/<contrast id>`: its two sounds, every pair, and a line in
 * plain words on how the sounds differ, built from the articulation data
 * since the catalog holds no written explanations.
 */
import {
	type EnglishPhonemeSymbolId,
	EnglishPhonemeContrasts,
	formatPhonemeLabel,
	getIpaForPhonemeId,
	getPhonemeArticulationRegistryForLanguage,
	getPhonemeCategory,
	type ConsonantArticulation,
	type DiphthongVowelArticulation,
	type PhonemeArticulation,
	type PhonemeCategory,
} from "@phonaria/phonetics-data";
import { MinimalPairActivity } from "@/lib/practice/minimal-pair-activity";

export interface ContrastPageSound {
	id: EnglishPhonemeSymbolId;
	ipa: string;
	/** Its articulation label, e.g. "Voiceless dental fricative". */
	label: string;
}

export interface ContrastPage {
	id: string;
	category: PhonemeCategory;
	sounds: readonly [ContrastPageSound, ContrastPageSound];
	/** Every pair in the catalog, words in the same order as `sounds`. */
	pairs: readonly (readonly [string, string])[];
	/** How the two sounds differ, e.g. "/p/ is made with the voice off. /b/ is made with the voice on. Everything else is the same." */
	difference: string;
}

export function contrastPagePath(contrastId: string): string {
	return `${MinimalPairActivity.path}/${contrastId}`;
}

/** A contrast page's URL, with the practice word when there is one. */
export function contrastPageHref(contrastId: string, word?: string): string {
	const path = contrastPagePath(contrastId);
	return word ? `${path}?${new URLSearchParams({ word })}` : path;
}

let pages: ReadonlyMap<string, ContrastPage> | undefined;

function contrastPages(): ReadonlyMap<string, ContrastPage> {
	pages ??= new Map(
		EnglishPhonemeContrasts.map((contrast) => {
			const [first, second] = contrast.phonemeIds;
			const page: ContrastPage = {
				id: contrast.id,
				category: getPhonemeCategory(first),
				sounds: [pageSound(first), pageSound(second)],
				pairs: contrast.minimalPairs.map((pair) => pair.words),
				difference: describeDifference(first, second),
			};
			return [contrast.id, page];
		}),
	);
	return pages;
}

export function getContrastPage(contrastId: string): ContrastPage | undefined {
	return contrastPages().get(contrastId);
}

/** Catalog order, which groups consonants before vowels. */
export function listContrastPagePaths(): string[] {
	return [...contrastPages().keys()].map(contrastPagePath);
}

function pageSound(id: EnglishPhonemeSymbolId): ContrastPageSound {
	return { id, ipa: getIpaForPhonemeId(id), label: formatPhonemeLabel("en-us", id) };
}

function articulation(id: EnglishPhonemeSymbolId): PhonemeArticulation {
	return (
		getPhonemeArticulationRegistryForLanguage("en-us") as Record<
			EnglishPhonemeSymbolId,
			PhonemeArticulation
		>
	)[id];
}

const CONSONANT_WORDS: Record<string, string> = {
	voiced: "with the voice on",
	voiceless: "with the voice off",
	bilabial: "with both lips",
	labiodental: "with the top teeth on the lower lip",
	dental: "with the tongue between the teeth",
	alveolar: "with the tongue tip on the gum ridge behind the top teeth",
	postalveolar: "with the tongue just behind the gum ridge",
	palatal: "with the middle of the tongue raised to the roof of the mouth",
	velar: "with the back of the tongue raised",
	"labial-velar": "with rounded lips and the back of the tongue raised",
	glottal: "in the throat",
	plosive: "stopping the air and releasing it",
	fricative: "pushing air through a narrow gap",
	affricate: "stopping the air and releasing it as a hiss",
	nasal: "sending air through the nose",
	approximant: "letting air flow smoothly",
	"lateral-approximant": "letting air flow past the sides of the tongue",
	tap: "tapping the tongue once",
	trill: "letting the tongue vibrate",
};

const HEIGHTS_CLOSE_TO_OPEN = [
	"close",
	"near-close",
	"close-mid",
	"mid",
	"open-mid",
	"near-open",
	"open",
];
const BACKNESS_FRONT_TO_BACK = ["front", "near-front", "central", "near-back", "back"];

function describeConsonants(
	[firstIpa, secondIpa]: readonly [string, string],
	a: ConsonantArticulation,
	b: ConsonantArticulation,
): string {
	const keys = (["place", "manner", "voicing"] as const).filter(
		(key) => a.features[key] !== b.features[key],
	);
	const made = (ipa: string, { features }: ConsonantArticulation) => {
		const words = keys.map((key) => CONSONANT_WORDS[features[key]] ?? features[key]);
		return `/${ipa}/ is made ${keys[0] === "manner" ? "by " : ""}${words.join(", ")}.`;
	};
	const sentences = [made(firstIpa, a), made(secondIpa, b)];
	if (keys.length < 3) sentences.push("Everything else is the same.");
	return sentences.join(" ");
}

function vowelShift(
	from: { height: string; backness: string; roundness: string },
	to: { height: string; backness: string; roundness: string },
): string[] {
	const shifts: string[] = [];
	const height =
		HEIGHTS_CLOSE_TO_OPEN.indexOf(to.height) - HEIGHTS_CLOSE_TO_OPEN.indexOf(from.height);
	if (height !== 0) shifts.push(`the mouth ${height > 0 ? "more" : "less"} open`);
	const backness =
		BACKNESS_FRONT_TO_BACK.indexOf(to.backness) - BACKNESS_FRONT_TO_BACK.indexOf(from.backness);
	if (backness !== 0) shifts.push(`the tongue further ${backness > 0 ? "back" : "forward"}`);
	if (to.roundness !== from.roundness) {
		shifts.push(to.roundness === "rounded" ? "the lips rounded" : "the lips relaxed");
	}
	return shifts;
}

function joinWithAnd(parts: readonly string[]): string {
	return parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}` : parts.join("");
}

function describeDifference(first: EnglishPhonemeSymbolId, second: EnglishPhonemeSymbolId): string {
	const ipas = [getIpaForPhonemeId(first), getIpaForPhonemeId(second)] as const;
	const a = articulation(first);
	const b = articulation(second);

	if (a.category === "consonant" && b.category === "consonant") {
		return describeConsonants(ipas, a, b);
	}
	if (a.category === "vowel" && b.category === "vowel" && a.vowelType === b.vowelType) {
		const start = vowelShift(a.features, b.features);
		if (a.vowelType === "monophthong") {
			return `Compared with /${ipas[0]}/, /${ipas[1]}/ is said with ${joinWithAnd(start)}.`;
		}
		const ending = ({ features }: DiphthongVowelArticulation) => ({
			height: features.targetHeight,
			backness: features.targetBackness,
			roundness: features.targetRoundness,
		});
		const end = vowelShift(ending(a), ending(b as DiphthongVowelArticulation));
		const said = [
			start.length > 0 ? `starts with ${joinWithAnd(start)}` : "",
			end.length > 0 ? `ends with ${joinWithAnd(end)}` : "",
		]
			.filter(Boolean)
			.join(" and ");
		return `Compared with /${ipas[0]}/, /${ipas[1]}/ ${said}.${end.length > 0 ? "" : " Both end the same way."}`;
	}

	return `/${ipas[0]}/: ${formatPhonemeLabel("en-us", first)}. /${ipas[1]}/: ${formatPhonemeLabel("en-us", second)}.`;
}
