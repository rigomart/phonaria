import { type DefaultTreeAdapterMap, defaultTreeAdapter, parseFragment } from "parse5";
import {
	type DefinitionSense,
	type DefinitionSenseGroup,
	MAX_SENSES_PER_POS,
	MAX_SENSES_TOTAL,
} from "./contract";

const MAX_WIKTIONARY_ENTRIES = 64;
const MAX_DEFINITIONS_PER_ENTRY = 256;
const MAX_EXAMPLE_CANDIDATES = 16;
const MAX_HTML_FRAGMENT_LENGTH = 20_000;
const MAX_DEFINITION_TEXT_LENGTH = 1_000;
const MAX_EXAMPLE_TEXT_LENGTH = 500;
const MAX_PART_OF_SPEECH_LENGTH = 64;
const NON_CONTENT_ELEMENTS = new Set([
	"audio",
	"button",
	"canvas",
	"datalist",
	"embed",
	"figure",
	"iframe",
	"img",
	"link",
	"meta",
	"noscript",
	"object",
	"picture",
	"script",
	"select",
	"style",
	"svg",
	"table",
	"template",
	"textarea",
	"video",
]);
const NON_CONTENT_CLASSES = new Set([
	"mw-cite-backlink",
	"mw-references-wrap",
	"reference",
	"references",
	"reflist",
]);
const TEXT_BOUNDARY_ELEMENTS = new Set([
	"address",
	"article",
	"aside",
	"blockquote",
	"dd",
	"div",
	"dl",
	"dt",
	"fieldset",
	"footer",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"header",
	"hr",
	"li",
	"main",
	"nav",
	"p",
	"pre",
	"section",
]);
const NESTED_SENSE_LISTS = new Set(["ol", "ul"]);

export type WiktionarySense = {
	definition: string;
	example?: string;
};

export type WiktionaryMeaning = {
	partOfSpeech: string;
	definitions: WiktionarySense[];
};

