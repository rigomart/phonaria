"use client";

import { createContext, useContext } from "react";
import { AudioControls } from "@/components/audio-button";
import { Badge } from "@/components/ui/badge";
import type { WordDefinition } from "../_schemas/dictionary";

type WordDefinitionContextValue = {
	wordDefinition: WordDefinition;
};

const WordDefinitionContext = createContext<WordDefinitionContextValue | null>(null);

function useWordDefinitionContext() {
	const ctx = useContext(WordDefinitionContext);
	if (!ctx) throw new Error("WordDefinitionDetails* must be used within WordDefinitionDetails");
	return ctx;
}

type WordDefinitionDetailsProps = {
	wordDefinition: WordDefinition;
	children: React.ReactNode;
};

function WordDefinitionDetails({ wordDefinition, children }: WordDefinitionDetailsProps) {
	return (
		<WordDefinitionContext.Provider
			value={{
				wordDefinition,
			}}
		>
			{children}
		</WordDefinitionContext.Provider>
	);
}

function WordDefinitionDetailsHeader() {
	const { wordDefinition } = useWordDefinitionContext();
	return (
		<div className="flex items-end justify-between">
			<div className="space-y-1">
				<div className="text-xs text-muted-foreground mt-1">Dictionary</div>
				<div className="text-xl font-semibold">{wordDefinition.word}</div>
			</div>
			{wordDefinition.audioUrl ? (
				<AudioControls
					src={wordDefinition.audioUrl}
					label={`Pronunciation for ${wordDefinition.word}`}
					variant="extended"
				/>
			) : null}
		</div>
	);
}

function WordDefinitionDetailsContent() {
	const { wordDefinition } = useWordDefinitionContext();

	if (!wordDefinition) {
		return <div className="text-sm text-muted-foreground">No definition found.</div>;
	}

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

export { WordDefinitionDetails, WordDefinitionDetailsHeader, WordDefinitionDetailsContent };
