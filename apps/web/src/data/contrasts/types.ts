export type MinimalPairCategory = "vowel" | "consonant";

export type LearningStage = "foundation" | "core" | "situational" | "fineTuning";

export interface MinimalPairWordEntry {
	word: string;
	phonemic: string;
	graphemeHint?: string;
	audioUrl?: string;
	mouthHint?: string;
	pronunciationTip?: string;
	contextSentence?: string;
}

export interface MinimalPairExample {
	id: string;
	words: [MinimalPairWordEntry, MinimalPairWordEntry];
	contrastLabel: string;
	description?: string;
	practiceNote?: string;
}

export interface MinimalPairArticulationHighlight {
	phoneme: string;
	headline: string;
	details: string;
	illustrationUrl?: string;
}

export interface MinimalPairSet {
	id: string;
	slug: string;
	title: string;
	category: MinimalPairCategory;
	focusPhonemes: [string, string];
	summary: string;
	description?: string;
	learningStage: LearningStage;
	l1Notes?: string;
	articulationHighlights: MinimalPairArticulationHighlight[];
	pairs: MinimalPairExample[];
}
