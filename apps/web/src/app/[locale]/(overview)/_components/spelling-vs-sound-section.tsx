"use client";

import { Button } from "@phonaria/ui/components/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AudioControls } from "@/components/audio-controls";
import { cn } from "@/lib/utils";

type WordGroup = {
	pattern: string;
	words: { text: string; ipa: string }[];
};

const GROUPS: WordGroup[] = [
	{
		pattern: "ough",
		words: [
			{ text: "through", ipa: "/θru/" },
			{ text: "though", ipa: "/ðoʊ/" },
			{ text: "thought", ipa: "/θɔt/" },
			{ text: "tough", ipa: "/tʌf/" },
		],
	},
	{
		pattern: "ea",
		words: [
			{ text: "heat", ipa: "/hit/" },
			{ text: "head", ipa: "/hɛd/" },
			{ text: "great", ipa: "/ɡreɪt/" },
			{ text: "heart", ipa: "/hɑrt/" },
		],
	},
];

export function SpellingVsSoundSection() {
	const [activeWord, setActiveWord] = useState<string | null>(null);

	return (
		<section className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
			{/* Text Column */}
			<div className="space-y-6">
				<div className="space-y-3">
					<h2 className="text-xl font-semibold tracking-tight">The Ambiguity of Spelling</h2>
					<p className="text-muted-foreground leading-relaxed">
						English spelling is notoriously inconsistent. Letters and sounds often do not have a
						1-to-1 relationship, making pronunciation difficult to guess from text alone.
					</p>
					<p className="text-muted-foreground leading-relaxed">
						Common patterns like{" "}
						<code className="text-xs bg-muted px-1 py-0.5 rounded border">ough</code> or{" "}
						<code className="text-xs bg-muted px-1 py-0.5 rounded border">ea</code> represent
						multiple different sounds depending on context.
					</p>
				</div>

				<div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 px-4 py-3 rounded-lg border border-border/50">
					<p className="flex-1">
						The Transcription Studio resolves these ambiguities by converting text to standard IPA.
					</p>
					<Button
						variant="link"
						size="sm"
						className="h-auto p-0 text-primary whitespace-nowrap"
						render={<Link href="/transcription" />}
					>
						Try it <ArrowRight className="ml-1 size-3" />
					</Button>
				</div>
			</div>

			{/* Interactive Column */}
			<div className="space-y-8">
				{GROUPS.map((group) => (
					<div key={group.pattern} className="space-y-3">
						<div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
							<span>Pattern:</span>
							<code className="bg-muted px-1.5 py-0.5 rounded border text-foreground">
								{group.pattern}
							</code>
						</div>
						<div className="flex flex-wrap gap-3">
							{group.words.map((word) => {
								const isActive = activeWord === word.text;
								return (
									<button
										key={word.text}
										type="button"
										className={cn(
											"group relative flex flex-col items-start min-w-[100px] p-3 rounded-lg border text-left transition-all",
											isActive
												? "border-primary bg-primary/5 ring-1 ring-primary/20"
												: "border-border bg-card hover:border-primary/50 hover:bg-accent/50",
										)}
										onMouseEnter={() => setActiveWord(word.text)}
										onMouseLeave={() => setActiveWord(null)}
										onClick={() => setActiveWord(isActive ? null : word.text)}
									>
										<div className="flex items-center justify-between w-full gap-2">
											<span className="font-medium text-sm">{word.text}</span>
											{isActive && (
												<div className="animate-in fade-in zoom-in duration-200">
													<AudioControls
														label={word.text}
														path={`/audio/${word.text}.mp3`}
														size="xs"
														variant="compact"
													/>
												</div>
											)}
										</div>
										<span
											className={cn(
												"text-xs font-mono text-muted-foreground transition-colors mt-1",
												isActive ? "text-primary" : "",
											)}
										>
											{word.ipa}
										</span>
									</button>
								);
							})}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
