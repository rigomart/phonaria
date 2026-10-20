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
	Transcript,
	UnclearReason,
	WavAudio,
	WordEvidence,
} from "./contract";
export {
	createWordFinder,
	judgeWord,
	LENIENT_MARGINS,
	type JudgeInput,
	type JudgeMargins,
	type JudgeThresholds,
	type SoundJudgement,
	type WordFinder,
	type WordJudgement,
} from "./judge";
export {
	gateWord,
	type PronunciationLookup,
	WORD_GATE_MARGINS,
	type WordGate,
	type WordGateInput,
	type WordGateMargins,
} from "./word-gate";
export { alignPhonemes } from "./alignment";
export {
	AZURE_DEFAULT_N_BEST_PHONEME_COUNT,
	createAzureScorer,
	requestAzureAssessment,
	requestAzureRecognition,
	type AzureScorerOptions,
} from "./azure/scorer";
export { azureEvidenceFromResponse, azureTranscript } from "./azure/evidence";
export { AZURE_JUDGE_THRESHOLDS } from "./azure/judge-thresholds";
export type {
	AzureAssessmentResponse,
	AzureNBestPhoneme,
	AzurePhoneme,
	AzureRecognition,
	AzureRecognitionResponse,
	AzureWord,
} from "./azure/response";
export { AzureIpaPhonemeMap, phonemeIdsForAzureSymbol } from "./azure/symbols";
