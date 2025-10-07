import type { VowelArticulation, VowelPhoneme } from "shared-data";
import { vowels } from "shared-data";

export interface DiphthongEndPosition {
	height: VowelArticulation["height"];
	frontness: VowelArticulation["frontness"];
	roundness: VowelArticulation["roundness"];
}

export function getDiphthongEndPosition(diphthong: VowelPhoneme): DiphthongEndPosition | null {
	// All diphthongs should have explicit glideTarget
	if (!diphthong.glideTarget) {
		return null;
	}

	const endVowel = vowels.find(
		(v) => v.symbol === diphthong.glideTarget && v.type === "monophthong",
	);

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
		const endPosition = getDiphthongEndPosition(diphthong);

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
