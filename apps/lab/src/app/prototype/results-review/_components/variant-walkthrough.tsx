"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * B — WALKTHROUGH. One word per screen, mirroring the builder's own pacing:
 * same dots, same big word, Back/Next. Each screen shows the verdict, the
 * full diff, audio, and any teaching that belongs to THIS word's mistake.
 * The session score is withheld until a final summary screen. The bet: a
 * beginner absorbs one correction at a time and a delayed score builds a
 * small arc instead of a wall of information.
 */

import { Button } from "@phonaria/ui/components/button";
import { ArrowLeft, ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
	deriveLessons,
	SCHWA_PLACED,
	SCHWA_TOTAL,
	SESSION_RESULTS,
	SOUND_ACCURACY,
	WORD_COUNT,
	WORDS_CORRECT,
} from "../_lib/results";
import { AlignmentRow } from "./alignment-row";
import { WordAudio } from "./word-audio";

export function VariantWalkthrough() {
	/** 0..4 are word screens; WORD_COUNT is the summary. */
	const [step, setStep] = useState(0);
	const [seen, setSeen] = useState(1);

	const goTo = (next: number) => {
		setStep(next);
		setSeen((count) => Math.max(count, next + 1));
	};

	if (step >= WORD_COUNT) return <Summary onBack={() => goTo(WORD_COUNT - 1)} />;

	const result = SESSION_RESULTS[step];
	const lesson = deriveLessons([result])[0];

	return (
		<div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-6 px-4 py-12">
			<div className="flex items-center gap-2">
				{SESSION_RESULTS.map((entry, index) => (
					<button
						aria-label={`Word ${index + 1}: ${entry.word}`}
						className={cn(
							"size-2.5 cursor-pointer rounded-full transition-colors",
							index === step
								? "bg-primary"
								: index >= seen
									? "bg-border"
									: entry.correct
										? "bg-success"
										: "bg-destructive",
						)}
						disabled={index > seen}
						key={entry.word}
						onClick={() => goTo(index)}
						type="button"
					/>
				))}
			</div>

			<div className="flex flex-col items-center gap-1">
				<div className="flex items-center gap-2">
					<h2 className="font-bold font-display text-5xl tracking-tight">{result.word}</h2>
					<WordAudio word={result.word} />
				</div>
				<span
					className={cn(
						"flex items-center gap-1.5 font-medium text-sm",
						result.correct ? "text-success" : "text-destructive",
					)}
				>
					{result.correct ? (
						<>
							<Check className="size-4" /> Correct
						</>
					) : result.blank ? (
						<>
							<X className="size-4" /> No answer
						</>
					) : (
						<>
							<X className="size-4" /> Not quite
						</>
					)}
				</span>
			</div>

			<div className="flex w-full flex-col items-center gap-3 rounded-xl border bg-background p-4">
				{result.correct || result.blank ? (
					<>
						<AlignmentRow compact ops={result.ops} />
						{result.blank && (
							<p className="text-center text-muted-foreground text-sm">
								This is an accepted pronunciation. Tap any sound to learn it.
							</p>
						)}
					</>
				) : (
					<AlignmentRow ops={result.ops} />
				)}
				{result.hasAlternates && (
					<p className="text-center text-muted-foreground text-xs">
						This word has several accepted pronunciations — yours is one of them.
					</p>
				)}
			</div>

			{lesson && (
				<div className="flex w-full flex-col gap-1 rounded-xl border border-primary bg-background p-4">
					<span className="font-medium text-sm">{lesson.title}</span>
					<p className="text-muted-foreground text-sm">{lesson.body}</p>
				</div>
			)}

			<div className="mt-auto flex w-full items-center justify-between">
				<Button
					className={cn(step === 0 && "invisible")}
					onClick={() => goTo(step - 1)}
					variant="ghost"
				>
					<ArrowLeft /> Back
				</Button>
				<Button onClick={() => goTo(step + 1)}>
					{step === WORD_COUNT - 1 ? "See your score" : "Next word"} <ArrowRight />
				</Button>
			</div>
		</div>
	);
}

function Summary({ onBack }: { onBack: () => void }) {
	return (
		<div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-6 px-4 py-12">
			<div className="flex flex-col items-center gap-1 text-center">
				<span className="text-muted-foreground text-sm">Session complete</span>
				<h2 className="font-bold font-display text-5xl tracking-tight">
					{WORDS_CORRECT} of {WORD_COUNT}
				</h2>
				<span className="text-muted-foreground text-sm">words correct</span>
			</div>

			<div className="flex gap-6 text-center text-sm">
				<div className="flex flex-col">
					<span className="font-semibold text-lg">{SOUND_ACCURACY}%</span>
					<span className="text-muted-foreground text-xs">sounds accurate</span>
				</div>
				<div className="flex flex-col">
					<span className="font-semibold text-lg">
						{SCHWA_PLACED} of {SCHWA_TOTAL}
					</span>
					<span className="text-muted-foreground text-xs">schwas placed</span>
				</div>
			</div>

			<ul className="flex w-full flex-col gap-1.5">
				{SESSION_RESULTS.map((result) => (
					<li
						className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2"
						key={result.word}
					>
						{result.correct ? (
							<Check className="size-4 text-success" />
						) : (
							<X className="size-4 text-destructive" />
						)}
						<span className="font-display text-sm">{result.word}</span>
						{result.blank && <span className="ml-auto text-warning text-xs">No answer</span>}
					</li>
				))}
			</ul>

			<div className="mt-auto flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-between">
				<Button onClick={onBack} variant="ghost">
					<ArrowLeft /> Back to words
				</Button>
				<div className="flex flex-col-reverse gap-2 sm:flex-row">
					<Button variant="outline">
						<RotateCcw /> Retry these words
					</Button>
					<Button>New session</Button>
				</div>
			</div>
		</div>
	);
}
