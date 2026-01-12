"use client";

import { Spinner } from "@phonaria/ui/components/spinner";
import { Volume2 } from "lucide-react";
import { useAudioManager } from "@/hooks/use-audio-manager";

const PATTERN = "ough";

const baseUrl = process.env.NEXT_PUBLIC_BUCKET_URL;

const WORDS = [
	{ word: "through", hint: "throo", audioPath: "/audio/words/through.mp3" },
	{ word: "though", hint: "thoh", audioPath: "/audio/words/though.mp3" },
	{ word: "thought", hint: "thawt", audioPath: "/audio/words/thought.mp3" },
	{ word: "tough", hint: "tuff", audioPath: "/audio/words/tough.mp3" },
	{ word: "cough", hint: "koff", audioPath: "/audio/words/cough.mp3" },
	{ word: "bough", hint: "bow", audioPath: "/audio/words/bough.mp3" },
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
			className="group relative flex flex-col items-center gap-1 rounded-lg border bg-background px-3 py-2.5 transition-all hover:border-primary/50 hover:shadow-sm disabled:opacity-70"
		>
			{/* Play indicator */}
			<div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
				{isLoading ? (
					<Spinner className="size-3.5" />
				) : (
					<Volume2 className="size-3.5 text-muted-foreground" />
				)}
			</div>

			{/* Word with highlighted pattern */}
			<span className="text-base font-medium tracking-tight">
				{highlightPattern(word, PATTERN)}
			</span>

			{/* Phonetic hint */}
			<span className="text-xs text-muted-foreground italic">"{hint}"</span>
		</button>
	);
}

export function SpellingVsSoundSection() {
	return (
		<section className="grid md:grid-cols-2 gap-6 items-center py-4">
			{/* Text Column */}
			<div className="space-y-2">
				<h2 className="text-base font-semibold tracking-tight">Spelling Doesn't Match Sound</h2>
				<p className="text-muted-foreground leading-relaxed text-sm">
					English spelling is unpredictable. Take{" "}
					<code className="bg-muted px-1 py-0.5 rounded border font-semibold">{PATTERN}</code> -
					these four letters sound different in each word. Click to hear them.
				</p>
			</div>

			{/* Interactive Column */}
			<div className="rounded-xl border bg-muted/30 p-3">
				<div className="grid grid-cols-3 gap-2">
					{WORDS.map((item) => (
						<WordCard
							key={item.word}
							word={item.word}
							hint={item.hint}
							audioPath={item.audioPath}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
