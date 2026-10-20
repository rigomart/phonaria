import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import type { ScoringRequest, SoundEvidence, WordEvidence } from "../contract";
import { judgeWord } from "../judge";
import { azureEvidenceFromResponse, azureTranscript } from "./evidence";
import { MISCUE_FIXTURES } from "./fixtures/miscue";
import poorAsPoor from "./fixtures/poor-as-poor.json";
import pullAsPool from "./fixtures/pull-as-pool.json";
import sheepAsShip from "./fixtures/sheep-as-ship.json";
import shipAsShip from "./fixtures/ship-as-ship.json";
import silenceAsShip from "./fixtures/silence-as-ship.json";
import sinAsThin from "./fixtures/sin-as-thin.json";
import thinAsThin from "./fixtures/thin-as-thin.json";
import veryAsVery from "./fixtures/very-as-very.json";
import waterAsWater from "./fixtures/water-as-water.json";
import type { AzureAssessmentResponse, AzurePhoneme } from "./response";

function request(text: string, ...pronunciations: string[]): ScoringRequest {
	return {
		targetAccent: "en-us",
		words: [
			{
				text,
				acceptedPronunciations: pronunciations.map((ids) => ids.split(" ") as PhonemeSymbolId[]),
			},
		],
	};
}

function evidenceFor(response: AzureAssessmentResponse, scoring: ScoringRequest): WordEvidence {
	const recording = azureEvidenceFromResponse(response, scoring);
	expect(recording.words).toHaveLength(scoring.words.length);
	return recording.words[0];
}

function soundsOf(evidence: WordEvidence, index = 0) {
	return evidence.pronunciations[index]?.sounds ?? [];
}

function scoredAt(evidence: WordEvidence, position: number): SoundEvidence {
	const sound = soundsOf(evidence)[position];
	if (sound?.type !== "scored") throw new Error(`sound ${position} was not scored`);
	return sound;
}

function verdicts(evidence: WordEvidence, judged: PhonemeSymbolId[]) {
	return judgeWord({
		evidence,
		judgedPhonemeIds: new Set(judged),
		targetAccent: "en-us",
	})?.sounds.map((sound) => sound.verdict);
}

function withPhoneme(
	response: AzureAssessmentResponse,
	index: number,
	change: (phoneme: AzurePhoneme) => AzurePhoneme,
): AzureAssessmentResponse {
	const copy = structuredClone(response) as unknown as {
		NBest: { Words: { Phonemes: AzurePhoneme[] }[] }[];
	};
	const phonemes = copy.NBest[0].Words[0].Phonemes;
	phonemes[index] = change(phonemes[index]);
	return copy as unknown as AzureAssessmentResponse;
}

const SHIP = request("ship", "SH IX P");

