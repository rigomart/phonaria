import { X } from "lucide-react";
import type { IpaPhoneme } from "shared-data";
import { phonixUtils } from "shared-data";
import { AudioButton } from "@/components/audio-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const { toPhonemic, getExampleAudioUrl } = phonixUtils;

interface PhonemeDetailPanelProps {
	phoneme: IpaPhoneme | null;
	onClose: () => void;
}

export function PhonemeDetailPanel({ phoneme, onClose }: PhonemeDetailPanelProps) {
	if (!phoneme) {
		return (
			<Card className="h-fit">
				<CardContent className="p-6 text-center">
					<div className="text-sm text-muted-foreground">Click a phoneme to view details</div>
				</CardContent>
			</Card>
		);
	}

	const articulationProperties =
		phoneme.category === "consonant"
			? [
					{ label: "Voicing", value: phoneme.articulation.voicing },
					{ label: "Place", value: phoneme.articulation.place },
					{ label: "Manner", value: phoneme.articulation.manner },
				]
			: [
					{ label: "Height", value: phoneme.articulation.height },
					{ label: "Frontness", value: phoneme.articulation.frontness },
					{ label: "Rounding", value: phoneme.articulation.roundness },
					{ label: "Tenseness", value: phoneme.articulation.tenseness },
					...(phoneme.articulation.rhoticity
						? [{ label: "Rhoticity", value: phoneme.articulation.rhoticity }]
						: []),
				];

	return (
		<Card className="h-fit sticky top-6">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">
						<span className="text-muted-foreground">/</span>
						<span className="font-semibold">{phoneme.symbol}</span>
						<span className="text-muted-foreground">/</span>
					</CardTitle>
					<Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
						<X className="h-3 w-3" />
					</Button>
				</div>
				<div className="text-xs text-muted-foreground mt-1">{phoneme.description}</div>
			</CardHeader>

			<CardContent className="space-y-4">
				<ScrollArea className="h-[400px] pr-3">
					{/* Articulation */}
					<div className="space-y-2">
						<h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							Articulation
						</h4>
						<div className="space-y-1">
							{articulationProperties.map(({ label, value }) => (
								<div key={label} className="flex justify-between text-xs">
									<span className="text-muted-foreground">{label}:</span>
									<span className="font-medium capitalize">{value}</span>
								</div>
							))}
						</div>
					</div>

					<Separator className="my-3" />

					{/* Guide */}
					<div className="space-y-2">
						<h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							How to Make It
						</h4>
						<p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
							{phoneme.guide}
						</p>
					</div>

					<Separator className="my-3" />

					{/* Examples */}
					<div className="space-y-2">
						<h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							Examples
						</h4>
						<div className="space-y-2">
							{phoneme.examples.slice(0, 3).map((example) => (
								<div
									key={example.word}
									className="flex items-center justify-between p-2 rounded-md bg-muted/30"
								>
									<div className="flex-1">
										<div className="text-sm font-medium">{example.word}</div>
										<div className="text-xs text-muted-foreground">
											{toPhonemic(example.phonemic)}
										</div>
									</div>
									<AudioButton
										src={getExampleAudioUrl(example.word)}
										label={`Play ${example.word}`}
									/>
								</div>
							))}
						</div>
					</div>

					{/* Allophones */}
					{phoneme.allophones && phoneme.allophones.length > 0 && (
						<>
							<Separator className="my-3" />
							<div className="space-y-2">
								<h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
									Allophones
								</h4>
								<div className="space-y-2">
									{phoneme.allophones.slice(0, 2).map((allophone) => (
										<div key={allophone.variant} className="p-2 rounded-md bg-muted/20">
											<div className="text-xs font-medium">{allophone.variant}</div>
											<div className="text-xs text-muted-foreground mt-1">
												{allophone.description}
											</div>
										</div>
									))}
								</div>
							</div>
						</>
					)}
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
