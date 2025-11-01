import { ArrowUpRight, Info } from "lucide-react";
import { AudioControls } from "../audio-controls";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "../ui/item";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type Props = {
	contrasts: {
		partner: string;
		category: string;
		summary: string;
		pairs: { word: string; transcription: string; audioUrl: string }[];
	}[];
};

export function PhonemeContrasts({ contrasts }: Props) {
	return (
		<section className="space-y-2 px-3 sm:px-4">
			<div className="flex items-center gap-1.5">
				<h3 className="text-base font-bold">Contrasts</h3>
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
					<PopoverContent className="text-sm">
						Practice distinguishing this sound from similar-sounding phonemes. These minimal pairs
						help train your ear to hear the difference.
					</PopoverContent>
				</Popover>
			</div>
			<div className="space-y-3">
				{contrasts.map((contrast) => (
					<div key={contrast.partner} className="space-y-3 px-3 py-2 rounded-xl shadow-sm">
						<div className="space-y-1">
							<div className="flex items-center justify-between gap-3">
								<div className="flex items-center gap-3">
									<h4 className="text-sm font-semibold">/θ/ vs /{contrast.partner}/</h4>
									<Badge variant="secondary" className="text-xs">
										{contrast.category}
									</Badge>
								</div>
								<Button variant="ghost" size="xs">
									Open contrast <ArrowUpRight className="size-4" />
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">{contrast.summary}</p>
						</div>

						<div className="grid sm:grid-cols-2 grid-cols-1 gap-3">
							{contrast.pairs.map((pair) => (
								<Item variant="outline" size="xs" key={pair.word}>
									<ItemContent>
										<ItemTitle className="text-xs">{pair.word}</ItemTitle>
										<ItemDescription className="text-xs text-muted-foreground">
											/{pair.transcription}/
										</ItemDescription>
									</ItemContent>
									<ItemActions>
										<AudioControls size="xs" src={pair.audioUrl} label={pair.word} />
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
