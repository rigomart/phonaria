import { execFile } from "node:child_process";
import { access, mkdir, readdir, readFile, rename, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { getWordAudioPath } from "@phonaria/phonetics-data";
import type { WavAudio } from "../contract";
import { type ClipLabel, WRONG_WORD_KINDS } from "./cases";
import type { SourceKind } from "./metrics";
import { mapWithConcurrency, sha256, writeAtomically } from "./scoring";

const run = promisify(execFile);

/** Where the app serves word recordings from. */
export const PUBLIC_ASSETS_URL = "https://assets.rigos.dev";

const AUDIO_EXTENSIONS = new Set([".wav", ".ogg", ".mp3", ".m4a", ".webm", ".flac", ".opus"]);

export type Recording = {
	readonly sourceId: string;
	readonly sourceKind: SourceKind;
	/** The word the recording is of, after labels. */
	readonly word: string;
	readonly file: string;
};

export type SourceLoad = {
	readonly recordings: Recording[];
	/** Words expected from the source with no recording. */
	readonly missing: string[];
	/** Recordings labelled as neither word, left out. */
	readonly neither: string[];
	/** Recordings labelled as another word, scored as that word. */
	readonly relabelled: { readonly file: string; readonly as: string }[];
};

/** Catalog recordings from a local folder of `<word>.ogg`, or fetched from the public bucket. */
export async function loadCatalogSource({
	words,
	audioDir,
	downloadDir,
	offline,
}: {
	readonly words: readonly string[];
	readonly audioDir?: string;
	readonly downloadDir: string;
	readonly offline: boolean;
}): Promise<SourceLoad> {
	await mkdir(downloadDir, { recursive: true });
	const missing: string[] = [];
	const found = await mapWithConcurrency(words, 8, async (word) => {
		const key = getWordAudioPath("en-us", word);
		if (!key) {
			missing.push(word);
			return null;
		}
		const name = path.basename(key);
		if (audioDir) {
			const file = path.join(audioDir, name);
			if (await exists(file)) return file;
			missing.push(word);
			return null;
		}
		const file = path.join(downloadDir, name);
		if (await exists(file)) return file;
		if (offline) {
			missing.push(word);
			return null;
		}
		const response = await fetch(`${PUBLIC_ASSETS_URL}/${key}`);
		if (!response.ok) throw new Error(`Fetching ${key} failed (HTTP ${response.status})`);
		await writeAtomically(file, new Uint8Array(await response.arrayBuffer()));
		return file;
	});
	const recordings = words.flatMap((word, index): Recording[] => {
		const file = found[index];
		return file ? [{ sourceId: "tts:jenny", sourceKind: "tts", word, file }] : [];
	});
	return { recordings, missing: missing.sort(), neither: [], relabelled: [] };
}

/** A folder of `<word>.<ext>`, or an audio-gen output folder with them under `audio/`. */
export async function loadFolderSource(
	dir: string,
	sourceId: string,
	sourceKind: SourceKind,
	words: readonly string[],
): Promise<SourceLoad> {
	const audioDir = (await isDirectory(path.join(dir, "audio"))) ? path.join(dir, "audio") : dir;
	const files = await audioFilesByWord(audioDir);
	const recordings: Recording[] = [];
	const missing: string[] = [];
	for (const word of words) {
		const file = files.get(word);
		if (file) recordings.push({ sourceId, sourceKind, word, file });
		else missing.push(word);
	}
	return { recordings, missing, neither: [], relabelled: [] };
}

export type FolderSourceSpec = { readonly id: string; readonly dir: string };

/**
 * Names each `--tts-dir`: `name=path` names it explicitly, otherwise the
 * nearest folder that isn't `audio`. Two sources with one name fail, since
 * the later would replace the earlier in the report.
 */
export function folderSources(
	specs: readonly string[],
	kind: SourceKind,
	taken: ReadonlySet<string> = new Set(),
): FolderSourceSpec[] {
	const ids = new Set(taken);
	return specs.map((spec) => {
		const named = /^([\w.-]+)=(.+)$/.exec(spec);
		const dir = path.resolve(named ? named[2] : spec);
		const name = named?.[1] ?? folderName(dir);
		const id = `${kind}:${name}`;
		if (ids.has(id)) {
			throw new Error(
				`Two sources are named ${id}; name one with name=path, e.g. --tts-dir=${name}-2=${spec}`,
			);
		}
		ids.add(id);
		return { id, dir };
	});
}

function folderName(dir: string): string {
	let current = dir;
	while (path.basename(current).toLowerCase() === "audio" && path.dirname(current) !== current) {
		current = path.dirname(current);
	}
	return path.basename(current);
}

/** `NEITHER` in labels.json: the recording came out as neither pair word. */
export const NEITHER = "neither";

/**
 * `labels.json` maps a recording's word to the word it came out as, or to
 * "neither". Unlisted recordings count as said as intended.
 */
export function parseLabels(json: unknown, file = "labels.json"): Map<string, string> {
	if (typeof json !== "object" || json === null || Array.isArray(json)) {
		throw new Error(`${file} must be an object of word to heard word or "neither"`);
	}
	const labels = new Map<string, string>();
	for (const [word, heard] of Object.entries(json)) {
		if (typeof heard !== "string" || !heard.trim()) {
			throw new Error(`${file}: "${word}" needs a word or "neither"`);
		}
		labels.set(word.trim().toLowerCase(), heard.trim().toLowerCase());
	}
	return labels;
}

/**
 * Real voices laid out as `<speaker>/<word>.wav` with an optional
 * `<speaker>/labels.json`. Each speaker is its own source.
 */
export async function loadVoicesSource(
	dir: string,
	expectedWords: readonly string[],
	catalogWords: ReadonlySet<string>,
): Promise<Map<string, SourceLoad>> {
	const speakers = (await readdir(dir, { withFileTypes: true }))
		.filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
		.map((entry) => entry.name)
		.sort();
	const loads = new Map<string, SourceLoad>();
	for (const speaker of speakers) {
		const speakerDir = path.join(dir, speaker);
		const labelsFile = path.join(speakerDir, "labels.json");
		const labels = (await exists(labelsFile))
			? parseLabels(JSON.parse(await readFile(labelsFile, "utf8")), labelsFile)
			: new Map<string, string>();
		const files = await audioFilesByWord(speakerDir);
		const sourceId = `real:${speaker}`;
		const recordings: Recording[] = [];
		const neither: string[] = [];
		const relabelled: { file: string; as: string }[] = [];
		for (const [fileWord, file] of files) {
			const heard = labels.get(fileWord) ?? fileWord;
			if (heard === NEITHER) {
				neither.push(file);
				continue;
			}
			if (!catalogWords.has(heard)) {
				if (heard === fileWord) continue;
				throw new Error(`${labelsFile}: "${heard}" isn't a minimal-pair word or "neither"`);
			}
			if (heard !== fileWord) relabelled.push({ file, as: heard });
			recordings.push({ sourceId, sourceKind: "real", word: heard, file });
		}
		const missing = expectedWords.filter((word) => !files.has(word));
		loads.set(sourceId, { recordings, missing, neither, relabelled });
	}
	return loads;
}

async function audioFilesByWord(dir: string): Promise<Map<string, string>> {
	const files = new Map<string, string>();
	for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) =>
		a.name.localeCompare(b.name),
	)) {
		const extension = path.extname(entry.name).toLowerCase();
		if (!entry.isFile() || !AUDIO_EXTENSIONS.has(extension)) continue;
		const word = path.basename(entry.name, path.extname(entry.name)).toLowerCase();
		const isWav = extension === ".wav";
		if (!files.has(word) || isWav) files.set(word, path.join(dir, entry.name));
	}
	return files;
}

