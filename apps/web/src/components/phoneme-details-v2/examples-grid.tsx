"use client";

import { useState } from "react";
import { phonariaUtils } from "shared-data";
import { AudioControls } from "@/components/audio-button";
import { Button } from "@/components/ui/button";
import { usePhonemeDetailsContext } from "./index";

const { toPhonemic, getExampleAudioUrl } = phonariaUtils;

export function PhonemeDetailsExamplesGrid() {
	const { phoneme, layout, maxExamples } = usePhonemeDetailsContext();
	const [showAll, setShowAll] = useState(false);

	const initialCount = layout === "compact" ? 3 : 6;
	const displayedExamples = showAll
		? phoneme.examples.slice(0, maxExamples)
		: phoneme.examples.slice(0, initialCount);
	const hasMore = phoneme.examples.length > initialCount && !showAll;
	const remainingCount = Math.min(
		phoneme.examples.length - initialCount,
		maxExamples - initialCount,
	);

	if (!phoneme.examples.length) return null;

	return (
		<section className="space-y-3">
			<h3 className="text-sm font-semibold text-foreground">Examples</h3>
			<div className={`grid gap-2 ${layout === "compact" ? "grid-cols-1" : "grid-cols-2"}`}>
				{displayedExamples.map((example) => (
					<div
						key={example.word}
						className="flex items-center justify-between gap-3 rounded-md border bg-card p-3"
					>
						<div className="min-w-0 flex-1">
							<div className="font-medium text-sm truncate">{example.word}</div>
							<div className="text-xs text-muted-foreground">{toPhonemic(example.phonemic)}</div>
						</div>
						<AudioControls src={getExampleAudioUrl(example.word)} label={`Play ${example.word}`} />
					</div>
				))}
			</div>
			{hasMore ? (
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowAll(true)}
					className="w-full text-xs"
				>
					Show {remainingCount} more {remainingCount === 1 ? "example" : "examples"}
				</Button>
			) : null}
		</section>
	);
}
