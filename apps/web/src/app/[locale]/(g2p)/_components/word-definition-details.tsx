"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { AudioControls } from "@/components/audio-button";
import { Badge } from "@/components/ui/badge";
import type { WordDefinition } from "../_schemas/dictionary";

type WordDefinitionDetailsHeaderProps = {
	word: string;
	audioUrl?: string;
};

function WordDefinitionDetailsHeader({ word, audioUrl }: WordDefinitionDetailsHeaderProps) {
	return (
		<div className="flex items-end justify-between">
			<div className="flex items-end gap-3">
				<div className="space-y-1">
					<div className="text-xs text-muted-foreground mt-1">Dictionary</div>
					<div className="text-xl font-semibold">{word}</div>
				</div>
				{audioUrl && <WordDefinitionDetailsAudio audioUrl={audioUrl} word={word} />}
			</div>
		</div>
	);
}

type WordDefinitionDetailsAudioProps = {
	audioUrl: string;
	word: string;
};

function WordDefinitionDetailsAudio({ audioUrl, word }: WordDefinitionDetailsAudioProps) {
	return (
		<AudioControls
			src={audioUrl}
			label={`Pronunciation for ${word}`}
			variant="default"
			className="ml-3"
		/>
	);
}

type WordDefinitionDetailsContentProps = {
	wordDefinition: WordDefinition;
};

function WordDefinitionDetailsContent({ wordDefinition }: WordDefinitionDetailsContentProps) {
	return (
		<div className="space-y-6">
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
								className="leading-relaxed text-sm"
							>
								<span className="text-sm">{def.definition}</span>
								{def.example ? (
									<div className="text-xs text-muted-foreground mt-1">“{def.example}”</div>
								) : null}
							</li>
						))}
					</ol>
				</div>
			))}
		</div>
	);
}

function WordDefinitionDetailsContentLoading() {
	return (
		<div className="flex flex-col justify-center items-center h-full gap-2 py-6">
			<Loader2 className="h-10 w-10 animate-spin" />
			<span className="text-sm text-muted-foreground">Loading...</span>
		</div>
	);
}

function WordDefinitionDetailsContentNotFound() {
	return (
		<div className="h-full flex flex-col items-center justify-center gap-2 py-8 text-center text-destructive">
			<AlertTriangle className="w-8 h-8" />
			<span className="font-medium text-base">Definition not found.</span>
			<span className="text-xs text-muted-foreground">
				We couldn't find a definition for this word.
			</span>
		</div>
	);
}

export {
	WordDefinitionDetailsHeader,
	WordDefinitionDetailsContent,
	WordDefinitionDetailsContentLoading,
	WordDefinitionDetailsContentNotFound,
	WordDefinitionDetailsAudio,
};
