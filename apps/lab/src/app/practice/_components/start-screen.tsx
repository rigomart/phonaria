"use client";

import { Button } from "@phonaria/ui/components/button";
import { Spinner } from "@phonaria/ui/components/spinner";
import { RotateCcw } from "lucide-react";
import type { TopicDefinition } from "@/lib/practice/topics/types";
import type { PoolStatus } from "../_store/practice-session-store";

const POOL_LOAD_FAILED =
	"We couldn't load the words for this topic. Check your connection and try again.";

interface StartScreenProps {
	topic: TopicDefinition;
	poolStatus: PoolStatus;
	/** Set when the pool loaded but the session failed to draw. */
	sessionError: string | null;
	onStart: () => void;
	onRetryPool: () => void;
}

/**
 * Start is the sole loading gate — no skeletons — and a failure blocks with an
 * inline retry rather than a dismissable toast (#140). A failed pool retries
 * the load; a failed draw retries the draw.
 */
export function StartScreen({
	topic,
	poolStatus,
	sessionError,
	onStart,
	onRetryPool,
}: StartScreenProps) {
	const isLoading = poolStatus === "idle" || poolStatus === "loading";

	let failure: { message: string; onRetry: () => void } | null = null;
	if (poolStatus === "error") failure = { message: POOL_LOAD_FAILED, onRetry: onRetryPool };
	else if (sessionError) failure = { message: sessionError, onRetry: onStart };

	return (
		<div className="flex flex-1 flex-col items-center justify-center bg-background p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
			<div className="w-full max-w-md flex flex-col items-center gap-4 text-center">
				<p className="text-sm text-muted-foreground font-display">{topic.display.kicker}</p>
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
					{topic.display.heading}
				</h1>
				<p className="text-sm text-muted-foreground text-pretty">{topic.display.description}</p>

				{failure ? (
					<div
						role="alert"
						className="w-full flex flex-col items-center gap-3 rounded-lg border border-border bg-muted p-4"
					>
						<p className="text-sm text-foreground">{failure.message}</p>
						<Button variant="outline" size="lg" onClick={failure.onRetry}>
							<RotateCcw />
							Retry
						</Button>
					</div>
				) : (
					<Button
						size="lg"
						className="mt-2"
						disabled={isLoading}
						aria-busy={isLoading}
						onClick={onStart}
					>
						{isLoading ? <Spinner /> : null}
						{isLoading ? "Loading words…" : topic.display.startLabel}
					</Button>
				)}
			</div>
		</div>
	);
}
