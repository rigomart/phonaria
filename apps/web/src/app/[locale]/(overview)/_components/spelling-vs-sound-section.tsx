"use client";

import { Spinner } from "@phonaria/ui/components/spinner";
import { Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAudioManager } from "@/hooks/use-audio-manager";
import {
	Section,
	SectionContent,
	SectionDescription,
	SectionHeader,
	SectionText,
	SectionTitle,
} from "./section-layout";

const PATTERN = "ough";

const baseUrl = process.env.NEXT_PUBLIC_BUCKET_URL;

const WORDS = [
	{ word: "through", hint: "throo", audioPath: "/audio/through.mp3" },
	{ word: "though", hint: "thoh", audioPath: "/audio/though.mp3" },
	{ word: "thought", hint: "thawt", audioPath: "/audio/thought.mp3" },
	{ word: "tough", hint: "tuff", audioPath: "/audio/tough.mp3" },
	{ word: "cough", hint: "koff", audioPath: "/audio/cough.mp3" },
	{ word: "bough", hint: "bow", audioPath: "/audio/bough.mp3" },
];

function highlightPattern(word: string, pattern: string) {
	const index = word.indexOf(pattern);
	if (index === -1) return <span>{word}</span>;

	const before = word.slice(0, index);
	const after = word.slice(index + pattern.length);

	return (
		<>
			<span className="text-muted-foreground">{before}</span>
			<span className="text-primary font-semibold">{pattern}</span>
			<span className="text-muted-foreground">{after}</span>
		</>
	);
}

function WordCard({ word, hint, audioPath }: { word: string; hint: string; audioPath: string }) {
	const audioSrc = `${baseUrl}${audioPath}`;
	const { play, status } = useAudioManager(audioSrc);

	const isLoading = status === "loading";
	const isPlaying = status === "playing";

	return (
		<button
			type="button"
			onClick={() => play()}
			disabled={isLoading || isPlaying}
			className="group relative flex flex-col items-center gap-1.5 rounded-lg border px-3 py-2.5 transition-all hover:bg-muted disabled:opacity-70"
		>
			{/* Word with highlighted pattern */}
			<span className="text-base font-medium tracking-tight">
				{highlightPattern(word, PATTERN)}
			</span>

			{/* Phonetic hint with audio indicator */}
			<div className="flex items-center gap-1.5">
				{isLoading ? (
					<Spinner className="size-3" />
				) : (
					<Volume2
						className={`size-3 transition-colors ${isPlaying ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}
					/>
				)}
				<span className="text-xs text-muted-foreground italic">"{hint}"</span>
			</div>
		</button>
	);
}

export function SpellingVsSoundSection() {
	const t = useTranslations("overview-page.sections.spelling-vs-sound");

	return (
		<Section>
			<SectionText>
				<SectionHeader>
					<SectionTitle>{t("title")}</SectionTitle>
					<SectionDescription>
						{t.rich("description", {
							pattern: PATTERN,
							code: (chunks) => (
								<code className="bg-muted px-1.5 py-0.5 rounded font-semibold">{chunks}</code>
							),
						})}
					</SectionDescription>
				</SectionHeader>
			</SectionText>

			<SectionContent className="grid grid-cols-3 gap-2">
				{WORDS.map((item) => (
					<WordCard key={item.word} word={item.word} hint={item.hint} audioPath={item.audioPath} />
				))}
			</SectionContent>
		</Section>
	);
}
