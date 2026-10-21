import {
	EnglishPhonemeAllophones,
	EnglishPhonemeContrasts,
	findSubstitution,
	getSinglePronunciation,
	type PhonemeSymbolId,
	toBasePhonemeIds,
} from "@phonaria/phonetics-data";
import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import { describe, expect, it } from "vitest";
import { allowedVariants } from "./allowed-variants";
import { AZURE_JUDGE_THRESHOLDS } from "./azure/judge-thresholds";
import type {
	MissingSoundEvidence,
	RivalScore,
	Scorer,
	RecordingEvidence,
	ScoringRequest,
	SoundEvidence,
} from "./contract";
import {
	contrastPartners,
	createWordFinder,
	judgeWord,
	type JudgeThresholds,
	LENIENT_MARGINS,
	marginsFor,
} from "./judge";

// The i-ix contrast: IX is /ɪ/ as in "ship", I is /i/ as in "sheep".
const SHIP_SHEEP = new Set<PhonemeSymbolId>(["IX", "I"]);
const audio = new Uint8Array(44);

function scored(phonemeId: PhonemeSymbolId, targetScore: number, rivals: RivalScore[] = []) {
	return {
		type: "scored",
		phonemeId,
		startSeconds: 0,
		endSeconds: 0.1,
		targetScore,
		rivals,
	} satisfies SoundEvidence;
}

function missing(phonemeId: PhonemeSymbolId): MissingSoundEvidence {
	return { type: "missing", phonemeId };
}

function fakeScorer(evidence: RecordingEvidence): Scorer {
	return { score: async () => evidence };
}

async function judgeShip(vowel: SoundEvidence | MissingSoundEvidence) {
	const request: ScoringRequest = {
		targetAccent: "en-us",
		words: [{ text: "ship", acceptedPronunciations: [["SH", "IX", "P"]] }],
	};
	const recording = await fakeScorer({
		words: [
			{
				pronunciations: [
					{ pronunciationIndex: 0, sounds: [scored("SH", 0.9), vowel, scored("P", 0.9)] },
				],
			},
		],
	}).score(audio, request);
	const [evidence] = recording.words;
	return judgeWord({ evidence, judgedPhonemeIds: SHIP_SHEEP, targetAccent: "en-us" });
}

