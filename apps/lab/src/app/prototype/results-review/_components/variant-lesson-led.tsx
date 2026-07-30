"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * C — LESSON-LED. The teaching leads and the score follows. Opens with the
 * schwa story of THIS session — the topic figure, then each mistake-relevant
 * snippet with the learner's own wrong answers embedded as the examples —
 * and only then a compact per-word record. The numeric score is one quiet
 * line. The bet: for a practice tool the takeaway matters more than the
 * verdict, so the reveal should read like a debrief, not a report card.
 */

import { Button } from "@phonaria/ui/components/button";
import { Check, RotateCcw, X } from "lucide-react";
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

export function VariantLessonLed() {
	const lessons = deriveLessons(SESSION_RESULTS);

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10">
			<div className="flex flex-col gap-1">
				<span className="text-muted-foreground text-sm">Session complete</span>
				<h2 className="font-bold font-display text-3xl tracking-tight">
					You placed {SCHWA_PLACED} of your {SCHWA_TOTAL} schwas
				</h2>
				<p className="text-muted-foreground text-sm">
					{WORDS_CORRECT} of {WORD_COUNT} words fully correct · {SOUND_ACCURACY}% of sounds accurate
				</p>
			</div>

			{lessons.length > 0 && (
				<section className="flex flex-col gap-5">
					{lessons.map((lesson) => {
						const examples = SESSION_RESULTS.filter((w) => lesson.words.includes(w.word));
						return (
							<div className="flex flex-col gap-3" key={lesson.key}>
								<div className="flex flex-col gap-1">
									<h3 className="font-display font-semibold text-lg">{lesson.title}</h3>
									<p className="text-muted-foreground text-sm">{lesson.body}</p>
								</div>
								{examples.map((example) => (
									<div
										className="flex flex-col gap-2 rounded-xl border bg-background p-3"
										key={example.word}
									>
										<div className="flex items-center gap-1">
											<span className="font-display font-semibold text-sm">{example.word}</span>
											<WordAudio word={example.word} />
										</div>
										{example.blank ? (
											<AlignmentRow compact ops={example.ops} />
										) : (
											<AlignmentRow ops={example.ops} />
										)}
									</div>
								))}
							</div>
						);
					})}
				</section>
			)}

			<section className="flex flex-col gap-2">
				<h3 className="font-display font-semibold text-lg">The whole session</h3>
				<ul className="flex flex-col gap-1.5">
					{SESSION_RESULTS.map((result) => (
						<li
							className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border bg-background px-3 py-2"
							key={result.word}
						>
							{result.correct ? (
								<Check className="size-4 text-success" />
							) : (
								<X className="size-4 text-destructive" />
							)}
							<span className="w-24 font-display text-sm">{result.word}</span>
							<div className="min-w-0 flex-1">
								<AlignmentRow compact ops={result.ops} />
							</div>
							{result.hasAlternates && (
								<span className="text-muted-foreground text-xs">one of several accepted</span>
							)}
						</li>
					))}
				</ul>
			</section>

			<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
				<Button variant="outline">
					<RotateCcw /> Retry these words
				</Button>
				<Button size="lg">New session</Button>
			</div>
		</div>
	);
}
