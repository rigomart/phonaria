"use client";

/**
 * PROTOTYPE ONLY — throwaway. Round 2 shared skeleton: the scoreboard shape
 * won, so headline, stats, collapsed lessons and the retry footer are held
 * constant across variants — only the word-row density varies.
 */

import { Button } from "@phonaria/ui/components/button";
import { ChevronDown, RotateCcw, Sparkles } from "lucide-react";
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

export function ScoreHeader() {
	return (
		<>
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
		</>
	);
}

export function LessonsDisclosure() {
	const [open, setOpen] = useState(false);
	const lessons = deriveLessons(SESSION_RESULTS);

	if (lessons.length === 0) return null;

	return (
		<section className="rounded-xl border bg-background">
			<button
				className="flex w-full cursor-pointer items-center gap-2 p-4 text-left"
				onClick={() => setOpen((v) => !v)}
				type="button"
			>
				<Sparkles className="size-4 text-primary" />
				<span className="flex-1 font-display font-semibold">
					About those schwas
					<span className="ml-2 font-normal text-muted-foreground text-sm">
						{lessons.length} {lessons.length === 1 ? "note" : "notes"}
					</span>
				</span>
				<ChevronDown
					className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
				/>
			</button>
			{open && (
				<div className="flex flex-col gap-3 border-t p-4">
					{lessons.map((lesson) => (
						<div className="flex flex-col gap-1" key={lesson.key}>
							<span className="font-medium text-sm">{lesson.title}</span>
							<p className="text-muted-foreground text-sm">{lesson.body}</p>
							<span className="text-muted-foreground text-xs">
								Seen in: {lesson.words.join(", ")}
							</span>
						</div>
					))}
				</div>
			)}
		</section>
	);
}

export function RetryFooter() {
	return (
		<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
			<Button variant="outline">
				<RotateCcw /> Retry these words
			</Button>
			<Button size="lg">New session</Button>
		</div>
	);
}
