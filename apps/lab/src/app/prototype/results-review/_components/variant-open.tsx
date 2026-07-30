"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * OPEN — every word row fully expanded, nothing behind a click. Wrong words
 * carry the two-line You/Accepted diff; correct and blank words the one-line
 * accepted sequence. The bet: five words is few enough that the whole reveal
 * fits on one honest page and disclosure was never needed.
 */

import { Check, X } from "lucide-react";
import { SESSION_RESULTS } from "../_lib/results";
import { AlignmentRow } from "./alignment-row";
import { LessonsDisclosure, RetryFooter, ScoreHeader } from "./summary-bits";
import { WordAudio } from "./word-audio";

export function VariantOpen() {
	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
			<ScoreHeader />

			<ul className="flex flex-col gap-2">
				{SESSION_RESULTS.map((result) => (
					<li className="flex flex-col gap-2 rounded-xl border bg-background p-3" key={result.word}>
						<div className="flex items-center gap-2">
							{result.correct ? (
								<Check className="size-5 shrink-0 text-success" />
							) : (
								<X className="size-5 shrink-0 text-destructive" />
							)}
							<span className="font-display font-semibold">{result.word}</span>
							<WordAudio word={result.word} />
							{result.blank && <span className="ml-auto text-warning text-xs">No answer</span>}
						</div>

						{result.correct || result.blank ? (
							<AlignmentRow compact ops={result.ops} />
						) : (
							<AlignmentRow ops={result.ops} />
						)}

						{result.hasAlternates && (
							<p className="text-muted-foreground text-xs">
								This word has several accepted pronunciations — yours is one of them.
							</p>
						)}
						{result.blank && (
							<p className="text-muted-foreground text-xs">
								This is an accepted pronunciation — you left this word blank.
							</p>
						)}
					</li>
				))}
			</ul>

			<LessonsDisclosure />
			<RetryFooter />
		</div>
	);
}
