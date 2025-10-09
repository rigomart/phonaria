import { AudioLines } from "lucide-react";

export function ContrastsPreview() {
	const contrasts = [
		{ label: "/ɪ/ vs /iː/", words: ["ship", "sheep"] },
		{ label: "/æ/ vs /ɛ/", words: ["man", "men"] },
	];

	return (
		<div className="space-y-2">
			{contrasts.map((contrast) => (
				<div
					key={contrast.label}
					className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/70 p-3 shadow-xs"
				>
					<div className="flex flex-col gap-1">
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
							{contrast.label}
						</p>
						<div className="flex items-center gap-3 text-sm font-semibold text-foreground">
							{contrast.words.map((word) => (
								<span key={word} className="rounded-lg bg-primary/10 px-2 py-1 text-primary">
									{word}
								</span>
							))}
						</div>
					</div>
					<span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
						<AudioLines className="size-4" aria-hidden="true" />
						Play
					</span>
				</div>
			))}
		</div>
	);
}
