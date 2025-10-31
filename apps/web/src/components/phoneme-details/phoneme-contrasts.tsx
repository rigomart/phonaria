import { ArrowRight, Info } from "lucide-react";
import { AudioControls } from "../audio-controls";
import { Badge } from "../ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type Props = {
	contrasts: {
		partner: string;
		category: string;
		summary: string;
		tactileCue?: string;
		pairs: { word: string; transcription: string; audioUrl: string }[];
	}[];
};

export function PhonemeContrasts({ contrasts }: Props) {
	return (
		<section className="space-y-2">
			<div className="flex items-center gap-1.5">
				<h3 className="text-xs font-semibold">Practice Contrasts</h3>
				<Popover>
					<PopoverTrigger asChild>
						<button
							type="button"
							className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
							aria-label="Learn more about practice contrasts"
						>
							<Info className="h-4 w-4" />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-64 text-sm">
						<p>
							Practice distinguishing this sound from similar-sounding phonemes. These minimal pairs
							help train your ear to hear the difference.
						</p>
					</PopoverContent>
				</Popover>
			</div>
			<div className="space-y-3">
				{contrasts.map((contrast, idx) => (
					<div
						key={contrast.partner}
						className={`rounded-lg border p-4 space-y-3 ${idx === 0 ? "border-solid border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20" : "border-dashed border-muted-foreground/30 bg-muted/10"}`}
					>
						<div className="flex items-center justify-between gap-3">
							<div className="text-sm font-semibold">/θ/ vs /{contrast.partner}/</div>
							<Badge
								variant={idx === 0 ? "default" : "outline"}
								className="text-[10px] uppercase tracking-wide"
							>
								{contrast.category}
							</Badge>
						</div>
						<p className="text-xs text-muted-foreground">{contrast.summary}</p>
						{contrast.tactileCue && (
							<div className="rounded-md bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-2.5 text-xs text-blue-900 dark:text-blue-100">
								<span className="font-semibold">Quick tip: </span>
								{contrast.tactileCue}
							</div>
						)}
						<div className="grid grid-cols-2 gap-3">
							{contrast.pairs.map((pair) => (
								<div key={pair.word} className="rounded-md border bg-background p-3 space-y-2">
									<div>
										<div className="text-xs font-semibold">{pair.word}</div>
										<div className="text-[10px] text-muted-foreground">/{pair.transcription}/</div>
									</div>
									<AudioControls src={pair.audioUrl} label={pair.word} />
								</div>
							))}
						</div>
						<button
							type="button"
							className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
						>
							Start practice session
							<ArrowRight className="h-3 w-3" />
						</button>
					</div>
				))}
			</div>
		</section>
	);
}
