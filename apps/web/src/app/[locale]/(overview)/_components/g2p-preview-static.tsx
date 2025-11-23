"use client";

import { BookA, Search } from "lucide-react";

export function G2PPreviewStatic() {
	return (
		<div className="w-full bg-background rounded-md border border-border/50 shadow-sm overflow-hidden select-none">
			{/* Input Area Mock */}
			<div className="p-3 border-b border-border/40 bg-muted/10 flex items-center gap-3">
				<Search className="size-3.5 text-muted-foreground/40" />
				<div className="h-4 w-32 bg-muted-foreground/10 rounded-sm" />
			</div>

			{/* Result Area Mock */}
			<div className="p-4 flex items-center justify-center min-h-[100px]">
				<div className="flex flex-wrap justify-center gap-x-6 gap-y-4 opacity-90">
					<div className="flex flex-col items-center gap-1.5">
						<span className="text-xs text-muted-foreground font-medium">Phonaria</span>
						<div className="flex items-center gap-0.5">
							{/* f oʊ n ɛ r i ə */}
							<span className="text-lg font-medium px-1 rounded hover:bg-primary/5">f</span>
							<span className="text-lg font-medium px-1 rounded hover:bg-primary/5">oʊ</span>
							<span className="text-lg font-medium px-1 rounded hover:bg-primary/5">n</span>
							<span className="text-lg font-medium px-1 rounded hover:bg-primary/5">ɛ</span>
							<span className="text-lg font-medium px-1 rounded hover:bg-primary/5">ɹ</span>
							<span className="text-lg font-medium px-1 rounded hover:bg-primary/5">i</span>
							<span className="text-lg font-medium px-1 rounded hover:bg-primary/5">ə</span>
						</div>
					</div>
				</div>
			</div>

			{/* Dictionary Definition Mock */}
			<div className="px-3 py-2 border-t border-border/40 bg-muted/5 flex items-center gap-2">
				<BookA className="size-3 text-primary/60" />
				<div className="h-3 w-48 bg-muted-foreground/5 rounded-sm" />
			</div>
		</div>
	);
}
