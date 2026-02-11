"use client";

import { Spinner } from "@phonaria/ui/components/spinner";
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAudioManager } from "@/hooks/use-audio-manager";
import { cn } from "@/lib/utils";
import { OUGH_PATTERN, OUGH_WORDS } from "../_lib/homepage-data";

const baseUrl = process.env.NEXT_PUBLIC_BUCKET_URL ?? "";

function highlightPattern(word: string, pattern: string) {
	const index = word.indexOf(pattern);
	if (index === -1) return <span>{word}</span>;

	const before = word.slice(0, index);
	const after = word.slice(index + pattern.length);

	return (
		<>
			<span className="text-muted-foreground">{before}</span>
			<span className="text-primary font-semibold">{pattern}</span>
			{after && <span className="text-muted-foreground">{after}</span>}
		</>
	);
}

function WordDisplay({ wordIndex }: { wordIndex: number }) {
	const t = useTranslations("overview-page.sections.spelling-vs-sound");
	const current = OUGH_WORDS[wordIndex];
	const audioSrc = `${baseUrl}${current.audioPath}`;
	const { play, status } = useAudioManager(audioSrc);
	const isLoading = status === "loading";
	const isPlaying = status === "playing";

	return (
		<button
			type="button"
			onClick={() => play()}
			disabled={isLoading || isPlaying}
			className="group flex flex-col items-center disabled:opacity-70"
		>
			<div className="flex items-center gap-2">
				<span className="text-3xl md:text-4xl tracking-tight">
					{highlightPattern(current.word, OUGH_PATTERN)}
				</span>
				{isLoading ? (
					<Spinner className="size-5" />
				) : (
					<Volume2
						className={`size-5 transition-colors ${
							isPlaying ? "text-primary" : "text-muted-foreground opacity-0 group-hover:opacity-60"
						}`}
					/>
				)}
			</div>
			<p className="text-sm text-muted-foreground italic mt-1.5">
				{t("sounds-like", { hint: current.hint })}
			</p>
		</button>
	);
}

export function WordExplorer() {
	const t = useTranslations("overview-page.sections.spelling-vs-sound");
	const [currentIndex, setCurrentIndex] = useState(0);

	const prev = () => setCurrentIndex((i) => (i === 0 ? OUGH_WORDS.length - 1 : i - 1));
	const next = () => setCurrentIndex((i) => (i === OUGH_WORDS.length - 1 ? 0 : i + 1));

	return (
		<div className="flex flex-col rounded-xl border bg-background overflow-hidden">
			<div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted">
				<h2 className="text-sm font-medium">{t("title")}</h2>
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={prev}
						className="size-7 rounded-md flex items-center justify-center hover:bg-background transition-colors"
						aria-label={t("prev-aria")}
					>
						<ChevronLeft className="size-4" />
					</button>
					<span className="text-xs text-muted-foreground tabular-nums w-10 text-center">
						{currentIndex + 1} / {OUGH_WORDS.length}
					</span>
					<button
						type="button"
						onClick={next}
						className="size-7 rounded-md flex items-center justify-center hover:bg-background transition-colors"
						aria-label={t("next-aria")}
					>
						<ChevronRight className="size-4" />
					</button>
				</div>
			</div>

			<div className="flex-1 flex flex-col items-center px-6 py-4">
				<p className="text-xs text-muted-foreground">{t("hint")}</p>
				<div className="flex-1 flex items-center">
					<WordDisplay wordIndex={currentIndex} />
				</div>
			</div>

			<div className="grid grid-cols-3 md:grid-cols-6 gap-1 px-3 py-2.5 border-t">
				{OUGH_WORDS.map((item, index) => (
					<button
						type="button"
						key={item.word}
						onClick={() => setCurrentIndex(index)}
						className={cn(
							"text-xs py-1 rounded-md transition-colors text-center",
							index === currentIndex
								? "bg-primary text-primary-foreground"
								: "text-muted-foreground hover:text-foreground hover:bg-muted",
						)}
					>
						{item.word}
					</button>
				))}
			</div>
		</div>
	);
}
