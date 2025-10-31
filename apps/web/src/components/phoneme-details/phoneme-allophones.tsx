import { Info } from "lucide-react";
import { AudioControls } from "../audio-controls";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type Props = {
	allophones: {
		variant: string;
		description: string;
		examples: { word: string; transcription: string; audioUrl: string }[];
		context?: string;
	}[];
};

export function PhonemeAllophones({ allophones }: Props) {
	return (
		<section className="space-y-2">
			<div className="flex items-center gap-1.5">
				<h3 className="text-xs font-semibold">Variations</h3>
				<Popover>
					<PopoverTrigger asChild>
						<button
							type="button"
							className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
							aria-label="Learn more about variations"
						>
							<Info className="h-4 w-4" />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-64 text-sm">
						<p>
							Some sounds have variations (allophones) depending on context or accent. These
							variants are pronounced slightly differently but represent the same phoneme.
						</p>
					</PopoverContent>
				</Popover>
			</div>
			<div className="space-y-4">
				{allophones.map((allo) => (
					<div key={allo.variant} className="space-y-2">
						<div className="flex items-baseline gap-2">
							<span className="font-medium text-sm">{allo.variant}</span>
							<span className="text-xs text-muted-foreground">{allo.description}</span>
						</div>
						<p className="text-xs text-muted-foreground">Context: {allo.context}</p>
						<div className="space-y-1.5">
							{allo.examples.map((ex) => (
								<div
									key={ex.word}
									className="flex items-center justify-between gap-2 rounded border bg-card p-2"
								>
									<div>
										<div className="text-xs font-medium">{ex.word}</div>
										<div className="text-[10px] text-muted-foreground">/{ex.transcription}/</div>
									</div>
									<AudioControls src={ex.audioUrl} label={ex.word} />
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
