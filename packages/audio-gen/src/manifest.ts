import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { WordAudioForm, WordAudioManifest } from "@phonaria/phonetics-data";
import { formSlug, isPlainWord } from "./word-forms";

type PlanSample = {
	word: string;
	form?: { n?: number; label: string };
	variant: string;
	file: string;
	sha256?: string;
};
type Plan = {
	targetAccent: string;
	settings: { voiceId: string };
	samples: PlanSample[];
};
/**
 * What `manifest` reads from an upload record: each attempted clip, by key and checksum.
 * Records from before #373 lack `batches` and `leftOut` and are read the same way.
 */
export type UploadRecord = {
	entries: readonly { key: string; sha256: string; verified: boolean }[];
};
/** A batch folder as `manifest` reads it: its plan and every upload record in it. */
export type UploadedBatch = { dir: string; plan: Plan; records: readonly UploadRecord[] };

/** "en-US-JennyNeural" -> "jenny": the voice's name, lowercase, as its bucket folder. */
export function voiceFolderName(voiceId: string): string {
	const name = voiceId
		.split("-")
		.at(-1)
		?.replace(/Neural$/, "");
	if (!name || !/^[A-Za-z]+$/.test(name))
		throw new Error(`Cannot derive a voice name from "${voiceId}"`);
	return name.toLowerCase();
}

/**
 * The samples of a batch that its upload records show were uploaded and verified: a verified
 * entry has the sample's key and checksum. A record's entries for other batches of the same
 * run don't match and are skipped. Refuses a batch with no verified clip.
 */
function uploadedSamples({ dir, plan, records }: UploadedBatch): PlanSample[] {
	const prefix = `audio/${plan.targetAccent}/words/${voiceFolderName(plan.settings.voiceId)}/`;
	const verified = new Set(
		records.flatMap(({ entries }) =>
			entries
				.filter((entry) => entry.verified === true)
				.map(({ key, sha256 }) => `${key} ${sha256}`),
		),
	);
	const uploaded = plan.samples.filter(({ word, form, file, sha256 }) => {
		const slug = formSlug(word, form?.n);
		if (file !== `audio/${slug}.ogg`)
			throw new Error(`${dir}: only Ogg recordings are published (audio/{word}.ogg): ${file}`);
		return verified.has(`${prefix}${slug}.ogg ${sha256}`);
	});
	if (!uploaded.length)
		throw new Error(
			records.length
				? `${dir}: no upload record verifies any of its clips; check its upload-*.json`
				: `${dir} has no upload record; run upload first, or record-published for a batch published before upload records`,
		);
	return uploaded;
}

const formKey = (n: number | undefined) => n ?? 1;

/** Adds forms by number, refusing a number listed again with another label or pronunciation. */
function addForms(
	forms: Map<string, Map<number, WordAudioForm>>,
	word: string,
	added: readonly WordAudioForm[],
) {
	const byNumber = forms.get(word) ?? new Map<number, WordAudioForm>();
	for (const { n, label, pronunciation } of added) {
		const listed = byNumber.get(formKey(n));
		if (listed && listed.label !== label)
			throw new Error(`${formSlug(word, n)} is labelled both "${listed.label}" and "${label}"`);
		if (listed && listed.pronunciation !== pronunciation)
			throw new Error(
				`${formSlug(word, n)} is said both "${listed.pronunciation}" and "${pronunciation}"`,
			);
		byNumber.set(formKey(n), { ...(n ? { n } : {}), ...(label ? { label } : {}), pronunciation });
	}
	forms.set(word, byNumber);
}

function sortedForms(forms: Map<string, Map<number, WordAudioForm>>) {
	const entries = [...forms]
		.filter(([, byNumber]) => byNumber.size)
		.sort(([a], [b]) => (a < b ? -1 : 1))
		.map(([word, byNumber]) => [
			word,
			[...byNumber].sort(([a], [b]) => a - b).map(([, form]) => form),
		]);
	return entries.length ? Object.fromEntries(entries) : undefined;
}

/**
 * The uploaded recordings of a batch and its retakes. `words` holds every word whose plain
 * recording went up; `forms` lists, with its pronunciation, every clip that went up of a
 * word recorded more than once, so an "also said" word's unlabelled main clip is in it too.
 * Refuses a clip that went up with two pronunciations, whatever the batch order.
 */