describe("azureEvidenceFromResponse", () => {
	it("scores ship said as ship with the target winning", () => {
		const evidence = evidenceFor(shipAsShip, SHIP);
		expect(evidence.pronunciations).toHaveLength(1);
		expect(scoredAt(evidence, 1)).toEqual({
			type: "scored",
			phonemeId: "IX",
			startSeconds: 0.33,
			endSeconds: 0.46,
			targetScore: 1,
			rivals: [
				{ phonemeId: "P", score: 0.39 },
				{ phonemeId: "E", score: 0.08 },
				{ phonemeId: "AX", score: 0.03 },
				{ phonemeId: "SH", score: 0.03 },
				{ phonemeId: "M", score: 0.03 },
				{ phonemeId: "I", score: 0.02 },
				{ phonemeId: "AE", score: 0.02 },
				{ phonemeId: "EI", score: 0.01 },
				{ phonemeId: "R", score: 0.01 },
			],
			accuracy: 1,
		});
		expect(evidence.accuracy).toBe(1);
		expect(verdicts(evidence, ["IX", "I"])).toEqual([{ type: "match" }]);
	});

	it("shows sheep said against ship with /i/ beating the target", () => {
		const evidence = evidenceFor(sheepAsShip, SHIP);
		const vowel = scoredAt(evidence, 1);
		expect(vowel.targetScore).toBe(0.02);
		expect(vowel.rivals[0]).toEqual({ phonemeId: "I", score: 1 });
		expect(verdicts(evidence, ["IX", "I"])).toEqual([{ type: "swapped", heard: "I" }]);
	});

	it("shows sin said against thin with /s/ beating /θ/", () => {
		const evidence = evidenceFor(sinAsThin, request("thin", "TH IX N"));
		expect(scoredAt(evidence, 0).targetScore).toBe(0.14);
		expect(verdicts(evidence, ["TH", "S"])).toEqual([{ type: "swapped", heard: "S" }]);
	});

	it("shows pull said against pool with /ʊ/ beating /u/", () => {
		const evidence = evidenceFor(pullAsPool, request("pool", "P U L"));
		expect(scoredAt(evidence, 1).targetScore).toBe(0.46);
		expect(verdicts(evidence, ["U", "UX"])).toEqual([{ type: "swapped", heard: "UX" }]);
	});

	it("passes on a tie at the top of Azure's list, which the judge reads as unclear", () => {
		const evidence = evidenceFor(thinAsThin, request("thin", "TH IX N"));
		const vowel = scoredAt(evidence, 1);
		expect(vowel.targetScore).toBe(1);
		expect(vowel.rivals).toContainEqual({ phonemeId: "E", score: 1 });
		expect(verdicts(evidence, ["IX"])).toEqual([{ type: "unclear", reason: "other-sound" }]);
	});

	it("never lists the target among its rivals", () => {
		const fixtures: [AzureAssessmentResponse, ScoringRequest][] = [
			[shipAsShip, SHIP],
			[sheepAsShip, SHIP],
			[sinAsThin, request("thin", "TH IX N")],
			[waterAsWater, request("water", "W O T ER")],
		];
		for (const [response, scoring] of fixtures) {
			for (const sound of soundsOf(evidenceFor(response, scoring))) {
				if (sound.type !== "scored") continue;
				expect(sound.rivals.map((rival) => rival.phonemeId)).not.toContain(sound.phonemeId);
			}
		}
	});

	it("keeps the best score when two Azure symbols share a phoneme ID", () => {
		const evidence = evidenceFor(waterAsWater, request("water", "W O T ER"));
		expect(scoredAt(evidence, 3).targetScore).toBe(1);
		expect(soundsOf(evidence).every((sound) => sound.type === "scored")).toBe(true);
	});

	it("lines up a word whose Azure pronunciation differs from the dictionary's", () => {
		const evidence = evidenceFor(poorAsPoor, request("poor", "P U R"));
		const [p, vowel, r] = soundsOf(evidence);
		expect(p).toMatchObject({ type: "scored", phonemeId: "P", targetScore: 1 });
		expect(vowel).toEqual({ type: "missing", phonemeId: "U" });
		expect(r).toEqual({
			type: "scored",
			phonemeId: "R",
			startSeconds: 0.27,
			endSeconds: 0.71,
			targetScore: 0.96,
			rivals: [],
			accuracy: 0.96,
		});
	});

	it("scores both sounds of a two-sound unit from its accuracy alone", () => {
		const evidence = evidenceFor(veryAsVery, request("very", "V E R I"));
		const sounds = soundsOf(evidence);
		expect(sounds.map((sound) => sound.phonemeId)).toEqual(["V", "E", "R", "I"]);
		expect(sounds[1]).toMatchObject({ type: "scored", targetScore: 1, rivals: [] });
		expect(sounds[2]).toMatchObject({ type: "scored", targetScore: 1, rivals: [] });
		expect(scoredAt(evidence, 3).rivals.length).toBeGreaterThan(0);
	});

	it("reports a sound as missing when Azure's symbol for it has no phoneme ID", () => {
		const response = withPhoneme(shipAsShip, 1, (phoneme) => ({
			...phoneme,
			Phoneme: "ɨ",
			NBestPhonemes: [{ Phoneme: "ɨ", Score: 100 }, ...(phoneme.NBestPhonemes ?? []).slice(1)],
		}));
		const sounds = soundsOf(evidenceFor(response, SHIP));
		expect(sounds[0]?.type).toBe("scored");
		expect(sounds[1]).toEqual({ type: "missing", phonemeId: "IX" });
		expect(sounds[2]?.type).toBe("scored");
	});

	it("drops rivals when an n-best phoneme without a single ID beats them all", () => {
		const response = withPhoneme(sheepAsShip, 1, (phoneme) => ({
			...phoneme,
			NBestPhonemes: [{ Phoneme: "ɪɹ", Score: 100 }, ...(phoneme.NBestPhonemes ?? [])],
		}));
		expect(scoredAt(evidenceFor(response, SHIP), 1)).toMatchObject({
			targetScore: 0.35,
			rivals: [],
		});
	});

	it("leaves out an n-best phoneme without an ID when a named rival beats it", () => {
		const response = withPhoneme(sheepAsShip, 1, (phoneme) => ({
			...phoneme,
			NBestPhonemes: [...(phoneme.NBestPhonemes ?? []), { Phoneme: "ʔ", Score: 1 }],
		}));
		const vowel = scoredAt(evidenceFor(response, SHIP), 1);
		expect(vowel.rivals[0]).toEqual({ phonemeId: "I", score: 1 });
		expect(vowel.targetScore).toBe(0.02);
	});

	it("caps a target missing from Azure's list at the lowest score listed", () => {
		const response = withPhoneme(sheepAsShip, 1, (phoneme) => ({
			...phoneme,
			NBestPhonemes: (phoneme.NBestPhonemes ?? []).slice(0, 4),
		}));
		expect(scoredAt(evidenceFor(response, SHIP), 1).targetScore).toBe(0.02);
	});

	it("falls back to the accuracy score with no rivals when Azure lists no n-best", () => {
		const response = withPhoneme(sheepAsShip, 1, (phoneme) => ({ ...phoneme, NBestPhonemes: [] }));
		expect(scoredAt(evidenceFor(response, SHIP), 1)).toMatchObject({
			targetScore: 0.35,
			rivals: [],
		});
	});

	it("scores each accepted pronunciation it can line up and omits the rest", () => {
		const evidence = evidenceFor(shipAsShip, request("ship", "SH IX P", "SH I P", "K AE T"));
		expect(
			evidence.pronunciations.map((pronunciation) => pronunciation.pronunciationIndex),
		).toEqual([0, 1]);
		expect(soundsOf(evidence, 1)[1]).toMatchObject({ phonemeId: "I", targetScore: 0.02 });
	});

	it("returns empty evidence when Azure heard no speech", () => {
		expect(azureEvidenceFromResponse(silenceAsShip, SHIP)).toEqual({
			words: [{ pronunciations: [] }],
		});
	});

	it("marks a word Azure says was left out as omitted, unlike one it had no evidence for", () => {
		const copy = structuredClone(shipAsShip);
		copy.NBest[0].Words[0].ErrorType = "Omission";
		expect(azureEvidenceFromResponse(copy, SHIP).words).toEqual([
			{ pronunciations: [], omitted: true },
		]);
	});

	it("returns empty evidence for a target word Azure didn't return", () => {
		const scoring = request("sheep", "SH I P");
		expect(azureEvidenceFromResponse(shipAsShip, scoring).words).toEqual([{ pronunciations: [] }]);
	});

	it("matches curly apostrophes to Azure's straight ones", () => {
		const copy = structuredClone(shipAsShip);
		copy.NBest[0].Words[0].Word = "don't";
		for (const text of ["don’t", "donʼt", "don't"]) {
			expect(evidenceFor(copy, request(text, "SH IX P")).pronunciations).toHaveLength(1);
		}
	});

	it("ignores quotes around a target word", () => {
		for (const text of ["'ship'", "‘ship’", '"ship"']) {
			expect(evidenceFor(shipAsShip, request(text, "SH IX P")).pronunciations).toHaveLength(1);
		}
	});

	it("leaves out a span that could belong to either of two expected sounds", () => {
		// Azure scores probably as p ɹ ɑ b l i, with one b for two.
		const phoneme = (symbol: string, index: number, nBest = [{ Phoneme: symbol, Score: 100 }]) => ({
			Phoneme: symbol,
			Offset: index * 1_000_000,
			Duration: 1_000_000,
			AccuracyScore: 100,
			NBestPhonemes: nBest,
		});
		const response: AzureAssessmentResponse = {
			RecognitionStatus: "Success",
			NBest: [
				{
					Words: [
						{
							Word: "probably",
							ErrorType: "None",
							Phonemes: [
								phoneme("p", 0),
								phoneme("ɹ", 1),
								phoneme("ɑ", 2),
								phoneme("b", 3, [
									{ Phoneme: "p", Score: 100 },
									{ Phoneme: "b", Score: 1 },
								]),
								phoneme("l", 4),
								phoneme("i", 5),
							],
						},
					],
				},
			],
		};
		const evidence = evidenceFor(response, request("probably", "P R A B AX B L I"));
		expect(soundsOf(evidence).map((sound) => sound.type)).toEqual([
			"scored",
			"scored",
			"scored",
			"missing",
			"missing",
			"missing",
			"scored",
			"scored",
		]);
		expect(verdicts(evidence, ["B"])).toEqual([
			{ type: "unclear", reason: "no-evidence" },
			{ type: "unclear", reason: "no-evidence" },
		]);
	});

	it("matches target words to Azure's words regardless of case and punctuation", () => {
		const evidence = evidenceFor(shipAsShip, request("Ship!", "SH IX P"));
		expect(evidence.pronunciations).toHaveLength(1);
	});
});

