import type { Feature } from "./feature";
import { transcription } from "./transcription";

export const features: Record<string, Feature> = {
	transcription,
};

export function getFeature(name: string | undefined, available = features): Feature {
	if (!name) throw new Error(`Choose a feature: ${Object.keys(available).join(", ")}.`);
	if (!Object.hasOwn(available, name))
		throw new Error(`Unknown feature: ${name}. Available: ${Object.keys(available).join(", ")}.`);
	return available[name];
}