export function manifestFromUploads(batches: readonly UploadedBatch[]): WordAudioManifest & {
	accent: string;
} {
	const [first] = batches;
	if (!first) throw new Error("manifest needs at least one --out");
	const accent = first.plan.targetAccent;
	const voice = voiceFolderName(first.plan.settings.voiceId);
	const words = new Map<string, string>();
	const forms = new Map<string, Map<number, WordAudioForm>>();
	for (const batch of batches) {
		if (
			batch.plan.targetAccent !== accent ||
			voiceFolderName(batch.plan.settings.voiceId) !== voice
		)
			throw new Error(`${batch.dir} uses another accent or voice than ${first.dir}`);
		for (const { word, form, variant } of uploadedSamples(batch)) {
			if (!isPlainWord(word)) throw new Error(`Words must be lowercase a-z: ${word}`);
			if (!form?.n) {
				const listed = words.get(word);
				if (listed !== undefined && listed !== variant)
					throw new Error(`${word} is said both "${listed}" and "${variant}"`);
				words.set(word, variant);
			}
			if (form) addForms(forms, word, [{ ...form, pronunciation: variant }]);
		}
	}
	for (const [word, byNumber] of forms) {
		const pronunciation = words.get(word);
		if (pronunciation && !byNumber.has(formKey(undefined)))
			byNumber.set(formKey(undefined), { pronunciation });
	}
	return { accent, voice, words: [...words.keys()].sort(), forms: sortedForms(forms) };
}

/** Per-accent manifest JSON in @phonaria/phonetics-data. */
const MANIFEST_FILES: Record<string, string> = {
	"en-us": "data/en/word-audio.json",
};

export function manifestFile(targetAccent: string): string {
	const file = MANIFEST_FILES[targetAccent];
	if (!file) throw new Error(`No word-audio manifest for accent "${targetAccent}"`);
	return file;
}

/**
 * One line per initial letter in `words` and one line per word in `forms`, so a new batch
 * changes a few lines instead of thousands. `forms` only when some word has them.
 */
export function renderManifestJson({ voice, words, forms }: WordAudioManifest): string {
	const byLetter = new Map<string, string[]>();
	for (const word of words)
		byLetter.set(word[0], [...(byLetter.get(word[0]) ?? []), JSON.stringify(word)]);
	const wordLines = [...byLetter.values()].map((group) => group.join(", "));
	const sections = [
		`\t"voice": ${JSON.stringify(voice)}`,
		`\t"words": [\n${wordLines.map((line) => `\t\t${line}`).join(",\n")}\n\t]`,
	];
	if (forms) {
		const formLines = Object.entries(forms).map(
			([word, listed]) => `\t\t${JSON.stringify(word)}: ${JSON.stringify(listed)}`,
		);
		sections.push(`\t"forms": {\n${formLines.join(",\n")}\n\t}`);
	}
	return `{\n${sections.join(",\n")}\n}\n`;
}

/** Merges two manifests of one voice, keeping every word and form either lists. */
export function mergeManifests(
	existing: WordAudioManifest,
	added: WordAudioManifest,
): WordAudioManifest {
	if (existing.voice !== added.voice)
		throw new Error(`Cannot merge voice ${added.voice} into ${existing.voice}`);
	const forms = new Map<string, Map<number, WordAudioForm>>();
	for (const manifest of [existing, added])
		for (const [word, listed] of Object.entries(manifest.forms ?? {}))
			addForms(forms, word, listed);
	return {
		voice: existing.voice,
		words: [...new Set([...existing.words, ...added.words])].sort(),
		forms: sortedForms(forms),
	};
}

export function readUploadedBatch(dir: string): UploadedBatch {
	const plan = JSON.parse(readFileSync(path.join(dir, "plan.json"), "utf8")) as Plan;
	const records = readdirSync(dir)
		.filter((name) => /^upload-.+\.json$/.test(name))
		.sort()
		.map((name) => {
			const record = JSON.parse(readFileSync(path.join(dir, name), "utf8")) as UploadRecord;
			if (!Array.isArray(record.entries))
				throw new Error(`${path.join(dir, name)} is not an upload record`);
			return record;
		});
	return { dir, plan, records };
}

/**
 * Merges the uploaded clips of a batch and its retakes into the accent's manifest JSON;
 * refuses a different voice, or a folder whose records verify none of its clips.
 */
export function writeManifest(outputDirs: readonly string[], phoneticsDataDir: string): string {
	const { accent, ...uploaded } = manifestFromUploads(outputDirs.map(readUploadedBatch));
	const target = path.join(phoneticsDataDir, manifestFile(accent));
	const existing = JSON.parse(readFileSync(target, "utf8")) as WordAudioManifest;
	writeFileSync(target, renderManifestJson(mergeManifests(existing, uploaded)));
	return target;
}
