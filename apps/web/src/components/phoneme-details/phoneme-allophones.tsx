import { Info } from "lucide-react";
import { AudioControls } from "../audio-controls";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "../ui/item";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type Props = {
	allophones?: {
		variant: string;
		description: string;
		examples: { word: string; transcription: string; audioUrl: string }[];
		context?: string;
	}[];
};

export function PhonemeAllophones({ allophones }: Props) {
	if (!allophones) return null;

	return (
		<section className="space-y-2 px-3 sm:px-4">
			<div className="flex items-center gap-1.5">
				<h3 className="text-base font-bold">Variations</h3>
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
					<PopoverContent className="text-sm">
						Some sounds have variations (allophones) depending on context or accent. These variants
						are pronounced slightly differently but represent the same phoneme.
					</PopoverContent>
				</Popover>
			</div>
			<div className="space-y-4">
				{allophones.map((allo) => (
					<div key={allo.variant} className="space-y-2 px-3 py-2 rounded-xl shadow-sm">
						<div className="flex items-baseline gap-2">
							<span className="font-medium text-sm">{allo.variant}</span>
							<span className="text-xs text-muted-foreground">{allo.description}</span>
						</div>
						<p className="text-xs text-muted-foreground">Context: {allo.context}</p>
						<div className="grid sm:grid-cols-2 grid-cols-1 gap-2">
							{allo.examples.map((ex) => (
								<Item key={ex.word} variant="outline" size="xs">
									<ItemContent>
										<ItemTitle className="text-sm">{ex.word}</ItemTitle>
										<ItemDescription className="text-xs text-muted-foreground">
											/{ex.transcription}/
										</ItemDescription>
									</ItemContent>
									<ItemActions>
										<AudioControls size="xs" src={ex.audioUrl} label={ex.word} />
									</ItemActions>
								</Item>
							))}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