describe("azureEvidenceFromResponse with miscue and plain recognition", () => {
	const recordingFor = (said: keyof typeof MISCUE_FIXTURES) => {
		const { assessment, recognition } = MISCUE_FIXTURES[said];
		return azureEvidenceFromResponse(assessment, SHIP, recognition);
	};

	it("adds the transcript and its confidence", () => {
		expect(recordingFor("ship").transcript).toEqual({ words: ["ship"], confidence: 0.5588007 });
		expect(recordingFor("a ship").transcript).toEqual({
			words: ["a", "ship"],
			confidence: 0.7885341,
		});
	});

	it("has no transcript without a recognition response", () => {
		expect(azureEvidenceFromResponse(MISCUE_FIXTURES.ship.assessment, SHIP)).not.toHaveProperty(
			"transcript",
		);
	});

	it("tells silence, which Azure marks as an omitted target, by its null transcript", () => {
		expect(recordingFor("silence")).toEqual({
			words: [{ pronunciations: [], omitted: true }],
			insertedWords: [],
			transcript: null,
		});
	});

	it("marks an unrelated word's target as omitted, with what was said in the transcript", () => {
		const recording = recordingFor("kid");
		expect(recording.words).toEqual([{ pronunciations: [], omitted: true }]);
		expect(recording.transcript?.words).toEqual(["kid"]);
	});

	it("still scores ships as ship, with a low word and final sound accuracy", () => {
		const recording = recordingFor("ships");
		const [word] = recording.words;
		expect(word.accuracy).toBe(0.7);
		expect(
			word.pronunciations[0].sounds.map((sound) => sound.type === "scored" && sound.accuracy),
		).toEqual([1, 1, 0.16]);
		expect(recording.transcript?.words).toEqual(["ships"]);
	});

	it("keeps the swap in a partner word's evidence", () => {
		const evidence = recordingFor("sheep").words[0];
		expect(verdicts(evidence, ["IX", "I"])).toEqual([{ type: "swapped", heard: "I" }]);
	});

	it("lists words Azure marked as inserted", () => {
		const copy = structuredClone(MISCUE_FIXTURES.ship.assessment) as unknown as {
			NBest: { Words: { Word: string; ErrorType: string }[] }[];
		};
		copy.NBest[0].Words.push({ Word: "Ship", ErrorType: "Insertion" });
		const recording = azureEvidenceFromResponse(copy as unknown as AzureAssessmentResponse, SHIP);
		expect(recording.insertedWords).toEqual(["ship"]);
		expect(recording.words[0].pronunciations).toHaveLength(1);
	});
});

describe("azureTranscript", () => {
	it("is null when Azure heard no speech", () => {
		for (const RecognitionStatus of ["NoMatch", "InitialSilenceTimeout", "BabbleTimeout"]) {
			expect(azureTranscript({ RecognitionStatus })).toBeNull();
		}
		expect(
			azureTranscript({ RecognitionStatus: "Success", NBest: [{ Lexical: "", Confidence: 0 }] }),
		).toBeNull();
	});

	it("is undefined when the response says nothing either way", () => {
		expect(azureTranscript({ RecognitionStatus: "Error" })).toBeUndefined();
	});

	it("splits the lexical form into plain lowercase words", () => {
		expect(
			azureTranscript({
				RecognitionStatus: "Success",
				NBest: [{ Lexical: "The  ship's ok.", Confidence: 0.9 }],
			}),
		).toEqual({ words: ["the", "ship's", "ok"], confidence: 0.9 });
	});
});
