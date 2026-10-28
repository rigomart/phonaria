/**
 * The contrast and word live in the URL, so a word can be reloaded or shared.
 * A contrast without a word draws one in the browser, after hydration, since
 * the draw is random. New words replace the history entry, so Back returns to
 * the list of pairs rather than stepping through every word.
 */
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { MinimalPairActivity } from "@/lib/practice/minimal-pair-activity";
import { drawWord, type MinimalPairSearch, promptFor } from "../_lib/minimal-pair-prompt";
import { ContrastPicker } from "./contrast-picker";
import { SpeakingRound } from "./speaking-round";

export function MinimalPairPractice({ search }: { search: MinimalPairSearch }) {
	const navigate = useNavigate();
	const { contrast, word } = search;
	const prompt = useMemo(
		() => (contrast && word ? promptFor(contrast, word) : null),
		[contrast, word],
	);

	useEffect(() => {
		if (!contrast || word) return;
		const drawn = drawWord(contrast);
		if (drawn) {
			void navigate({
				to: MinimalPairActivity.path,
				search: { contrast, word: drawn },
				replace: true,
			});
		}
	}, [contrast, word, navigate]);

	if (!contrast) return <ContrastPicker />;
	if (!prompt) return null;

	function nextWord() {
		if (!prompt) return;
		const next = drawWord(prompt.contrastId, prompt.word);
		if (!next) return;
		void navigate({
			to: MinimalPairActivity.path,
			search: { contrast: prompt.contrastId, word: next },
			replace: true,
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
