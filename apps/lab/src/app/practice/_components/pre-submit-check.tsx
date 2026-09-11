"use client";

/**
 * The last screen before an irreversible submit. Blanks are allowed — the
 * primary button says how many rather than blocking (#140).
 */
import { Button } from "@phonaria/ui/components/button";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";
import { selectBlankCount, usePracticeSessionStore } from "../_store/practice-session-store";
import { announce } from "./live-region";

export function PreSubmitCheck() {
	const rounds = usePracticeSessionStore((state) => state.rounds);
	const sessionError = usePracticeSessionStore((state) => state.sessionError);
	const keepEditing = usePracticeSessionStore((state) => state.keepEditing);
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
		<div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-5 px-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none">
			<div className="flex flex-col items-center gap-1 text-center">
				<h1
					className="font-bold font-display text-2xl tracking-tight outline-none"
					ref={headingRef}
					tabIndex={-1}
				>
					{answered} of {total} answered
				</h1>
			</div>

			{sessionError ? (
				<p className="rounded-lg border border-border bg-muted p-3 text-sm" role="alert">
					{sessionError}
				</p>
			) : null}

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