function asTrimmedString(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

type HtmlNode = DefaultTreeAdapterMap["childNode"];

function hasNonContentClass(node: DefaultTreeAdapterMap["element"]): boolean {
	const className = node.attrs.find((attribute) => attribute.name === "class")?.value;
	return className?.split(/\s+/u).some((token) => NON_CONTENT_CLASSES.has(token)) ?? false;
}

function appendText(node: HtmlNode, parts: string[], omitNestedSenseLists: boolean): void {
	if (defaultTreeAdapter.isTextNode(node)) {
		parts.push(node.value);
		return;
	}
	if (!defaultTreeAdapter.isElementNode(node)) return;
	if (
		NON_CONTENT_ELEMENTS.has(node.tagName) ||
		hasNonContentClass(node) ||
		(omitNestedSenseLists && NESTED_SENSE_LISTS.has(node.tagName))
	) {
		return;
	}

	const hasTextBoundary = node.tagName === "br" || TEXT_BOUNDARY_ELEMENTS.has(node.tagName);
	if (hasTextBoundary) parts.push(" ");
	for (const child of node.childNodes) appendText(child, parts, omitNestedSenseLists);
	if (hasTextBoundary) parts.push(" ");
}

function truncateText(value: string, maxLength: number): string {
	if (value.length <= maxLength) return value;
	let truncated = value.slice(0, maxLength);
	const lastCodeUnit = truncated.charCodeAt(truncated.length - 1);
	if (lastCodeUnit >= 0xd800 && lastCodeUnit <= 0xdbff) truncated = truncated.slice(0, -1);
	return truncated.trimEnd();
}

function htmlFragmentText(
	html: string,
	omitNestedSenseLists: boolean,
	maxTextLength: number,
): string {
	if (html.length > MAX_HTML_FRAGMENT_LENGTH) return "";

	let fragment: DefaultTreeAdapterMap["documentFragment"];
	try {
		fragment = parseFragment(html);
	} catch {
		return "";
	}
	const parts: string[] = [];
	for (const child of fragment.childNodes) appendText(child, parts, omitNestedSenseLists);
	const normalized = parts
		.join("")
		.replace(/\u00a0/g, " ")
		.replace(/\s+/gu, " ")
		.trim();
	return truncateText(normalized, maxTextLength);
}

export function stripDefinitionHtml(html: string): string {
	return htmlFragmentText(html, false, MAX_DEFINITION_TEXT_LENGTH);
}

function plainDefinitionText(
	value: unknown,
	omitNestedSenseLists = false,
	maxTextLength = MAX_DEFINITION_TEXT_LENGTH,
): string | null {
	const raw = asTrimmedString(value);
	if (!raw) return null;
	const plain = htmlFragmentText(raw, omitNestedSenseLists, maxTextLength);
	return plain.length > 0 ? plain : null;
}

/**
 * Prefer the first usable `parsedExamples[].example`, then `examples[]`.
 * At most one example is kept per sense.
 */
function firstDefinitionExample(entry: Record<string, unknown>): string | undefined {
	if (Array.isArray(entry.parsedExamples)) {
		for (const item of entry.parsedExamples.slice(0, MAX_EXAMPLE_CANDIDATES)) {
			if (!item || typeof item !== "object") continue;
			const example = plainDefinitionText(
				(item as Record<string, unknown>).example,
				false,
				MAX_EXAMPLE_TEXT_LENGTH,
			);
			if (example) return example;
		}
	}
	if (Array.isArray(entry.examples)) {
		for (const item of entry.examples.slice(0, MAX_EXAMPLE_CANDIDATES)) {
			const example = plainDefinitionText(item, false, MAX_EXAMPLE_TEXT_LENGTH);
			if (example) return example;
		}
	}
	return undefined;
}

function toSense(definition: string, example?: string): DefinitionSense {
	return example ? { definition, example } : { definition };
}

/**
 * Wiktionary REST definitions are language-keyed. v1 uses English (`en`) only.
 * Glosses often wrap links and labels in HTML — strip to plain text first.
 */
export function parseWiktionaryPayload(payload: unknown): WiktionaryMeaning[] {
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];
	const english = (payload as Record<string, unknown>).en;
	if (!Array.isArray(english)) return [];

	const meanings: WiktionaryMeaning[] = [];
	for (const item of english.slice(0, MAX_WIKTIONARY_ENTRIES)) {
		if (!item || typeof item !== "object") continue;
		const record = item as Record<string, unknown>;
		if (record.language !== "English") continue;
		const rawPartOfSpeech = asTrimmedString(record.partOfSpeech);
		const partOfSpeech = rawPartOfSpeech
			? truncateText(rawPartOfSpeech.replace(/\s+/gu, " "), MAX_PART_OF_SPEECH_LENGTH)
			: "unknown";
		const definitions: WiktionarySense[] = [];
		if (Array.isArray(record.definitions)) {
			for (const entry of record.definitions.slice(0, MAX_DEFINITIONS_PER_ENTRY)) {
				if (!entry || typeof entry !== "object") continue;
				const recordEntry = entry as Record<string, unknown>;
				const definition = plainDefinitionText(recordEntry.definition, true);
				if (!definition) continue;
				definitions.push(toSense(definition, firstDefinitionExample(recordEntry)));
			}
		}
		if (definitions.length > 0) {
			meanings.push({ partOfSpeech, definitions });
		}
	}
	return meanings;
}

/**
 * Group senses by part of speech, keep the first two per POS, and stop at six
 * senses total. Later POS groups are dropped once the cap is reached.
 * Examples ride along with kept senses and do not count toward the cap.
 */
export function capDefinitionSenses(meanings: WiktionaryMeaning[]): DefinitionSenseGroup[] {
	const byPos = new Map<string, DefinitionSense[]>();
	const seenByPos = new Map<string, Set<string>>();
	const order: string[] = [];

	for (const meaning of meanings) {
		const partOfSpeech = meaning.partOfSpeech.trim() || "unknown";
		if (!byPos.has(partOfSpeech)) {
			byPos.set(partOfSpeech, []);
			seenByPos.set(partOfSpeech, new Set());
			order.push(partOfSpeech);
		}
		const bucket = byPos.get(partOfSpeech);
		const seen = seenByPos.get(partOfSpeech);
		if (!bucket || !seen || bucket.length >= MAX_SENSES_PER_POS) continue;
		for (const item of meaning.definitions) {
			if (bucket.length >= MAX_SENSES_PER_POS) break;
			const definition = item.definition.trim();
			if (!definition || seen.has(definition)) continue;
			const example = item.example?.trim();
			seen.add(definition);
			bucket.push(toSense(definition, example));
		}
	}

	const groups: DefinitionSenseGroup[] = [];
	let remaining = MAX_SENSES_TOTAL;
	for (const partOfSpeech of order) {
		if (remaining <= 0) break;
		const senses = (byPos.get(partOfSpeech) ?? []).slice(0, remaining);
		if (senses.length === 0) continue;
		groups.push({ partOfSpeech, senses });
		remaining -= senses.length;
	}
	return groups;
}
