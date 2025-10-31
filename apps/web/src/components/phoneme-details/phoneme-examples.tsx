import { AudioControls } from "../audio-controls";

type Props = {
	examples: {
		pattern: string;
		words: { word: string; transcription: string; audioUrl: string }[];
	};
};

export function PhonemeExamples({ examples }: Props) {
	return (
		<section className="px-3 sm:px-4">
			<div className="rounded-lg border bg-muted/30 p-3 space-y-3">
				<div className="flex items-center gap-1.5">
					<span className="inline-flex items-center justify-center rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
						{examples.pattern}
					</span>
					<span className="text-xs text-muted-foreground">Most common spelling pattern</span>
				</div>
				<div className="grid gap-1.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					{examples.words.map((example) => (
						<div
							key={example.word}
							className="flex items-center justify-between gap-2 rounded-md border bg-card p-2"
						>
							<div className="min-w-0 flex-1">
								<div className="font-medium text-xs truncate">{example.word}</div>
								<div className="text-[11px] text-muted-foreground">/{example.transcription}/</div>
							</div>
							<AudioControls size="xs" src={example.audioUrl} label={example.word} />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
