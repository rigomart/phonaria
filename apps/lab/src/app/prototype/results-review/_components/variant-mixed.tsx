"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * MIXED — density follows the mistakes. Correct words collapse to a slim
 * single line (check, word, sequence trailing quietly); wrong words get the
 * full two-line diff card. The bet: detail belongs exactly where the learner
 * has something to learn, and a correct word has nothing left to say.
 */

import { Check, X } from "lucide-react";
import { SESSION_RESULTS, type WordResult } from "../_lib/results";
import { AlignmentRow } from "./alignment-row";
import { LessonsDisclosure, RetryFooter, ScoreHeader } from "./summary-bits";
import { WordAudio } from "./word-audio";

export function VariantMixed() {
	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
			<ScoreHeader />

			<ul className="flex flex-col gap-2">
				{SESSION_RESULTS.map((result) =>
					result.correct ? (
						<CorrectLine key={result.word} result={result} />
					) : (
						<WrongCard key={result.word} result={result} />
					),
				)}
			</ul>

			<LessonsDisclosure />
			<RetryFooter />
		</div>
	);
}

function CorrectLine({ result }: { result: WordResult }) {
	return (
		<li className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border bg-background px-3 py-2">
			<Check className="size-4 shrink-0 text-success" />
			<span className="font-display font-semibold text-sm">{result.word}</span>
			<WordAudio word={result.word} />
			<span className="ml-auto min-w-0">
				<AlignmentRow compact ops={result.ops} />
			</span>
			{result.hasAlternates && (
				<span className="w-full text-muted-foreground text-xs">one of several accepted</span>
			)}
		</li>
	);
}

function WrongCard({ result }: { result: WordResult }) {
	return (
		<li className="flex flex-col gap-2 rounded-xl border bg-background p-3">
			<div className="flex items-center gap-2">
				<X className="size-5 shrink-0 text-destructive" />
				<span className="font-display font-semibold">{result.word}</span>
				<WordAudio word={result.word} />
				{result.blank && <span className="ml-auto text-warning text-xs">No answer</span>}
			</div>

			{result.blank ? (
				<>
					<AlignmentRow compact ops={result.ops} />
					<p className="text-muted-foreground text-xs">
						This is an accepted pronunciation — you left this word blank.
					</p>
				</>
			) : (
				<AlignmentRow ops={result.ops} />
			)}
		</li>
	);
}
