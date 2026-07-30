"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * DENSE — one line per word, always. The diff folds into the line itself:
 * matches are plain glyphs, a substitution stacks the struck attempt over the
 * correct sound, an omission puts the missed sound under a dashed slot. The
 * bet: the tightest reveal that still shows every correction with zero
 * clicks — if this reads, the other treatments are spending space on air.
 */

import { Check, X } from "lucide-react";
import { SESSION_RESULTS } from "../_lib/results";
import { AlignmentRow, DenseAlignmentRow } from "./alignment-row";
import { LessonsDisclosure, RetryFooter, ScoreHeader } from "./summary-bits";
import { WordAudio } from "./word-audio";

export function VariantDense() {
	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
			<ScoreHeader />

			<ul className="flex flex-col gap-1.5">
				{SESSION_RESULTS.map((result) => (
					<li
						className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border bg-background px-3 py-2"
						key={result.word}
					>
						<span className="flex w-32 items-center gap-2">
							{result.correct ? (
								<Check className="size-4 shrink-0 text-success" />
							) : (
								<X className="size-4 shrink-0 text-destructive" />
							)}
							<span className="font-display font-semibold text-sm">{result.word}</span>
							<WordAudio word={result.word} />
						</span>

						<span className="min-w-0 flex-1">
							{result.blank ? (
								<AlignmentRow compact ops={result.ops} />
							) : (
								<DenseAlignmentRow ops={result.ops} />
							)}
						</span>

						{result.blank && <span className="text-warning text-xs">No answer</span>}
						{result.hasAlternates && (
							<span className="text-muted-foreground text-xs">one of several accepted</span>
						)}
					</li>
				))}
			</ul>

			<p className="text-center text-muted-foreground text-xs">
				A struck sound is what you typed; the green sound below it is the accepted one. A dashed
				slot is a sound you skipped.
			</p>

			<LessonsDisclosure />
			<RetryFooter />
		</div>
	);
}
