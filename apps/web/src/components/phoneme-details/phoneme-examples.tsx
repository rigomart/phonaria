import { AudioControls } from "../audio-controls";
import { Badge } from "../ui/badge";

type Props = {
	examples: {
		patterns: string[];
		words: { grapheme: string; phonemic: string; audioUrl: string }[];
	};
};

export function PhonemeExamples({ examples }: Props) {
	return (
		<section className="px-3 sm:px-4">
			<div className="rounded-lg space-y-3">
				<div className="flex items-center gap-1.5 flex-wrap">
					<span className="text-xs text-muted-foreground">Common spelling patterns:</span>
					{examples.patterns.map((pattern) => (
						<Badge key={pattern} variant="secondary">
							{pattern}
						</Badge>
					))}
				</div>
				<div className="grid gap-1.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					{examples.words.map((example) => (
						<div
							key={example.grapheme}
							className="flex items-center justify-between gap-2 rounded-md border bg-card p-2"
						>
							<div className="min-w-0 flex-1">
								<div className="font-medium text-xs truncate">{example.grapheme}</div>
								<div className="text-[11px] text-muted-foreground">/{example.phonemic}/</div>
							</div>
							<AudioControls size="xs" src={example.audioUrl} label={example.grapheme} />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
