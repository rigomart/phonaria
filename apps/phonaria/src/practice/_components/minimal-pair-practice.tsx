/**
 * The word lives in the contrast page's URL, so a word can be reloaded or
 * shared. Without a word, or with one outside the contrast's pairs, it draws
 * one in the browser, after hydration, since the draw is random; until then a
 * hidden round holds its space, so the pairs below don't move. New words
 * replace the history entry, so Back leaves the page rather than stepping
 * through every word.
 */
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { drawWord, promptFor } from "../_lib/minimal-pair-prompt";
import { SpeakingRound } from "./speaking-round";

function ReservedRoundSpace({ contrast }: { contrast: string }) {
	const firstWord = drawWord(contrast, undefined, () => 0);
	const standIn = firstWord ? promptFor(contrast, firstWord) : null;
	if (!standIn) return null;
	return (
		<div className="invisible" inert>
			<SpeakingRound onNextWord={() => {}} prompt={standIn} />
		</div>
	);
}

export function MinimalPairPractice({ contrast, word }: { contrast: string; word?: string }) {
	const navigate = useNavigate();
	const prompt = useMemo(() => (word ? promptFor(contrast, word) : null), [contrast, word]);

	useEffect(() => {
		if (prompt) return;
		const drawn = drawWord(contrast);
		if (drawn) {
			void navigate({
				to: "/minimal-pairs/$contrast",
				params: { contrast },
				search: { word: drawn },
				replace: true,
				resetScroll: false,
			});
		}
	}, [contrast, prompt, navigate]);

	if (!prompt) return <ReservedRoundSpace contrast={contrast} />;

	function nextWord() {
		if (!prompt) return;
		const next = drawWord(prompt.contrastId, prompt.word);
		if (!next) return;
		void navigate({
			to: "/minimal-pairs/$contrast",
			params: { contrast: prompt.contrastId },
			search: { word: next },
			replace: true,
			resetScroll: false,
		});
	}

	return (
		<SpeakingRound
			key={`${prompt.contrastId}-${prompt.word}`}
			onNextWord={nextWord}
			prompt={prompt}
		/>
	);
}