describe("judgeWord", () => {
	it("matches when the target clearly wins", async () => {
		const judgement = await judgeShip(scored("IX", 0.9, [{ phonemeId: "I", score: 0.3 }]));
		expect(judgement?.sounds).toEqual([
			{ position: 1, phonemeId: "IX", verdict: { type: "match" } },
		]);
	});

	it("names the partner when the partner clearly wins", async () => {
		const judgement = await judgeShip(scored("IX", 0.2, [{ phonemeId: "I", score: 0.9 }]));
		expect(judgement?.sounds[0]?.verdict).toEqual({ type: "swapped", heard: "I" });
	});

	it("is a close call when the target and its partner are within the margins", async () => {
		for (const partnerScore of [0.62, 0.58, 0.79]) {
			const judgement = await judgeShip(
				scored("IX", 0.6, [{ phonemeId: "I", score: partnerScore }]),
			);
			expect(judgement?.sounds[0]?.verdict).toEqual({ type: "unclear", reason: "close-call" });
		}
	});

	it("is unclear when a rival that is not a contrast partner wins", async () => {
		const judgement = await judgeShip(
			scored("IX", 0.2, [
				{ phonemeId: "I", score: 0.3 },
				{ phonemeId: "E", score: 0.9 },
			]),
		);
		expect(judgement?.sounds[0]?.verdict).toEqual({ type: "unclear", reason: "other-sound" });
	});

	it("is another sound when a rival that is not a partner is close behind the target", async () => {
		const judgement = await judgeShip(scored("IX", 0.6, [{ phonemeId: "E", score: 0.58 }]));
		expect(judgement?.sounds[0]?.verdict).toEqual({ type: "unclear", reason: "other-sound" });
	});

	it("is unclear when a partner ties for the win with a rival that is not a partner", async () => {
		for (const rivals of [
			[
				{ phonemeId: "I", score: 0.9 },
				{ phonemeId: "E", score: 0.9 },
			],
			[
				{ phonemeId: "E", score: 0.9 },
				{ phonemeId: "I", score: 0.9 },
			],
		] satisfies RivalScore[][]) {
			const judgement = await judgeShip(scored("IX", 0.2, rivals));
			expect(judgement?.sounds[0]?.verdict).toEqual({ type: "unclear", reason: "other-sound" });
		}
	});

	it("counts a difference exactly on a margin as reaching it", async () => {
		const match = await judgeShip(scored("IX", 0.35, [{ phonemeId: "I", score: 0.3 }]));
		expect(match?.sounds[0]?.verdict).toEqual({ type: "match" });
		const swapped = await judgeShip(scored("IX", 0.5, [{ phonemeId: "I", score: 0.7 }]));
		expect(swapped?.sounds[0]?.verdict).toEqual({ type: "swapped", heard: "I" });
	});

	it("is unclear when a judged sound has no evidence", async () => {
		const judgement = await judgeShip(missing("IX"));
		expect(judgement?.sounds[0]?.verdict).toEqual({ type: "unclear", reason: "no-evidence" });
	});

	it("matches on the target score alone when there are no rivals", async () => {
		expect((await judgeShip(scored("IX", 0.8)))?.sounds[0]?.verdict).toEqual({ type: "match" });
		expect((await judgeShip(scored("IX", 0.3)))?.sounds[0]?.verdict).toEqual({
			type: "unclear",
			reason: "other-sound",
		});
	});

	it("judges against the accepted pronunciation the evidence fits best", () => {
		const judgement = judgeWord({
			evidence: {
				pronunciations: [
					{
						pronunciationIndex: 0,
						sounds: [scored("B", 0.8), scored("IX", 0.3, [{ phonemeId: "I", score: 0.9 }])],
					},
					{
						pronunciationIndex: 1,
						sounds: [scored("B", 0.8), scored("I", 0.9, [{ phonemeId: "IX", score: 0.3 }])],
					},
				],
			},
			judgedPhonemeIds: SHIP_SHEEP,
			targetAccent: "en-us",
		});
		expect(judgement).toEqual({
			pronunciationIndex: 1,
			sounds: [{ position: 1, phonemeId: "I", verdict: { type: "match" } }],
		});
	});

	it("leaves sounds outside the judged set without a verdict", async () => {
		const judgement = await judgeShip(scored("IX", 0.9));
		expect(judgement?.sounds.map((sound) => sound.phonemeId)).toEqual(["IX"]);
	});

	it("gives each occurrence of a judged sound its own verdict", () => {
		const judgement = judgeWord({
			evidence: {
				pronunciations: [
					{
						pronunciationIndex: 0,
						sounds: [
							scored("V", 0.9),
							scored("IX", 0.9, [{ phonemeId: "I", score: 0.2 }]),
							scored("Z", 0.9),
							scored("IX", 0.2, [{ phonemeId: "I", score: 0.9 }]),
							scored("T", 0.9),
						],
					},
				],
			},
			judgedPhonemeIds: SHIP_SHEEP,
			targetAccent: "en-us",
		});
		expect(judgement?.sounds).toEqual([
			{ position: 1, phonemeId: "IX", verdict: { type: "match" } },
			{ position: 3, phonemeId: "IX", verdict: { type: "swapped", heard: "I" } },
		]);
	});

	it("returns null when no accepted pronunciation could be lined up", () => {
		expect(
			judgeWord({
				evidence: { pronunciations: [] },
				judgedPhonemeIds: SHIP_SHEEP,
				targetAccent: "en-us",
			}),
		).toBeNull();
	});
});

function judgeEvery(sounds: (SoundEvidence | MissingSoundEvidence)[], findWord = curatedWords) {
	return judgeWord({
		evidence: { pronunciations: [{ pronunciationIndex: 0, sounds }] },
		targetAccent: "en-us",
		findWord,
	});
}

const curatedWords = createWordFinder(
	Object.entries(EnglishCuratedTop10k.words).map(
		([word, variants]) => [word, variants.map(toBasePhonemeIds)] as const,
	),
);

