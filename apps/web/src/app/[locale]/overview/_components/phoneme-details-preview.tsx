import { Volume2 } from "lucide-react";

export function PhonemeDetailsPreview() {
	return (
		<div className="space-y-3">
			{/* Header */}
			<div className="flex flex-col gap-1 bg-muted/40 p-3 rounded-lg shadow-sm border border-border/40">
				<div className="flex gap-4 items-center">
					<div className="flex items-center gap-1.5 font-bold">
						<span className="text-2xl text-muted-foreground/50">/</span>
						<span className="text-4xl leading-none tracking-tight">θ</span>
						<span className="text-2xl text-muted-foreground/50">/</span>
					</div>
					<button
						type="button"
						className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
					>
						<Volume2 className="size-4" />
						Play
					</button>
				</div>
				<p className="text-xs text-muted-foreground/80">
					voiceless dental fricative (as in "think")
				</p>
			</div>

			{/* Sections preview */}
			<div className="space-y-2">
				<div className="rounded-lg border border-border/40 bg-background p-2.5">
					<h4 className="text-sm font-semibold mb-1.5">Pronunciation</h4>
					<div className="space-y-1 text-xs text-muted-foreground">
						<p>• Place tongue tip between teeth</p>
						<p>• Push air through the gap</p>
						<p>• No vocal cord vibration</p>
					</div>
				</div>

				<div className="rounded-lg border border-border/40 bg-background p-2.5">
					<h4 className="text-sm font-semibold mb-1.5">Spelling Patterns</h4>
					<div className="flex flex-wrap gap-1">
						<span className="rounded px-1.5 py-0.5 bg-muted text-xs font-mono">th</span>
						<span className="text-xs text-muted-foreground">think, path, both</span>
					</div>
				</div>

				<div className="rounded-lg border border-border/40 bg-background p-2.5">
					<h4 className="text-sm font-semibold mb-1.5">Contrasts</h4>
					<div className="text-xs text-muted-foreground">
						<p className="mb-0.5">
							<span className="font-medium">/θ/ vs /ð/:</span> thin → this
						</p>
						<p>
							<span className="font-medium">/θ/ vs /s/:</span> think → sink
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
