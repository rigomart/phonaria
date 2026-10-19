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