describe("judgeWord with every sound judged", () => {
	it("gives every sound in the word its own verdict", () => {
		const judgement = judgeEvery([
			scored("SH", 0.1, [{ phonemeId: "CH", score: 1 }]),
			scored("IX", 1, [{ phonemeId: "I", score: 0.2 }]),
			scored("P", 0.6, [{ phonemeId: "B", score: 0.7 }]),
		]);
		expect(judgement?.sounds).toEqual([
			{
				position: 0,
				phonemeId: "SH",
				verdict: { type: "swapped", heard: "CH", heardWord: "chip" },
			},
			{ position: 1, phonemeId: "IX", verdict: { type: "match" } },
			{ position: 2, phonemeId: "P", verdict: { type: "unclear", reason: "close-call" } },
		]);
	});

	it("only matches or is unclear on a sound with no contrast partners", () => {
		expect(contrastPartners("en-us", "H").size).toBe(0);
		const hat = (h: SoundEvidence) =>
			judgeEvery([h, scored("AE", 1), scored("T", 1)])?.sounds[0]?.verdict;
		expect(hat(scored("H", 0.9, [{ phonemeId: "F", score: 0.1 }]))).toEqual({ type: "match" });
		expect(hat(scored("H", 0, [{ phonemeId: "F", score: 1 }]))).toEqual({
			type: "unclear",
			reason: "other-sound",
		});
		expect(hat(scored("H", 0.2))).toEqual({ type: "unclear", reason: "other-sound" });
	});

	it("names the word a swap makes when the dictionary has it", () => {
		const judgement = judgeEvery([
			scored("SH", 1),
			scored("IX", 0, [{ phonemeId: "I", score: 1 }]),
			scored("P", 1),
		]);
		expect(judgement?.sounds[1]?.verdict).toEqual({
			type: "swapped",
			heard: "I",
			heardWord: "sheep",
		});
	});

	it("names no word when the swap makes none", () => {
		const shib = judgeEvery([
			scored("SH", 1),
			scored("IX", 1),
			scored("P", 0, [{ phonemeId: "B", score: 1 }]),
		]);
		expect(shib?.sounds[2]?.verdict).toEqual({ type: "swapped", heard: "B" });
	});

	it("names no word without a word finder", () => {
		const judgement = judgeWord({
			evidence: {
				pronunciations: [
					{
						pronunciationIndex: 0,
						sounds: [
							scored("SH", 1),
							scored("IX", 0, [{ phonemeId: "I", score: 1 }]),
							scored("P", 1),
						],
					},
				],
			},
			targetAccent: "en-us",
		});
		expect(judgement?.sounds[1]?.verdict).toEqual({ type: "swapped", heard: "I" });
	});
});

