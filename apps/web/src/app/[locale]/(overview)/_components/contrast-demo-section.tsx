"use client";

import { ArrowLeftRight } from "lucide-react";
import { AudioControls } from "@/components/audio-controls";

export function ContrastDemoSection() {
	return (
		<section className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
			{/* Text Column */}
			<div className="space-y-6">
				<div className="space-y-3">
					<h2 className="text-xl font-semibold tracking-tight">Sounds That Get Confused</h2>
					<p className="text-muted-foreground leading-relaxed">
						Some sounds are easy to mix up. In a minimal pair, changing just one sound changes the
						whole word.
					</p>
					<p className="text-muted-foreground leading-relaxed">
						Hearing the difference between similar sounds is the first step to pronouncing them
						correctly.
					</p>
				</div>
			</div>

			{/* Interactive Column */}
			<div className="flex justify-center md:justify-start">
				<div className="inline-flex items-center gap-4 sm:gap-8 bg-background-soft border rounded-xl p-6 md:p-8 w-full md:w-auto justify-center">
					<div className="flex flex-col items-center gap-2 min-w-[100px]">
						<span className="text-xl font-bold">sheep</span>
						<span className="text-base font-mono text-muted-foreground">
							/ʃ<span className="text-primary font-semibold">i</span>p/
						</span>
						<span className="text-xs text-muted-foreground">tense vowel</span>
						<AudioControls label="sheep" path="/audio/sheep.mp3" size="sm" variant="compact" />
					</div>

					<div className="flex flex-col items-center text-muted-foreground px-2">
						<ArrowLeftRight className="size-5" />
					</div>

					<div className="flex flex-col items-center gap-2 min-w-[100px]">
						<span className="text-xl font-bold">ship</span>
						<span className="text-base font-mono text-muted-foreground">
							/ʃ<span className="text-primary font-semibold">ɪ</span>p/
						</span>
						<span className="text-xs text-muted-foreground">lax vowel</span>
						<AudioControls label="ship" path="/audio/ship.mp3" size="sm" variant="compact" />
					</div>
				</div>
			</div>
		</section>
	);
}
