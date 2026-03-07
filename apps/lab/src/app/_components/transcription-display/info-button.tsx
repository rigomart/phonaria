"use client";

import { Button } from "@phonaria/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { Info } from "lucide-react";
import Link from "next/link";

export function TranscriptionInfoButton() {
	return (
		<Popover>
			<PopoverTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						className="size-8 text-muted-foreground hover:text-foreground"
						aria-label="Transcription information"
					/>
				}
			>
				<Info className="size-4" />
			</PopoverTrigger>
			<PopoverContent align="end" className="sm:w-96">
				<div className="space-y-2">
					<h4 className="font-semibold text-sm">About This Transcription</h4>
					<div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
						<p>
							Pronunciations are obtained from the CMU Pronouncing Dictionary, which contains over
							134,000 North American English words.
						</p>
						<p className="font-semibold">Things to know:</p>
						<ul className="list-disc list-inside space-y-1 ml-2">
							<li>
								Pronunciations reflect General American English, not British or other varieties
							</li>
							<li>Some words may not be found, especially newer terms, slang, and proper nouns</li>
							<li>
								Words with multiple pronunciations (like &ldquo;read&rdquo;) show all variants
							</li>
						</ul>
						<Link
							href="/credits"
							className="inline-block pt-1 text-xs underline underline-offset-2 hover:text-foreground"
						>
							Learn more about data sources
						</Link>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
