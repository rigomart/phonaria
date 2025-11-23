"use client";

import { BookA, SendHorizonal } from "lucide-react";

const PREVIEW_DATA = [
	{
		word: "clear",
		phonemes: ["k", "l", "ɪ", "ɹ"],
	},
	{
		word: "sky",
		phonemes: ["s", "k", "aɪ"],
	},
];

export function G2PPreviewStatic() {
	return (
		<div className="w-full h-full bg-background rounded-md border border-border/50 shadow-sm overflow-hidden select-none flex flex-col min-h-0">
			{/* Input Section */}
			<div className="bg-background-soft p-3 shrink-0">
				<form className="flex gap-3">
					<div className="flex-1 flex items-center relative">
						<div className="flex-1 text-sm px-4 py-2 shadow-md bg-muted-foreground/5 rounded-xl text-muted-foreground">
							clear sky
						</div>
						<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
							<span className="text-xs text-muted-foreground">0/200</span>
						</div>
					</div>
					<div className="size-9 p-0 rounded-xl bg-secondary flex items-center justify-center">
						<SendHorizonal className="size-3" />
					</div>
				</form>
			</div>

			{/* Transcription Results */}
			<div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 overflow-x-auto bg-muted/20 border border-border/40 p-4 md:p-6 flex-1 min-h-0">
				{PREVIEW_DATA.map((item) => (
					<div key={item.word} className="flex flex-col items-center text-center min-w-0">
						<button
							type="button"
							className="text-base sm:text-lg font-normal mb-2 whitespace-nowrap px-3 py-1 rounded-md transition-colors duration-200 text-muted-foreground hover:bg-muted/50 hover:text-foreground cursor-pointer"
						>
							{item.word}
						</button>
						<div className="flex items-center gap-2 min-h-12">
							<div className="leading-normal whitespace-nowrap flex items-center">
								<div className="flex items-center">
									{item.phonemes.map((ph, idx) => (
										<span
											key={`${item.word}-${idx}`}
											className="text-xl sm:text-2xl md:text-3xl bg-transparent border-none p-1 m-0 rounded-md text-foreground"
										>
											{ph}
										</span>
									))}
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Dictionary Definition Mock */}
			<div className="px-3 py-2 border-t border-border/40 bg-muted/5 flex items-center gap-2 shrink-0">
				<BookA className="size-3 text-primary/60" />
				<div className="h-3 w-48 bg-muted-foreground/5 rounded-sm" />
			</div>
		</div>
	);
}
