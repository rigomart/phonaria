"use client";

import { ArrowLeftRight } from "lucide-react";
import { AudioControls } from "@/components/audio-controls";

export function ContrastDemoSection() {
	return (
		<section className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
			{/* Text Column */}
			<div className="space-y-6">
				<div className="space-y-3">
					<h2 className="text-xl font-semibold tracking-tight">Minimal Pairs & Contrasts</h2>
					<p className="text-muted-foreground leading-relaxed">
						Precision often comes down to distinguishing between similar sounds. A "minimal pair" is
						a pair of words that differ by only one phoneme, changing the meaning entirely.
					</p>
					<p className="text-muted-foreground leading-relaxed">
						Identifying and practicing these pairs helps fine-tune pronunciation and prevent common
						misunderstandings.
					</p>
				</div>
			</div>

			{/* Interactive Column */}
			<div className="flex justify-center md:justify-start">
				<div className="inline-flex items-center gap-4 sm:gap-8 bg-card/50 border rounded-xl p-6 md:p-8 w-full md:w-auto justify-center">
					<div className="flex flex-col items-center gap-3 min-w-[100px]">
						<span className="text-xl font-bold">sheep</span>
						<span className="text-base font-mono text-muted-foreground">/ʃip/</span>
						<AudioControls label="sheep" path="/audio/sheep.mp3" size="sm" variant="compact" />
					</div>

					<div className="flex flex-col items-center text-muted-foreground/30 px-2">
						<ArrowLeftRight className="size-6" />
					</div>

					<div className="flex flex-col items-center gap-3 min-w-[100px]">
						<span className="text-xl font-bold">ship</span>
						<span className="text-base font-mono text-muted-foreground">/ʃɪp/</span>
						<AudioControls label="ship" path="/audio/ship.mp3" size="sm" variant="compact" />
					</div>
				</div>
			</div>
		</section>
	);
}
