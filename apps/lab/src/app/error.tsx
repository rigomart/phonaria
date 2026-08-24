"use client";

import { Button } from "@phonaria/ui/components/button";
import { RotateCcw } from "lucide-react";
import { useEffect } from "react";

/**
 * Catch-all for anything a route boundary did not handle. Nothing outside React
 * state survives here, so `reset` alone is enough to recover.
 */
export default function RootError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("lab: unhandled route error", error);
	}, [error]);

	return (
		<div className="flex flex-1 flex-col items-center justify-center bg-background p-4 sm:p-6">
			<div
				role="alert"
				className="w-full max-w-md flex flex-col items-center gap-4 rounded-lg border border-border bg-muted p-6 text-center"
			>
				<h1 className="text-xl font-bold tracking-tight font-display">Something went wrong</h1>
				<p className="text-sm text-muted-foreground text-pretty">
					This page ran into an unexpected problem. Trying again usually clears it.
				</p>
				<Button variant="outline" size="lg" onClick={reset}>
					<RotateCcw />
					Try again
				</Button>
			</div>
		</div>
	);
}
