"use client";

import { Button } from "@phonaria/ui/components/button";
import { RotateCcw } from "lucide-react";
import { useEffect } from "react";

/**
 * Last resort for the Practice route. The store already catches the two known
 * throws (session draw, scoring), so reaching this means something unforeseen
 * broke — `reset` remounts the route, which starts a fresh session.
 */
export default function PracticeError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("practice: unhandled route error", error);
	}, [error]);

	return (
		<div className="flex flex-1 flex-col items-center justify-center bg-background p-4 sm:p-6">
			<div
				role="alert"
				className="w-full max-w-md flex flex-col items-center gap-4 rounded-lg border border-border bg-muted p-6 text-center"
			>
				<h1 className="text-xl font-bold tracking-tight font-display">Practice hit a snag</h1>
				<p className="text-sm text-muted-foreground text-pretty">
					Something went wrong and the session was lost. Starting over should fix it.
				</p>
				<Button variant="outline" size="lg" onClick={reset}>
					<RotateCcw />
					Start over
				</Button>
			</div>
		</div>
	);
}
