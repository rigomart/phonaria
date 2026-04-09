import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { create } from "zustand";
import { type AnswerResult, checkAnswer } from "@/lib/answer-checker";
import { selectWords } from "@/lib/word-pool";

export type Difficulty = "easy" | "hard";
export type GamePhase = "menu" | "playing" | "results";

export type RoundResult = {
	word: string;
	cmuVariants: string[];
	playerInput: EnglishPhonemeSymbolId[];
	answerResult: AnswerResult;
};

const TOTAL_ROUNDS = 5;

type GameState = {
	// Phase
	phase: GamePhase;
	difficulty: Difficulty;

	// Round state
	currentRound: number;
	totalRounds: number;
	words: string[];
	wordVariants: Record<string, string[]>;
	currentInput: EnglishPhonemeSymbolId[];

	// Results
	roundResults: RoundResult[];
	score: number;

	// Actions
	startGame: (difficulty: Difficulty) => void;
	addPhoneme: (phonemeId: EnglishPhonemeSymbolId) => void;
	removeLastPhoneme: () => void;
	clearInput: () => void;
	submitAnswer: () => void;
	resetGame: () => void;
};

export const useGameStore = create<GameState>((set, get) => ({
	phase: "menu",
	difficulty: "easy",
	currentRound: 0,
	totalRounds: TOTAL_ROUNDS,
	words: [],
	wordVariants: {},
	currentInput: [],
	roundResults: [],
	score: 0,

	startGame: (difficulty) => {
		const gameWords = selectWords(TOTAL_ROUNDS);
		const words = gameWords.map((gw) => gw.word);
		const wordVariants: Record<string, string[]> = {};
		for (const gw of gameWords) {
			wordVariants[gw.word] = gw.cmuVariants;
		}

		set({
			phase: "playing",
			difficulty,
			currentRound: 0,
			words,
			wordVariants,
			currentInput: [],
			roundResults: [],
			score: 0,
		});
	},

	addPhoneme: (phonemeId) => {
		set((state) => ({
			currentInput: [...state.currentInput, phonemeId],
		}));
	},

	removeLastPhoneme: () => {
		set((state) => ({
			currentInput: state.currentInput.slice(0, -1),
		}));
	},

	clearInput: () => {
		set({ currentInput: [] });
	},

	submitAnswer: () => {
		const state = get();
		const currentWord = state.words[state.currentRound];
		const variants = state.wordVariants[currentWord];
		const answerResult = checkAnswer(state.currentInput, variants);

		const roundResult: RoundResult = {
			word: currentWord,
			cmuVariants: variants,
			playerInput: [...state.currentInput],
			answerResult,
		};

		const newResults = [...state.roundResults, roundResult];
		const newScore = state.score + (answerResult.isCorrect ? 1 : 0);
		const nextRound = state.currentRound + 1;

		if (nextRound >= TOTAL_ROUNDS) {
			set({
				roundResults: newResults,
				score: newScore,
				phase: "results",
				currentInput: [],
			});
		} else {
			set({
				roundResults: newResults,
				score: newScore,
				currentRound: nextRound,
				currentInput: [],
			});
		}
	},

	resetGame: () => {
		set({
			phase: "menu",
			difficulty: "easy",
			currentRound: 0,
			words: [],
			wordVariants: {},
			currentInput: [],
			roundResults: [],
			score: 0,
		});
	},
}));
