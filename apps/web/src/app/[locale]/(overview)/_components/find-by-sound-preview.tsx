"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";

type PreviewPhoneme = {
	ipa: string;
};

type PreviewWord = {
	word: string;
	ipa: string;
};

export function FindBySoundPreviewStatic() {
	const t = useTranslations("overview-page.launchpad.find-by-sound.preview");

	const samplePhonemes: PreviewPhoneme[] = [{ ipa: "k" }, { ipa: "æ" }, { ipa: "t" }];

	const sampleResults: PreviewWord[] = [
		{ word: "cat", ipa: "kæt" },
		{ word: "cats", ipa: "kæts" },
		{ word: "catfish", ipa: "kætfɪʃ" },
		{ word: "cattle", ipa: "kætəl" },
		{ word: "catcher", ipa: "kætʃɚ" },
	];

	return (
		<div className="flex h-full w-full select-none flex-col overflow-hidden rounded-xl border bg-background-soft shadow-sm">
			<div className="border-b border bg-background px-3 py-3">
				<div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-3">
					<span className="font-medium text-muted-foreground/80">{t("header")}</span>
				</div>

				<div className="rounded-lg bg-muted/30 flex gap-2 justify-between items-center px-2 py-1.5">
					<div className="flex flex-wrap items-center gap-1">
						{samplePhonemes.map((phoneme, index) => (
							<div
								key={`${index}-${phoneme.ipa}`}
								className="inline-flex items-center gap-1 rounded-lg border bg-background px-2 py-1 text-sm font-medium"
							>
								<span>{phoneme.ipa}</span>
								<X className="size-3 opacity-70" />
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="flex-1 overflow-hidden border-t border bg-background">
				<div className="flex items-center justify-between px-3 py-2 border-b bg-background-soft/50">
					<span className="text-xs font-medium text-foreground/80">Results</span>
					<span className="text-xs text-muted-foreground tabular-nums">24 words</span>
				</div>

				<div className="px-2 py-2 space-y-1 overflow-auto max-h-full">
					{sampleResults.map((result) => (
						<div
							key={result.word}
							className="flex items-center gap-2 rounded-md p-1 hover:bg-muted/50 transition-colors"
						>
							<span className="text-sm font-medium text-foreground">{result.word}</span>
							<span className="text-xs text-muted-foreground">/{result.ipa}/</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
