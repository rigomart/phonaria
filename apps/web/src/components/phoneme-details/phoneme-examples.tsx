import { AudioControls } from "../audio-controls";
import { Badge } from "../ui/badge";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "../ui/item";

type Props = {
	examples: {
		patterns: string[];
		words: {
			grapheme: { chars: string[]; highlight: number[] };
			phonemic: { chars: string[]; highlight: number[] };
			audioUrl: string;
		}[];
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
				<div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
					{examples.words.map((example) => (
						<Item variant="outline" size="xs" key={example.grapheme.chars.join("")}>
							<ItemContent>
								<ItemTitle className="text-sm flex items-center gap-0">
									{example.grapheme.chars.map((char, index) => (
										<span
											key={char}
											className={example.grapheme.highlight.includes(index) ? "text-primary" : ""}
										>
											{char}
										</span>
									))}
								</ItemTitle>
								<ItemDescription className="text-xs text-muted-foreground">
									/
									{example.phonemic.chars.map((char, index) => (
										<span
											key={char}
											className={example.phonemic.highlight.includes(index) ? "text-primary" : ""}
										>
											{char}
										</span>
									))}
									/
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<AudioControls
									size="xs"
									src={example.audioUrl}
									label={example.grapheme.chars.join("")}
								/>
							</ItemActions>
						</Item>
					))}
				</div>
			</div>
		</section>
	);
}
