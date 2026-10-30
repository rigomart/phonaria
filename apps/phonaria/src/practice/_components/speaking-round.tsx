/**
 * One word to say, shown beside the other word of its pair, so the contrast is
 * in view before the learner speaks. After an attempt, the word that came
 * through is marked. The parent keys it by word, so a new word starts with a
 * fresh recorder and no result.
 */
import { Button, buttonVariants } from "@phonaria/ui/components/button";
import { ArrowRight, Volume2 } from "lucide-react";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { SyntheticVoiceNote } from "@/components/synthetic-voice-note";
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
import {
	type AttemptLogger,
	createAttemptLogger,
	pageAttemptLogger,
} from "../_lib/evidence-log-attempt";
import type { MinimalPairPrompt } from "../_lib/minimal-pair-prompt";
import {
	attemptReducer,
	deriveSpeakingView,
	heardSide,
	READY,
	scoreAttempt,
} from "../_lib/speaking-attempt";
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
		const page = pageAttemptLogger(() =>
			createAttemptLogger({
				word,
				currentGrant: currentConsentGrant,
				send: (payload) => void sendEvidenceLog(payload, (input, init) => fetch(input, init)),
			}),
		);
		current.current = page.logger;
		const unsubscribe = onEvidenceLogConsentRevoked(() => page.logger.drop());
		return () => {
			unsubscribe();
			page.close();
			current.current = null;
		};
	}, [word]);
	return useMemo(
		() => ({
			scored: (log) => current.current?.scored(log),
			next: (action) => current.current?.next(action),
			leave: () => current.current?.leave(),
			drop: () => current.current?.drop(),
			reporter: () => {
				const started = current.current;
				const report = started?.reporter();
				return (log) => {
					if (started && started === current.current) report?.(log);
				};
			},
		}),
		[],
	);
}

function useSpeakingRound(prompt: MinimalPairPrompt) {
	const recorder = useWavRecorder();
	const [attempt, dispatch] = useReducer(attemptReducer, READY);
	const attemptCount = useRef(0);
	const logger = useAttemptLogger(prompt.word);

	const recording = recorder.state;
	const { cancel } = recorder;
	useEffect(() => {
		if (recording.status !== "done") return;
		attemptCount.current += 1;
		const id = attemptCount.current;
		dispatch({ type: "submitted", id });
		cancel();
		const report = logger.reporter();
		void scoreAttempt(prompt, recording.audio, (input, init) => fetch(input, init)).then(
			(result) => {
				dispatch({ type: "scored", id, result });
				if (result.type === "outcome" && id === attemptCount.current) report(result.log);
			},
		);
	}, [recording, prompt, cancel, logger]);

	const view = deriveSpeakingView(recording, attempt);
	// The words this round can play: the prompt, and the word a swap made.
	const heardWord =
		view.phase === "outcome" && view.outcome.verdict === "swapped"
			? view.outcome.heardWord
			: undefined;

	function record() {
		logger.next("retried");
		dispatch({ type: "reset" });
		void recorder.start();
	}

	return { view, heardWord, record, stop: recorder.stop, getMeter: recorder.getMeter };
}

function WordCard({
	word,
	position,
	side,
	heard,
}: {
	word: string;
	position: number;
	side: "target" | "partner";
	heard: boolean;
}) {
	const syllables = useWordSyllables(word);
	const isTarget = side === "target";
	return (
		<div
			className={cn(
				"relative flex flex-1 flex-col items-center gap-2 rounded-2xl border px-3 pt-6 pb-4 transition-colors motion-reduce:transition-none",
				isTarget ? "border-foreground bg-background-strong" : "border-dashed border-border",
				heard && (isTarget ? "border-success" : "border-info"),
			)}
			data-heard={heard ? "" : undefined}
			data-side={side}
		>
			<span
				className={cn(
					"-top-2.5 absolute rounded-full border px-2 py-0.5 text-xs",
					isTarget
						? "border-foreground bg-foreground text-background"
						: "border-border bg-background text-muted-foreground",
				)}
			>
				{isTarget ? "Say this" : "Not this"}
			</span>
			<p
				className={cn(
					"font-bold font-display tracking-tight",
					isTarget ? "text-4xl sm:text-5xl" : "text-3xl text-muted-foreground sm:text-4xl",
				)}
			>
				{word}
			</p>
			<div className="flex min-h-10 items-center">
				{syllables ? (
					<IpaSequence
						markedPhonemeIndex={position}
						syllables={syllables}
						targetAccent="en-us"
						wordIndex={0}
					/>
				) : null}
			</div>
			<WordAudioButton
				className={cn(
					buttonVariants({ size: "sm", variant: "ghost" }),
					"data-[status=loading]:animate-pulse motion-reduce:data-[status=loading]:animate-none",
				)}
				targetAccent="en-us"
				word={word}
			>
				<Volume2 aria-hidden="true" />
				Hear {word}
			</WordAudioButton>
			{heard ? (
				<span
					className={cn(
						"text-balance text-center font-medium text-xs",
						isTarget ? "text-success-foreground" : "text-info-foreground",
					)}
				>
					This is what came through
				</span>
			) : null}
		</div>
	);
}

export function SpeakingRound({
	prompt,
	onNextWord,
}: {
	prompt: MinimalPairPrompt;
	onNextWord: () => void;
}) {
	const { view, heardWord, record, stop, getMeter } = useSpeakingRound(prompt);
	const heard = heardSide(prompt, view);
	const playable = [prompt.word, prompt.partnerWord];
	if (heardWord && !playable.includes(heardWord)) playable.push(heardWord);

	return (
		<div className="flex w-full flex-col gap-8 enter-fade">
			<div className="flex items-center justify-between gap-2">
				<h2 className="font-display font-semibold">Say a word</h2>
				<Button onClick={onNextWord} size="sm" variant="ghost">
					Next word
					<ArrowRight aria-hidden="true" />
				</Button>
			</div>

			<div className="flex flex-wrap items-stretch gap-x-3 gap-y-5 enter-rise sm:gap-x-4">
				<WordCard
					heard={heard === "target"}
					position={prompt.position}
					side="target"
					word={prompt.word}
				/>
				<WordCard
					heard={heard === "partner"}
					position={prompt.position}
					side="partner"
					word={prompt.partnerWord}
				/>
			</div>

			<div className="mx-auto flex w-full max-w-sm flex-col items-center">
				<RecordButton getMeter={getMeter} onRecord={record} onStop={stop} view={view} />
				<p className="mt-3 text-center text-muted-foreground text-xs">
					{MinimalPairActivity.privacyNotice}
				</p>
				<div aria-atomic="true" aria-live="polite" className="w-full">
					<SpeakingStatus prompt={prompt} view={view} />
				</div>
				<SoundResults prompt={prompt} view={view} />
			</div>

			<div className="mx-auto flex w-full max-w-sm flex-col items-center border-border border-t pt-4">
				<SyntheticVoiceNote className="text-center" targetAccent="en-us" words={playable} />
				<EvidenceLogSetting />
			</div>
		</div>
	);
}
