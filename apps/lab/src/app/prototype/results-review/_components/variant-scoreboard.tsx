"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * A — SCOREBOARD. Everything at once, drill down on demand. Headline word
 * score, secondary stats, five collapsible word rows (wrong words start open,
 * correct ones closed), the schwa lesson at the bottom, retry in the footer.
 * The bet: a learner wants the verdict instantly and will expand only what
 * confused them.
 */

import { Button } from "@phonaria/ui/components/button";
import { Check, ChevronDown, RotateCcw, Sparkles, X } from "lucide-react";
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
	type WordResult,
} from "../_lib/results";
import { AlignmentRow } from "./alignment-row";
import { WordAudio } from "./word-audio";

export function VariantScoreboard() {
	const lessons = deriveLessons(SESSION_RESULTS);

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
			<div className="flex flex-col items-center gap-1 text-center">
				<span className="text-muted-foreground text-sm">Session complete</span>
				<h2 className="font-bold font-display text-5xl tracking-tight">
					{WORDS_CORRECT} of {WORD_COUNT}
				</h2>
				<span className="text-muted-foreground text-sm">words correct</span>
			</div>

			<div className="flex justify-center gap-6 text-center text-sm">
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

			<ul className="flex flex-col gap-2">
				{SESSION_RESULTS.map((result) => (
					<WordRow key={result.word} result={result} />
				))}
			</ul>

			{lessons.length > 0 && (
				<section className="flex flex-col gap-3 rounded-xl border bg-background p-4">
					<h3 className="flex items-center gap-2 font-display font-semibold">
						<Sparkles className="size-4 text-primary" /> About those schwas
					</h3>
					{lessons.map((lesson) => (
						<div className="flex flex-col gap-1" key={lesson.key}>
							<span className="font-medium text-sm">{lesson.title}</span>
							<p className="text-muted-foreground text-sm">{lesson.body}</p>
							<span className="text-muted-foreground text-xs">
								Seen in: {lesson.words.join(", ")}
							</span>
						</div>
					))}
				</section>
			)}

			<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
				<Button variant="outline">
					<RotateCcw /> Retry these words
				</Button>
				<Button size="lg">New session</Button>
			</div>
		</div>
	);
}

function WordRow({ result }: { result: WordResult }) {
	const [open, setOpen] = useState(!result.correct);

	return (
		<li className="rounded-xl border bg-background">
			<button
				className="flex w-full cursor-pointer items-center gap-3 p-3 text-left"
				onClick={() => setOpen((v) => !v)}
				type="button"
			>
				{result.correct ? (
					<Check className="size-5 shrink-0 text-success" />
				) : (
					<X className="size-5 shrink-0 text-destructive" />
				)}
				<span className="flex-1 font-display font-semibold">{result.word}</span>
				{result.blank && <span className="text-warning text-xs">No answer</span>}
				<ChevronDown
					className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
				/>
			</button>

			{open && (
				<div className="flex flex-col gap-2 border-t p-3">
					<div className="flex items-center gap-1">
						<WordAudio word={result.word} />
						<span className="text-muted-foreground text-xs">Hear it</span>
					</div>
					{result.correct || result.blank ? (
						<AlignmentRow compact ops={result.ops} />
					) : (
						<AlignmentRow ops={result.ops} />
					)}
					{result.blank && (
						<p className="text-muted-foreground text-xs">
							This is an accepted pronunciation — you left this word blank.
						</p>
					)}
					{result.hasAlternates && (
						<p className="text-muted-foreground text-xs">
							This word has several accepted pronunciations — yours is one of them.
						</p>
					)}
				</div>
			)}
		</li>
	);
}
