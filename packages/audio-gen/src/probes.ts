import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
import { runGeneration } from "./generation";
import { createAzureProvider } from "./providers/azure";
import type { TtsProvider } from "./providers/types";
import { escapeXml } from "./word-inputs";

const WORDS = ["seat", "seed", "sheep", "ship", "adapt", "adopt"];
const VOICES = ["Jenny", "Aria", "Guy", "Christopher"];
export type ProbeStage = "voices" | "rates";
type Profile = { id: string; name: string; voiceId: string; ratePercent: number };

export function buildProbeProfiles(stage: ProbeStage = "voices", voices?: string[]): Profile[] {
	if (stage !== "voices" && stage !== "rates")
		throw new Error("Choose probe stage voices or rates");
	if (stage === "voices" && voices)
		throw new Error("Voice stage compares all four voices; shortlist for the rates stage");
	if (stage === "rates" && voices?.length !== 2)
		throw new Error("Choose exactly two shortlisted voices for the rates stage");
	const names = voices
		? voices.map((voice) => {
				const name = VOICES.find((candidate) => candidate.toLowerCase() === voice.toLowerCase());
				if (!name) throw new Error(`Unknown probe voice: ${voice}`);
				return name;
			})
		: VOICES;
	if (new Set(names).size !== names.length) throw new Error("Choose two different voices");
	return names.flatMap((name) =>
		(stage === "voices" ? [0] : [-10, -20]).map((ratePercent) => ({
			id: `${name.toLowerCase()}-${ratePercent === 0 ? "default" : `slower-${-ratePercent}`}`,
			name,
			voiceId: `en-US-${name}Neural`,
			ratePercent,
		})),
	);
}

