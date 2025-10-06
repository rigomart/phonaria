import type { VowelArticulation, VowelPhoneme } from "../types";
import { vowels } from "../vowels";

export interface DiphthongEndPosition {
	height: VowelArticulation["height"];
	frontness: VowelArticulation["frontness"];
	roundness: VowelArticulation["roundness"];
}

const END_VOWEL_MAP: Record<string, string> = {
	ɪ: "ɪ",
	ʊ: "ʊ",
	i: "i",
	u: "u",
};

export function getDiphthongEndPosition(diphthongSymbol: string): DiphthongEndPosition | null {
	const lastChar = diphthongSymbol.slice(-1);
	const secondLastChar = diphthongSymbol.slice(-2, -1);

	let targetSymbol: string | null = null;

	if (END_VOWEL_MAP[lastChar]) {
		targetSymbol = END_VOWEL_MAP[lastChar];
	} else if (secondLastChar && END_VOWEL_MAP[secondLastChar + lastChar]) {
		targetSymbol = END_VOWEL_MAP[secondLastChar + lastChar];
	}

	if (!targetSymbol) {
		return null;
	}

	const endVowel = vowels.find((v) => v.symbol === targetSymbol && v.type === "monophthong");

	if (!endVowel) {
		return null;
	}

	return {
		height: endVowel.articulation.height,
		frontness: endVowel.articulation.frontness,
		roundness: endVowel.articulation.roundness,
	};
}

export interface DiphthongTrajectory {
	diphthong: VowelPhoneme;
	start: {
		height: VowelArticulation["height"];
		frontness: VowelArticulation["frontness"];
		roundness: VowelArticulation["roundness"];
	};
	end: DiphthongEndPosition;
}

export function getDiphthongTrajectories(diphthongs: VowelPhoneme[]): DiphthongTrajectory[] {
	const trajectories: DiphthongTrajectory[] = [];

	for (const diphthong of diphthongs) {
		const endPosition = getDiphthongEndPosition(diphthong.symbol);

		if (endPosition) {
			trajectories.push({
				diphthong,
				start: {
					height: diphthong.articulation.height,
					frontness: diphthong.articulation.frontness,
					roundness: diphthong.articulation.roundness,
				},
				end: endPosition,
			});
		}
	}

	return trajectories;
}
