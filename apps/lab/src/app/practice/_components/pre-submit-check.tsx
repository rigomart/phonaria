"use client";

/**
 * The last screen before an irreversible submit. Blanks are allowed — the
 * primary button says how many rather than blocking (#140).
 */
import { Button } from "@phonaria/ui/components/button";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { selectBlankCount, usePracticeSessionStore } from "../_store/practice-session-store";
import { announce } from "./live-region";
import { SoundChip } from "./sound-chip";

export function PreSubmitCheck() {
	const rounds = usePracticeSessionStore((state) => state.rounds);
	const sessionError = usePracticeSessionStore((state) => state.sessionError);
	const keepEditing = usePracticeSessionStore((state) => state.keepEditing);
	const editRound = usePracticeSessionStore((state) => state.editRound);
	const submit = usePracticeSessionStore((state) => state.submit);

	const blanks = selectBlankCount(rounds);
	const answered = rounds.length - blanks;
	const total = rounds.length;

	// This screen only mounts on building → checking, so mount is the transition.
	const headingRef = useRef<HTMLHeadingElement>(null);
	useEffect(() => {
		headingRef.current?.focus();
	}, []);

	// Rounds cannot change while checking (edits go back to building and remount
	// this screen), so these deps re-fire only on a fresh entry.
	useEffect(() => {
		announce(
			blanks === 0
				? `All ${total} words answered`
				: `${blanks} ${blanks === 1 ? "word has" : "words have"} no answer`,
		);
	}, [blanks, total]);

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none">
			<div className="flex flex-col gap-1">
				<h1
					className="font-bold font-display text-2xl tracking-tight outline-none"
					ref={headingRef}
					tabIndex={-1}
				>
					Ready to submit?
				</h1>
				<p className="text-muted-foreground text-sm">
					{blanks === 0
						? `All ${rounds.length} words answered. Nothing is graded until you submit — this is your last chance to change an answer.`
						: `${answered} of ${rounds.length} answered. Blank words are scored as wrong, so it is worth a guess.`}
				</p>
			</div>

			{sessionError ? (
				<p className="rounded-lg border border-border bg-muted p-3 text-sm" role="alert">
					{sessionError}
				</p>
			) : null}

			<ul className="flex flex-col gap-2">
				{rounds.map((round, index) => {
					const isBlank = round.sequence.length === 0;

					return (
						<li key={round.word.word}>
							<div
								className={cn(
									"flex flex-col gap-2 rounded-xl border bg-background p-3 sm:flex-row sm:items-center sm:gap-4",
									isBlank && "border-warning",
								)}
							>
								<div className="flex w-40 shrink-0 items-baseline gap-2">
									<span className="text-muted-foreground text-xs">{index + 1}</span>
									<span className="font-display font-semibold">{round.word.word}</span>
								</div>

								<div className="flex flex-1 flex-wrap items-center gap-1.5">
									{isBlank ? (
										<span className="flex items-center gap-1.5 text-sm text-warning-foreground">
											<TriangleAlert className="size-4" /> No answer
										</span>
									) : (
										round.sequence.map((sound, soundIndex) => (
											<SoundChip className="h-9" key={`${sound}-${soundIndex}`} sound={sound} />
										))
									)}
								</div>

								<Button
									aria-label={`${isBlank ? "Answer" : "Change"} ${round.word.word}`}
									onClick={() => editRound(index)}
									size="sm"
									variant="outline"
								>
									{isBlank ? "Answer it" : "Change"}
								</Button>
							</div>
						</li>
					);
				})}
			</ul>

			<div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
				<Button onClick={keepEditing} variant="ghost">
					<ArrowLeft /> Keep editing
				</Button>
				<Button onClick={submit} size="lg">
					{blanks === 0 ? "Submit session" : `Submit with ${blanks} blank${blanks > 1 ? "s" : ""}`}
				</Button>
			</div>
		</div>
	);
}
