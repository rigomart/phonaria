"use client";

import { Loader2 } from "lucide-react";
import { createContext, useContext } from "react";
import { AudioControls } from "@/components/audio-button";
import { Badge } from "@/components/ui/badge";
import { useDictionary } from "../_hooks/use-dictionary";
import type { WordDefinition } from "../_schemas/dictionary";

type WordDefinitionContextValue = {
	word: string;
	data: WordDefinition | null;
	isLoading: boolean;
	isNotFound: boolean;
	error: string | null;
};

const WordDefinitionContext = createContext<WordDefinitionContextValue | null>(null);

function useWordDefinitionContext() {
	const ctx = useContext(WordDefinitionContext);
	if (!ctx) throw new Error("WordDefinitionDetails* must be used within WordDefinitionDetails");
	return ctx;
}

function WordDefinitionDetails({ word, children }: { word: string; children: React.ReactNode }) {
	const query = useDictionary(word);
	return (
		<WordDefinitionContext.Provider
			value={{
				word,
				data: (query.data as WordDefinition | null) ?? null,
				isLoading: query.isLoading,
				isNotFound: query.isNotFound,
				error: query.errorMessage,
			}}
		>
			{children}
		</WordDefinitionContext.Provider>
	);
}

function WordDefinitionDetailsHeader() {
	const { word, data } = useWordDefinitionContext();
	return (
		<div className="flex items-end justify-between">
			<div className="space-y-1">
				<div className="text-xs text-muted-foreground mt-1">Dictionary</div>
				<div className="text-xl font-semibold">{word}</div>
			</div>
			{data?.audioUrl ? (
				<AudioControls src={data.audioUrl} label={`Pronunciation for ${word}`} variant="extended" />
			) : null}
		</div>
	);
}

function WordDefinitionDetailsContent() {
	const { data, isLoading, isNotFound, error } = useWordDefinitionContext();
	if (isLoading) {
		return (
			<div className="h-40 flex items-center justify-center">
				<div className="flex items-center gap-2 text-muted-foreground">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span className="text-sm">Fetching definition…</span>
				</div>
			</div>
		);
	}
	if (error) {
		return <div className="text-sm text-destructive">{error || "Failed to load definition."}</div>;
	}
	if (isNotFound || !data) {
		return <div className="text-sm text-muted-foreground">No definition found.</div>;
	}

	return (
		<div className="space-y-6">
			{data.meanings.map((meaning) => (
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
