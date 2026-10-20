import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AzureAssessmentResponse, AzureRecognitionResponse } from "../azure/response";
import { createAzureHarnessScorer } from "./azure";
import { type ClipLabel, targetWordFor } from "./cases";
import { seedCache } from "./scoring";
import { toScorerWav } from "./sources";

/** The investigation's letters for what each clip holds. */
const KINDS: Record<string, ClipLabel["kind"]> = {
	a: "correct",
	b: "swap",
	c: "unrelated",
	d: "added-sounds",
	e: "phrase",
	f: "nonword",
	g: "silence",
};

type SavedResponse<Response> = {
	readonly clip: {
		readonly id: string;
		readonly target: string;
		readonly partner: string;
		readonly category: string;
		readonly said: string;
		readonly source: { readonly kind: string; readonly voice?: string };
	};
	readonly wavHash: string;
	readonly response: Response;
};

/**
 * Turns the wrong-word investigation's folder (#344) into a clips manifest and
 * seeds the harness cache with its saved Azure responses: `B.<clip>.json`, the
 * assessment with miscue on, and `C.<wav hash>.json`, plain recognition. A run
 * over the manifest then makes no calls.
 */
export async function importInvestigation({
	dir,
	outputDir,
}: {
	readonly dir: string;
	readonly outputDir: string;
}): Promise<{ manifest: string; clips: number; seeded: number }> {
	const responses = path.join(dir, "responses");
	const read = async <Response>(name: string) =>
		JSON.parse(await readFile(path.join(responses, name), "utf8")) as SavedResponse<Response>;
	const names = (await readdir(responses)).filter((name) => /^B\..+\.json$/.test(name)).sort();

	const manifestDir = path.join(outputDir, "investigation");
	await mkdir(manifestDir, { recursive: true });
	const scorer = createAzureHarnessScorer({});
	const clips = [];
	let seeded = 0;
	for (const name of names) {
		const assessment = await read<AzureAssessmentResponse>(name);
		const recognition = await read<AzureRecognitionResponse>(`C.${assessment.wavHash}.json`);
		const { id, target, partner, category, said, source } = assessment.clip;
		const kind = KINDS[category];
		if (!kind) throw new Error(`${name}: unknown category ${category}`);
		const file = path.join(dir, "wav", `${id}.wav`);
		clips.push({
			file: path.relative(manifestDir, file),
			source: `tts:investigation-${source.voice ?? source.kind}`,
			target,
			partner,
			kind,
			said,
		});
		const job = {
			audio: await toScorerWav(file, path.join(outputDir, "wav")),
			request: { targetAccent: "en-us" as const, words: [targetWordFor(target)] },
		};
		const raw = { assessment: assessment.response, recognition: recognition.response };
		if (await seedCache(scorer, job, raw, path.join(outputDir, "cache"))) seeded++;
	}
	const manifest = path.join(manifestDir, "clips.json");
	await writeFile(manifest, `${JSON.stringify({ clips }, null, "\t")}\n`);
	return { manifest, clips: clips.length, seeded };
}
