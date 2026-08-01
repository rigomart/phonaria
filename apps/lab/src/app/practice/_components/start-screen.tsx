"use client";

import { Button } from "@phonaria/ui/components/button";
import { Spinner } from "@phonaria/ui/components/spinner";
import { RotateCcw } from "lucide-react";
import type { TopicDefinition } from "@/lib/practice/topics/types";
import type { PoolStatus } from "../_store/practice-session-store";

interface StartScreenProps {
	topic: TopicDefinition;
	poolStatus: PoolStatus;
	onStart: () => void;
	onRetry: () => void;
}

/**
 * Start is the sole loading gate — no skeletons — and a failed pool import
 * blocks with an inline retry rather than a dismissable toast (#140).
 */
export function StartScreen({ topic, poolStatus, onStart, onRetry }: StartScreenProps) {
	const isLoading = poolStatus === "idle" || poolStatus === "loading";
	const hasFailed = poolStatus === "error";

	return (
		<div className="flex flex-1 flex-col items-center justify-center bg-background p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
			<div className="w-full max-w-md flex flex-col items-center gap-4 text-center">
				<p className="text-sm text-muted-foreground font-display">{topic.display.kicker}</p>
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
					{topic.display.heading}
				</h1>
				<p className="text-sm text-muted-foreground text-pretty">{topic.display.description}</p>

				{hasFailed ? (
					<div
						role="alert"
						className="w-full flex flex-col items-center gap-3 rounded-lg border border-border bg-muted p-4"
					>
						<p className="text-sm text-foreground">
							We couldn't load the words for this topic. Check your connection and try again.
						</p>
						<Button variant="outline" size="lg" onClick={onRetry}>
							<RotateCcw />
							Retry
						</Button>
					</div>
				) : (
					<Button size="lg" className="mt-2" disabled={isLoading} onClick={onStart}>
						{isLoading ? <Spinner /> : null}
						{topic.display.startLabel}
					</Button>
				)}
			</div>
		</div>
	);
}
