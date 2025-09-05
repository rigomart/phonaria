"use client";

import { X } from "lucide-react";

import { AudioButton } from "@/components/audio-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useG2PStore } from "../_store/g2p-store";

export function WordDefinitionPanel() {
	const { selectedWord, wordDefinition, definitionStatus, definitionError, clearDefinition } =
		useG2PStore();

	if (!selectedWord) return null;

	return (
		<Card className="h-fit">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">
						<span className="font-semibold">{selectedWord}</span>
					</CardTitle>
					<div className="flex items-center gap-2">
						{wordDefinition?.audioUrl && (
							<AudioButton
								src={wordDefinition.audioUrl}
								label={`Pronunciation for ${selectedWord}`}
							/>
						)}
						<Button variant="ghost" size="sm" onClick={clearDefinition} className="h-6 w-6 p-0">
							<X className="h-3 w-3" />
						</Button>
					</div>
				</div>
				<div className="text-xs text-muted-foreground mt-1">Dictionary</div>
			</CardHeader>

			<CardContent>
				{definitionStatus === "loading" && (
					<div className="space-y-3">
						<Skeleton className="h-5 w-40" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-5/6" />
						<Skeleton className="h-4 w-4/6" />
					</div>
				)}

				{definitionStatus === "not_found" && (
					<div className="text-sm text-muted-foreground">No definition found.</div>
				)}

				{definitionStatus === "error" && (
					<div className="text-sm text-destructive">
						{definitionError || "Failed to load definition."}
					</div>
				)}

				{definitionStatus === "loaded" && wordDefinition && (
					<ScrollArea className="h-[400px] pr-3">
						<div className="space-y-8">
							{wordDefinition.meanings.map((meaning) => (
								<div
									key={`${meaning.partOfSpeech}-${meaning.definitions[0]?.definition.slice(0, 40) || meaning.partOfSpeech}`}
									className="space-y-2"
								>
									<div className="flex items-center gap-2">
										<Badge variant="secondary" className="capitalize">
											{meaning.partOfSpeech}
										</Badge>
									</div>
									<ol className="list-decimal list-inside space-y-2">
										{meaning.definitions.map((def) => (
											<li
												key={`${def.definition.slice(0, 60)}-${def.example || ""}`}
												className="leading-relaxed"
											>
												<span className="text-sm">{def.definition}</span>
												{def.example && (
													<div className="text-xs text-muted-foreground mt-1">“{def.example}”</div>
												)}
											</li>
										))}
									</ol>
								</div>
							))}
						</div>
					</ScrollArea>
				)}
			</CardContent>
		</Card>
	);
}
