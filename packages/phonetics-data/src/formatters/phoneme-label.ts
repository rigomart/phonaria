import type { PhonemeArticulation } from "../core/phoneme-articulations";
import type { TargetAccent } from "../core/types";
import type { LanguagePhonemeId } from "../languages/inventories";
import { getPhonemeArticulationRegistryForLanguage } from "../registries/registries";

function capitalize(value: string): string {
	return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

/** Formats a phoneme's articulation label for the selected target accent. */
export function formatPhonemeLabel<TLanguage extends TargetAccent>(
	targetAccent: TLanguage,
	phonemeId: LanguagePhonemeId<TLanguage>,
): string {
	const registry = getPhonemeArticulationRegistryForLanguage(targetAccent) as Record<
		LanguagePhonemeId<TLanguage>,
		PhonemeArticulation
	>;
	const articulation = registry[phonemeId];

	if (articulation.category === "consonant") {
		const { manner, place, voicing } = articulation.features;
		return capitalize(`${voicing} ${place} ${manner.replace("-", " ")}`);
	}

	const { backness, height, roundness } = articulation.features;
	if (articulation.vowelType === "monophthong") {
		const ending = articulation.features.rhoticity ?? roundness;
		return capitalize(`${height} ${backness} ${ending} vowel`);
	}

	const { targetBackness, targetHeight, targetRoundness } = articulation.features;
	return capitalize(
		`${height} ${backness} ${roundness} to ${targetHeight} ${targetBackness} ${targetRoundness} diphthong`,
	);
}
