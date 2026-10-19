export type {
	MissingSoundEvidence,
	PronunciationEvidence,
	RecordingEvidence,
	RivalScore,
	Scorer,
	ScoringRequest,
	SoundEvidence,
	SoundVerdict,
	TargetWord,
	WavAudio,
	WordEvidence,
} from "./contract";
export {
	judgeWord,
	LENIENT_MARGINS,
	type JudgeInput,
	type JudgeMargins,
	type SoundJudgement,
	type WordJudgement,
} from "./judge";
export { alignPhonemes } from "./alignment";
export {
	AZURE_DEFAULT_N_BEST_PHONEME_COUNT,
	createAzureScorer,
	requestAzureAssessment,
	type AzureScorerOptions,
} from "./azure/scorer";
export { azureEvidenceFromResponse } from "./azure/evidence";
export type {
	AzureAssessmentResponse,
	AzureNBestPhoneme,
	AzurePhoneme,
	AzureRecognition,
	AzureWord,
} from "./azure/response";
export { AzureIpaPhonemeMap, phonemeIdsForAzureSymbol } from "./azure/symbols";
