import { AudioControls } from "../audio-controls";
import { Badge } from "../ui/badge";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "../ui/item";

type Props = {
	examples: {
		patterns: string[];
		words: { grapheme: string; phonemic: string; audioUrl: string }[];
	};
};

export function PhonemeExamples({ examples }: Props) {
	return (
		<section className="px-3 sm:px-4">
			<div className="rounded-lg space-y-2">
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
						<Item variant="outline" size="xs" key={example.grapheme}>
							<ItemContent>
								<ItemTitle className="text-xs">{example.grapheme}</ItemTitle>
								<ItemDescription className="text-xs text-muted-foreground">
									/{example.phonemic}/
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<AudioControls size="xs" src={example.audioUrl} label={example.grapheme} />
							</ItemActions>
						</Item>
					))}
				</div>
			</div>
		</section>
	);
}