describe("judgeWord on allowed en-us variants", () => {
	const heardAs = (target: PhonemeSymbolId, variant: PhonemeSymbolId) =>
		scored(target, 0.1, [{ phonemeId: variant, score: 1 }]);
	const verdictAt = (position: number, sounds: (SoundEvidence | MissingSoundEvidence)[]) =>
		judgeEvery(sounds)?.sounds[position]?.verdict;

	it("matches the flapped /t/ of water heard as /d/", () => {
		expect(
			verdictAt(2, [scored("W", 1), scored("O", 1), heardAs("T", "D"), scored("ER", 1)]),
		).toEqual({ type: "match" });
	});

	it("matches the flapped /t/ of water heard as the flap itself", () => {
		expect(
			verdictAt(2, [scored("W", 1), scored("O", 1), heardAs("T", "RX"), scored("ER", 1)]),
		).toEqual({ type: "match" });
	});

	it("matches the flapped /d/ of ladder heard as /t/ or as the flap", () => {
		for (const variant of ["T", "RX"] as const) {
			expect(
				verdictAt(2, [scored("L", 1), scored("AE", 1), heardAs("D", variant), scored("ER", 1)]),
			).toEqual({ type: "match" });
		}
	});

	it("matches the unaspirated /p/ of spin heard as /b/", () => {
		expect(
			verdictAt(1, [scored("S", 1), heardAs("P", "B"), scored("IX", 1), scored("N", 1)]),
		).toEqual({ type: "match" });
	});

	it("matches the unaspirated /k/ of skate heard as /ɡ/", () => {
		expect(
			verdictAt(1, [scored("S", 1), heardAs("K", "G"), scored("EI", 1), scored("T", 1)]),
		).toEqual({ type: "match" });
	});

	it("matches /p/ and /k/ heard as /b/ and /ɡ/ after a word-initial /s/", () => {
		const words: Record<string, readonly PhonemeSymbolId[]> = {
			spin: ["S", "P", "IX", "N"],
			skate: ["S", "K", "EI", "T"],
			school: ["S", "K", "U", "L"],
			sky: ["S", "K", "AI"],
		};
		for (const [word, pronunciation] of Object.entries(words)) {
			const sounds = pronunciation.map((id, index) =>
				index === 1 ? heardAs(id, id === "P" ? "B" : "G") : scored(id, 1),
			);
			expect(verdictAt(1, sounds), word).toEqual({ type: "match" });
		}
	});

	it("names /ɡ/ and /b/ after an /s/ inside a word, where voicing is a contrast", () => {
		const swappedAt = (pronunciation: readonly PhonemeSymbolId[], heard: PhonemeSymbolId) => {
			const position = pronunciation.findIndex(
				(id, index) => index > 1 && pronunciation[index - 1] === "S",
			);
			const sounds = pronunciation.map((id, index) =>
				index === position ? heardAs(id, heard) : scored(id, 1),
			);
			return verdictAt(position, sounds);
		};
		// discussed said as disgust
		expect(swappedAt(["D", "IX", "S", "K", "AH", "S", "T"], "G")).toEqual({
			type: "swapped",
			heard: "G",
		});
		// disperse said as disburse
		expect(swappedAt(["D", "IX", "S", "P", "ER", "S"], "B")).toEqual({
			type: "swapped",
			heard: "B",
		});
	});

	it("still names the partner outside the variant's context", () => {
		expect(verdictAt(0, [heardAs("T", "D"), scored("AI", 1)])).toEqual({
			type: "swapped",
			heard: "D",
			heardWord: "die",
		});
		expect(verdictAt(0, [heardAs("P", "B"), scored("IX", 1), scored("G", 1)])).toEqual({
			type: "swapped",
			heard: "B",
			heardWord: "big",
		});
	});

	it("still weighs other rivals against a variant", () => {
		expect(
			verdictAt(2, [
				scored("W", 1),
				scored("O", 1),
				scored("T", 0.1, [
					{ phonemeId: "D", score: 1 },
					{ phonemeId: "TH", score: 1 },
				]),
				scored("ER", 1),
			]),
		).toEqual({ type: "unclear", reason: "close-call" });
	});

	it("handles every en-us allophone: by a variant rule, or as the phoneme itself", () => {
		const reportedAs: Record<string, readonly PhonemeSymbolId[]> = {
			"T vowel-to-vowel-flap": ["RX", "D"],
			"D vowel-to-vowel-flap": ["RX", "T"],
			"P after-s-onset-unaspirated": ["B"],
			"K after-s-onset-unaspirated": ["G"],
			// The glottal stop has no phoneme to be heard as, but button's /t/ is between vowels too.
			"T t-before-syllabic-n-glottal": ["RX", "D"],
		};
		const examples: Record<string, readonly PhonemeSymbolId[]> = {
			pin: ["P", "IX", "N"],
			spin: ["S", "P", "IX", "N"],
			top: ["T", "A", "P"],
			time: ["T", "AI", "M"],
			water: ["W", "O", "T", "ER"],
			button: ["B", "AH", "T", "AX", "N"],
			cat: ["K", "AE", "T"],
			skate: ["S", "K", "EI", "T"],
			ladder: ["L", "AE", "D", "ER"],
			ball: ["B", "O", "L"],
			seed: ["S", "I", "D"],
			seat: ["S", "I", "T"],
			bad: ["B", "AE", "D"],
			bat: ["B", "AE", "T"],
			bird: ["B", "ER", "D"],
		};
		for (const [phonemeId, allophones] of Object.entries(EnglishPhonemeAllophones)) {
			for (const {
				contextKey,
				examples: [{ word }],
			} of allophones ?? []) {
				const pronunciation = examples[word];
				expect(pronunciation, word).toBeDefined();
				const position = pronunciation.indexOf(phonemeId as PhonemeSymbolId);
				const variants = [...allowedVariants("en-us", pronunciation, position)];
				expect(variants, `${phonemeId} ${contextKey} in ${word}`).toEqual(
					reportedAs[`${phonemeId} ${contextKey}`] ?? [],
				);
			}
		}
		// /p/ and /k/ after /s/ only start a word: inside one, voicing is a contrast.
		const discussed: PhonemeSymbolId[] = ["D", "IX", "S", "K", "AH", "S", "T"];
		const disperse: PhonemeSymbolId[] = ["D", "IX", "S", "P", "ER", "S"];
		expect([...allowedVariants("en-us", discussed, 3)], "K in discussed").toEqual([]);
		expect([...allowedVariants("en-us", disperse, 3)], "P in disperse").toEqual([]);
	});

	it("hides no minimal pair in the contrast catalog", () => {
		const pronunciationOf = (word: string) =>
			getSinglePronunciation(EnglishCuratedTop10k.words[word] ?? []) ?? [];
		for (const { id, minimalPairs } of EnglishPhonemeContrasts) {
			for (const { words } of minimalPairs) {
				const [first, second] = words.map(pronunciationOf);
				const swap = findSubstitution(first, second);
				if (!swap) throw new Error(`${id}: ${words.join("/")} differ by more than one sound`);
				expect(allowedVariants("en-us", first, swap.index).has(swap.to), words.join("/")).toBe(
					false,
				);
				expect(allowedVariants("en-us", second, swap.index).has(swap.from), words.join("/")).toBe(
					false,
				);
			}
		}
	});
});

