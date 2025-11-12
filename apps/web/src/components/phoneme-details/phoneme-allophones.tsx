import { Info } from "lucide-react";
import { phonemeAllophones } from "shared-data";
import { allophoneContextDefinitions } from "@/data/phoneme-details";
import { AudioControls } from "../audio-controls";
import { Badge } from "../ui/badge";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "../ui/item";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { usePhonemeDetailsContext } from "./phoneme-details-context";

export function PhonemeDetailsAllophones() {
	const { phonemeId } = usePhonemeDetailsContext();
	const allophones = phonemeAllophones[phonemeId];

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
				{allophones.map((allo) => {
					const contextCopy = allophoneContextDefinitions[allo.contextKey];

					return (
						<div key={allo.ipaVariant} className="space-y-2">
							<div className="flex flex-col gap-1.5">
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="text-base font-mono px-2.5 py-0.5">
										{allo.ipaVariant}
									</Badge>
									<span className="text-sm font-semibold">{contextCopy.name}</span>
								</div>
								<p className="text-sm text-muted-foreground pl-1">{contextCopy.description}</p>
								<p className="text-xs text-muted-foreground pl-1 flex items-center gap-1">
									<span className="text-muted-foreground/60">→</span>
									{contextCopy.when}
								</p>
							</div>
							<div className="grid sm:grid-cols-2 grid-cols-1 gap-2">
								{allo.examples.map((ex) => (
									<Item key={ex.word} variant="outline" size="xs">
										<ItemContent>
											<ItemTitle className="text-sm">{ex.word}</ItemTitle>
											<ItemDescription className="text-xs text-muted-foreground">
												/{ex.phonemic}/
											</ItemDescription>
										</ItemContent>
										<ItemActions>
											<AudioControls
												size="xs"
												path={`/audio/phoneme-examples/${ex.word}.mp3`}
												label={ex.word}
											/>
										</ItemActions>
									</Item>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
