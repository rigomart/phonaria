import { readFile, writeFile } from "node:fs/promises";
import {
	getIpaForPhonemeId,
	type PhonemeSymbolId,
	toBasePhonemeIds,
} from "@phonaria/phonetics-data";
import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import type { ScoringRequest, SoundVerdict } from "../contract";
import { judgeWord } from "../judge";
import { azureEvidenceFromResponse } from "./evidence";
import { requestAzureAssessment } from "./scorer";

const USAGE = "Usage: bun run probe <file.wav> <word> [--save=response.json]";

async function main() {
	const args = process.argv.slice(2);
	const savePath = args.find((arg) => arg.startsWith("--save="))?.slice("--save=".length);
	const [wavPath, word] = args.filter((arg) => !arg.startsWith("--"));
	if (!wavPath || !word) throw new Error(USAGE);

	const key = process.env.AZURE_SPEECH_KEY;
	const region = process.env.AZURE_SPEECH_REGION;
	if (!key || !region) {
		throw new Error("Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in packages/pronunciation/.env");
	}

	const variants = EnglishCuratedTop10k.words[word.toLowerCase()];
	if (!variants) throw new Error(`"${word}" isn't in the curated top-10k dictionary`);
	const pronunciations = [
		...new Set(variants.map((variant) => toBasePhonemeIds(variant).join(" "))),
	];
	const request: ScoringRequest = {
		targetAccent: "en-us",
		words: [
			{
				text: word,
				acceptedPronunciations: pronunciations.map((ids) => ids.split(" ") as PhonemeSymbolId[]),
			},
		],
	};

	const audio = new Uint8Array(await readFile(wavPath));
	const response = await requestAzureAssessment(audio, request, { key, region });
	if (savePath) await writeFile(savePath, `${JSON.stringify(response, null, "\t")}\n`);

	const heard = response.NBest?.[0]?.Words?.[0]?.Phonemes?.map((phoneme) => phoneme.Phoneme);
	console.log(
		`Azure: ${response.RecognitionStatus}${heard ? `, scored as /${heard.join(" ")}/` : ""}`,
	);

	const [evidence] = azureEvidenceFromResponse(response, request).words;
	if (evidence.pronunciations.length === 0) console.log("No accepted pronunciation lined up.");
	for (const { pronunciationIndex, sounds } of evidence.pronunciations) {
		console.log(`\nPronunciation ${pronunciationIndex}: ${pronunciations[pronunciationIndex]}`);
		for (const sound of sounds) {
			const label = `${sound.phonemeId} /${getIpaForPhonemeId(sound.phonemeId)}/`.padEnd(10);
			if (sound.type === "missing") {
				console.log(`  ${label} missing`);
				continue;
			}
			const span = `${sound.startSeconds.toFixed(2)}-${sound.endSeconds.toFixed(2)}s`;
			const rivals = [...sound.rivals]
				.sort((a, b) => b.score - a.score)
				.map((rival) => `${rival.phonemeId} ${rival.score.toFixed(2)}`)
				.join(", ");
			console.log(
				`  ${label} ${span}  target ${sound.targetScore.toFixed(2)}  rivals ${rivals || "none"}`,
			);
		}
	}

	const judgement = judgeWord({
		evidence,
		judgedPhonemeIds: new Set(request.words[0].acceptedPronunciations.flat()),
		targetAccent: "en-us",
	});
	if (!judgement) return;
	console.log(`\nVerdicts (pronunciation ${judgement.pronunciationIndex}):`);
	for (const sound of judgement.sounds) {
		console.log(`  ${sound.position} ${sound.phonemeId}: ${describe(sound.verdict)}`);
	}
}

function describe(verdict: SoundVerdict): string {
	return verdict.type === "swapped" ? `swapped, heard ${verdict.heard}` : verdict.type;
}

void main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : "Probe failed");
	process.exitCode = 1;
});
