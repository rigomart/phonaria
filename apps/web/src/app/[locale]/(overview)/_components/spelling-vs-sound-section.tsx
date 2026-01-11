"use client";

import { Button } from "@phonaria/ui/components/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
		<section className="grid md:grid-cols-2 gap-6 items-start">
			{/* Text Column */}
			<div className="space-y-6">
				<div className="space-y-3">
					<h2 className="text-xl font-semibold tracking-tight">Spelling Doesn't Match Sound</h2>
					<p className="text-muted-foreground leading-relaxed">
						English spelling is unpredictable. The same letters often produce different sounds
						depending on the word.
					</p>
					<p className="text-muted-foreground leading-relaxed">
						Look at{" "}
						<code className="text-xs bg-muted px-1 py-0.5 rounded border">ough</code> or{" "}
						<code className="text-xs bg-muted px-1 py-0.5 rounded border">ea</code>. Each
						can sound completely different.
					</p>
				</div>

				<Button
					variant="outline"
					size="sm"
					className="w-full sm:w-auto"
					render={<Link href="/transcription" />}
				>
					Try the Transcription Studio <ArrowRight className="ml-2 size-3" />
				</Button>
			</div>

			{/* Interactive Column */}
			<div className="space-y-6">
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
												? "border-primary bg-accent ring-1 ring-primary"
												: "border-border bg-card hover:border-primary hover:bg-accent",
										)}
										onClick={() => setActiveWord(isActive ? null : word.text)}
									>
										<div className="flex items-center justify-between w-full gap-2">
											<span className="font-medium text-sm">{word.text}</span>
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