describe("judgeWord with per-sound thresholds", () => {
	const evidence = {
		pronunciations: [
			{
				pronunciationIndex: 0,
				sounds: [
					scored("B", 0.9),
					scored("IX", 0.5, [{ phonemeId: "I", score: 0.8 }]),
					scored("T", 0.5, [{ phonemeId: "D", score: 0.8 }]),
				],
			},
		],
	};
	const verdicts = (margins?: Parameters<typeof judgeWord>[0]["margins"]) =>
		judgeWord({ evidence, targetAccent: "en-us", margins })?.sounds.map(
			({ verdict }) => verdict.type,
		);

	it("applies a sound's own margins and the default to the rest", () => {
		const thresholds: JudgeThresholds = {
			default: LENIENT_MARGINS,
			bySound: { IX: { swap: 0.35 } },
		};
		expect(verdicts(LENIENT_MARGINS)).toEqual(["match", "swapped", "swapped"]);
		expect(verdicts(thresholds)).toEqual(["match", "unclear", "swapped"]);
		expect(marginsFor(thresholds, "IX")).toEqual({ ...LENIENT_MARGINS, swap: 0.35 });
		expect(marginsFor(thresholds, "T")).toBe(LENIENT_MARGINS);
	});

	it("uses the thresholds tuned for Azure when none are given", () => {
		const [phonemeId, own] = Object.entries(AZURE_JUDGE_THRESHOLDS.bySound)[0] as [
			PhonemeSymbolId,
			{ swap: number },
		];
		const [partner] = contrastPartners("en-us", phonemeId);
		const gap = (AZURE_JUDGE_THRESHOLDS.default.swap + own.swap) / 2;
		const sound = scored(phonemeId, 0.2, [{ phonemeId: partner, score: 0.2 + gap }]);
		const judge = (margins?: JudgeThresholds) =>
			judgeWord({
				evidence: { pronunciations: [{ pronunciationIndex: 0, sounds: [sound] }] },
				targetAccent: "en-us",
				margins,
			})?.sounds[0]?.verdict;
		expect(judge(AZURE_JUDGE_THRESHOLDS)).toEqual({ type: "unclear", reason: "close-call" });
		expect(judge()).toEqual(judge(AZURE_JUDGE_THRESHOLDS));
		expect(judge({ ...AZURE_JUDGE_THRESHOLDS, bySound: {} })?.type).toBe("swapped");
	});
});