/** A labelled recording from a clips manifest. */
export type Clip = ClipLabel & {
	readonly sourceId: string;
	readonly sourceKind: SourceKind;
	readonly file: string;
};

const CLIP_KINDS = new Set<string>(["correct", "swap", ...WRONG_WORD_KINDS]);

/**
 * A clips manifest labels recordings one by one, for cases a folder of words
 * can't express, such as a phrase judged against *ship*:
 * `{ "clips": [{ "file": "a-ship.wav", "source": "tts:jenny", "target": "ship",
 * "partner": "sheep", "kind": "phrase", "said": "a ship" }] }`. `kind` is
 * `correct`, `swap`, or a wrong-word kind; `source` is `tts:<name>` or
 * `real:<name>`; `file` is relative to the manifest.
 */
export async function loadClips(manifestFile: string): Promise<Clip[]> {
	const manifest = JSON.parse(await readFile(manifestFile, "utf8")) as { clips?: unknown };
	if (!Array.isArray(manifest.clips)) throw new Error(`${manifestFile} needs a "clips" list`);
	const dir = path.dirname(manifestFile);
	return manifest.clips.map((entry: Record<string, unknown>, index): Clip => {
		const { file, source, target, partner, kind, said } = entry;
		const where = `${manifestFile} clip ${index}`;
		if (![file, source, target, partner, said].every((field) => typeof field === "string")) {
			throw new Error(`${where} needs file, source, target, partner and said`);
		}
		if (typeof kind !== "string" || !CLIP_KINDS.has(kind)) {
			throw new Error(`${where} has an unknown kind: ${String(kind)}`);
		}
		const sourceId = source as string;
		const sourceKind = sourceId.startsWith("real:") ? "real" : "tts";
		if (!/^(tts|real):[\w.-]+$/.test(sourceId)) {
			throw new Error(`${where}: source must be tts:<name> or real:<name>`);
		}
		return {
			sourceId,
			sourceKind,
			file: path.resolve(dir, file as string),
			target: target as string,
			partner: partner as string,
			kind: kind as Clip["kind"],
			said: said as string,
		};
	});
}

export async function assertFfmpeg(): Promise<void> {
	try {
		await run("ffmpeg", ["-version"]);
	} catch {
		throw new Error("ffmpeg is required to convert recordings; install it and retry");
	}
}

/**
 * The recording as 16 kHz mono 16-bit PCM WAV, converted once and stored by the
 * hash of the original file so the bytes, and so the cache keys, stay stable.
 */
export async function toScorerWav(file: string, wavDir: string): Promise<WavAudio> {
	const original = new Uint8Array(await readFile(file));
	const converted = path.join(wavDir, `${sha256(original)}.wav`);
	if (!(await exists(converted))) {
		await mkdir(wavDir, { recursive: true });
		const temporary = `${converted}.${process.pid}.tmp.wav`;
		await run("ffmpeg", [
			"-nostdin",
			"-loglevel",
			"error",
			"-y",
			"-i",
			file,
			"-ar",
			"16000",
			"-ac",
			"1",
			"-c:a",
			"pcm_s16le",
			"-map_metadata",
			"-1",
			"-fflags",
			"+bitexact",
			"-flags:a",
			"+bitexact",
			temporary,
		]);
		await rename(temporary, converted);
	}
	return new Uint8Array(await readFile(converted));
}

async function exists(file: string): Promise<boolean> {
	try {
		await access(file);
		return true;
	} catch {
		return false;
	}
}

async function isDirectory(dir: string): Promise<boolean> {
	try {
		return (await stat(dir)).isDirectory();
	} catch {
		return false;
	}
}
