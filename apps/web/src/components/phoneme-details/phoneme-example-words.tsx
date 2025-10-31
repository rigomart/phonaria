import { Info } from "lucide-react";
import { AudioControls } from "../audio-controls";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type Props = {
	examples: {
		word: string;
		transcription: string;
		audioUrl: string;
	}[];
};

export function PhonemeExampleWords({ examples }: Props) {
	return (
		<section className="space-y-2">
			<div className="flex items-center gap-1.5">
				<h3 className="text-xs font-semibold">Examples</h3>
				<Popover>
					<PopoverTrigger asChild>
						<button
							type="button"
							className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
							aria-label="Learn more about examples"
						>
							<Info className="h-4 w-4" />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-64 text-sm">
						<p>
							Hear how this sound appears in real words. Notice where it occurs (beginning, middle,
							or end) to understand its position in English.
						</p>
					</PopoverContent>
				</Popover>
			</div>
			<div className="grid gap-1.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
				{examples.map((example) => (
					<div
						key={example.word}
						className="flex items-center justify-between gap-2 rounded-md border bg-card p-2"
					>
						<div className="min-w-0 flex-1">
							<div className="font-medium text-xs truncate">{example.word}</div>
							<div className="text-[11px] text-muted-foreground">/{example.transcription}/</div>
						</div>
						<AudioControls src={example.audioUrl} label={example.word} />
					</div>
				))}
			</div>
		</section>
	);
}