function listeningPage(stage: ProbeStage, profiles: Profile[], completed: Set<string>): string {
	const label = (profile: Profile) =>
		profile.ratePercent === 0 ? "Default speed" : `${-profile.ratePercent}% slower`;
	const headers = profiles
		.map(
			(profile) =>
				`<th scope="col">${escapeXml(profile.name)}<small>${label(profile)}</small></th>`,
		)
		.join("");
	const rows = WORDS.map(
		(word, index) =>
			`<tr${index % 2 === 0 ? ' class="pair-start"' : ""}><th scope="row">${word}</th>${profiles
				.map((profile) => {
					const src = `${profile.id}/audio/${word}.mp3`;
					return `<td>${completed.has(src) ? `<audio controls preload="none" src="${src}" aria-label="${word}, ${profile.name}, ${label(profile)}"></audio>` : '<span class="pending">Not generated</span>'}</td>`;
				})
				.join("")}</tr>`,
	).join("");
	return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Azure ${stage === "voices" ? "voice" : "speed"} probes</title>
<style>
:root{color-scheme:light dark;font-family:system-ui,sans-serif;background:#f6f7fa;color:#18202d}body{max-width:1100px;margin:0 auto;padding:32px 24px}h1{font-size:28px;margin-bottom:8px}p{line-height:1.6;color:#495466}small{display:block;font-size:13px;font-weight:normal;margin-top:6px}.table-wrap{overflow-x:auto;border:1px solid #dce1e9;border-radius:12px;background:#fff;margin-top:24px}table{border-collapse:collapse;width:100%;min-width:800px}th,td{text-align:left;padding:14px 12px}thead th{background:#edf0f5}.pair-start th,.pair-start td{border-top:1px solid #dce1e9}audio{width:100%;min-width:145px;height:40px}.pending{font-size:14px;color:#657084}.badge{display:inline-block;background:#e5edf8;border-radius:6px;padding:4px 9px;font-size:13px;margin:8px 8px 0 0}footer{margin-top:22px;font-size:14px;color:#657084}@media(prefers-color-scheme:dark){:root{background:#111721;color:#e9edf5}p,footer,.pending{color:#b1bed0}.table-wrap{background:#1b2433;border-color:#344158}thead th{background:#263247}.pair-start th,.pair-start td{border-color:#344158}.badge{background:#263a54}}
</style></head><body>
<h1>${stage === "voices" ? "Choose two voices" : "Choose a voice and speed"}</h1>
<p>${stage === "voices" ? "Compare each word across the four voices, then listen to the pairs: seat / seed, sheep / ship, adapt / adopt." : "Compare the shortlisted voices at 10% and 20% slower. Compare your favorites with the default-speed batch."}<br>Listen for clear vowels, intact word endings, natural stress, and consistent intonation.</p>
<span class="badge">${completed.size} / 24 clips ready</span><span class="badge">One take per word and configuration</span><span class="badge">Default pitch and delivery</span>
<div class="table-wrap"><table><thead><tr><th scope="col">Word</th>${headers}</tr></thead><tbody>${rows}</tbody></table></div>
<footer>Original recordings, with no trimming or playback-speed changes. Your listening checks go in each configuration’s review.tsv.</footer>
<script>document.addEventListener('play',function(event){document.querySelectorAll('audio').forEach(function(audio){if(audio!==event.target)audio.pause();});},true);</script>
</body></html>\n`;
}

export async function runProbes(options: {
	outputDir: string;
	stage?: ProbeStage;
	voices?: string[];
	dryRun?: boolean;
	resume?: boolean;
	requestsPerMinute?: number;
	providerFactory?: (profile: Profile) => TtsProvider;
	wait?: (ms: number) => Promise<unknown>;
}) {
	const stage = options.stage ?? "voices";
	const profiles = buildProbeProfiles(stage, options.voices);
	const rpm = options.requestsPerMinute ?? 20;
	if (!Number.isInteger(rpm) || rpm < 1 || rpm > 600)
		throw new Error("Requests per minute must be an integer from 1 to 600");
	const manifest = { version: 1, stage, words: WORDS, profiles };
	const manifestPath = path.join(options.outputDir, "probe.json");
	// Validate every provider configuration before spending credits.
	const providers = options.dryRun
		? []
		: profiles.map((profile) => options.providerFactory?.(profile) ?? createAzureProvider(profile));
	await mkdir(options.outputDir, { recursive: true });
	if (options.resume) {
		if (
			JSON.stringify(JSON.parse(await readFile(manifestPath, "utf8"))) !== JSON.stringify(manifest)
		)
			throw new Error("Probe settings changed; resume with the original stage and voices");
	} else {
		try {
			await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "EEXIST")
				throw new Error("Probe already exists; use --resume or a new output directory");
			throw error;
		}
	}
	let generated = 0;
	const render = async () => {
		const completed = new Set<string>();
		for (const profile of profiles) {
			try {
				const plan = JSON.parse(
					await readFile(path.join(options.outputDir, profile.id, "plan.json"), "utf8"),
				) as { samples: { status: string; file: string }[] };
				for (const sample of plan.samples)
					if (sample.status === "generated") completed.add(`${profile.id}/${sample.file}`);
			} catch (error) {
				if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
			}
		}
		await writeFile(
			path.join(options.outputDir, "index.html"),
			listeningPage(stage, profiles, completed),
		);
	};
	try {
		for (const [index, profile] of profiles.entries()) {
			if (!options.dryRun && generated && index > 0)
				await (options.wait ?? setTimeout)(Math.ceil(60_000 / rpm) + 100);
			const directory = path.join(options.outputDir, profile.id);
			let resume = false;
			if (options.resume) {
				try {
					await readFile(path.join(directory, "plan.json"));
					resume = true;
				} catch (error) {
					if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
				}
			}
			const result = await runGeneration({
				outputDir: directory,
				...(resume ? { resume: true } : { words: WORDS }),
				voiceId: profile.voiceId,
				ratePercent: profile.ratePercent,
				requestsPerMinute: rpm,
				dryRun: options.dryRun,
				provider: providers[index],
				wait: options.wait,
			});
			generated += result.generated;
			await render();
		}
		return { planned: 24, generated };
	} finally {
		await render();
	}
}
