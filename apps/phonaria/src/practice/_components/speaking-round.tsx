"use client";

/**
 * One word to say, on the same calm centred column as a Practice round. The
 * parent keys it by word, so a new word starts with a fresh recorder and no
 * result.
 */
import { Button, buttonVariants } from "@phonaria/ui/components/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Volume2 } from "lucide-react";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { IpaSequence } from "@/components/transcription/display/ipa-sequence";
import { WordAudioButton } from "@/components/word-audio-button";
import { useWavRecorder } from "@/hooks/use-wav-recorder";
import { MinimalPairActivity } from "@/lib/practice/minimal-pair-activity";
import { sendEvidenceLog } from "@/lib/speech/evidence-log";
import {
	currentConsentGrant,
	onEvidenceLogConsentRevoked,
} from "@/lib/speech/evidence-log-consent";
import type { TranscribedSyllable } from "@/lib/types/g2p";
import { cn } from "@/lib/utils";
import { type AttemptLogger, createAttemptLogger } from "../_lib/evidence-log-attempt";
import type { MinimalPairPrompt } from "../_lib/minimal-pair-prompt";
import { attemptReducer, deriveSpeakingView, READY, scoreAttempt } from "../_lib/speaking-attempt";
import { loadWordSyllables } from "../_lib/word-syllables";
import { EvidenceLogSetting } from "./evidence-log-setting";
import { RecordButton } from "./record-button";
import { SoundResults } from "./sound-results";
import { SpeakingStatus } from "./speaking-result";

function useWordSyllables(word: string): TranscribedSyllable[] | null | undefined {
	const [loaded, setLoaded] = useState<{ word: string; syllables: TranscribedSyllable[] | null }>();
	useEffect(() => {
		let active = true;
		void loadWordSyllables(word).then((syllables) => {
			if (active) setLoaded({ word, syllables });
		});
		return () => {
			active = false;
		};
	}, [word]);
	return loaded?.word === word ? loaded.syllables : undefined;
}

/** Moving on unmounts the round; closing the page fires pagehide instead. */
function useAttemptLogger(word: string): AttemptLogger {
	// Made in the effect, so a result that resolves after unmount finds no logger.
	const current = useRef<AttemptLogger | null>(null);
	useEffect(() => {
		const logger = createAttemptLogger({
			word,
			currentGrant: currentConsentGrant,
			send: (payload) => void sendEvidenceLog(payload, (input, init) => fetch(input, init)),
		});
		current.current = logger;
		const pageHidden = () => logger.next("moved-on");
		window.addEventListener("pagehide", pageHidden);
		const unsubscribe = onEvidenceLogConsentRevoked(() => logger.drop());
		return () => {
			unsubscribe();
			window.removeEventListener("pagehide", pageHidden);
			logger.leave();
			current.current = null;
		};
	}, [word]);
	return useMemo(
		() => ({
			scored: (log) => current.current?.scored(log),
			next: (action) => current.current?.next(action),
			leave: () => current.current?.leave(),
			drop: () => current.current?.drop(),
		}),
		[],
	);
}

export function SpeakingRound({
	prompt,
	onNextWord,
}: {
	prompt: MinimalPairPrompt;
	onNextWord: () => void;
}) {
	const recorder = useWavRecorder();
	const [attempt, dispatch] = useReducer(attemptReducer, READY);
	const attemptCount = useRef(0);
	const syllables = useWordSyllables(prompt.word);
	const logger = useAttemptLogger(prompt.word);

	const recording = recorder.state;
	const { cancel } = recorder;
	useEffect(() => {
		if (recording.status !== "done") return;
		attemptCount.current += 1;
		const id = attemptCount.current;
		dispatch({ type: "submitted", id });
		cancel();
		void scoreAttempt(prompt, recording.audio, (input, init) => fetch(input, init)).then(
			(result) => {
				dispatch({ type: "scored", id, result });
				if (result.type === "outcome" && id === attemptCount.current) logger.scored(result.log);
			},
		);
	}, [recording, prompt, cancel, logger]);

	const view = deriveSpeakingView(recording, attempt);

	function record() {
		logger.next("retried");
		dispatch({ type: "reset" });
		void recorder.start();
	}

	return (
		<div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center gap-8 px-4 py-12 enter-fade">
			<p className="text-muted-foreground text-sm">
				{MinimalPairActivity.name}: <span className="font-display">/{prompt.target.ipa}/</span> and{" "}
				<span className="font-display">/{prompt.partner.ipa}/</span>
			</p>

			<div className="flex flex-col items-center gap-2 enter-rise">
				<h1 className="font-bold font-display text-5xl tracking-tight">{prompt.word}</h1>
				<div className="flex min-h-12 items-center md:min-h-14">
					{syllables ? (
						<IpaSequence
							markedPhonemeIndex={prompt.position}
							syllables={syllables}
							targetAccent="en-us"
							wordIndex={0}
						/>
					) : null}
				</div>
			</div>

			<div className="flex w-full flex-col items-center">
				<div className="flex flex-wrap items-center justify-center gap-3">
					<WordAudioButton
						className={cn(
							buttonVariants({ size: "lg", variant: "outline" }),
							"data-[status=loading]:animate-pulse motion-reduce:data-[status=loading]:animate-none",
						)}
						targetAccent="en-us"
						word={prompt.word}
					>
						<Volume2 aria-hidden="true" />
						Hear {prompt.word}
					</WordAudioButton>
					<RecordButton
						getMeter={recorder.getMeter}
						onRecord={record}
						onStop={recorder.stop}
						view={view}
					/>
				</div>
				<p className="mt-3 text-center text-muted-foreground text-xs">
					{MinimalPairActivity.privacyNotice}
				</p>
				<EvidenceLogSetting />
				<div aria-atomic="true" aria-live="polite" className="w-full">
					<SpeakingStatus prompt={prompt} view={view} />
				</div>
				<SoundResults prompt={prompt} view={view} />
			</div>

			<div className="flex w-full items-center justify-between">
				<Link className={buttonVariants({ variant: "ghost" })} to={MinimalPairActivity.path}>
					<ArrowLeft aria-hidden="true" />
					All pairs
				</Link>
				<Button onClick={onNextWord} variant="outline">
					Next word
					<ArrowRight aria-hidden="true" />
				</Button>
			</div>
		</div>
	);
}
