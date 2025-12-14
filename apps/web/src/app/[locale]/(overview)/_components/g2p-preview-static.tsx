"use client";

import { BookA, ChevronDown, SendHorizonal } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PhonemeSymbolIpa } from "@phonaria/phonetics-data";

type PreviewWord = {
	word: string;
	phonemes: PhonemeSymbolIpa[];
	variantLabel?: string;
	isMissing?: boolean;
};

const PREVIEW_WORDS: PreviewWord[] = [
	{
		word: "clear",
		phonemes: ["k", "l", "ɪ", "ɹ"],
		variantLabel: "1/2",
	},
	{
		word: "sky",
		phonemes: ["s", "k", "aɪ"],
	},
];

export function G2PPreviewStatic() {
	const t = useTranslations("overview-page.launchpad.g2p.preview");

	return (
		<div className="flex h-full w-full select-none flex-col overflow-hidden rounded-xl border bg-background-soft shadow-sm">
			<div className="border-b border bg-background px-3 py-3">
				<div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
					<span className="font-medium text-muted-foreground/80">{t("header")}</span>
				</div>

				<div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
					<div className="relative flex-1">
						<div className="flex h-11 items-center rounded-lg border border-border/70 bg-background px-3 pr-16 text-sm text-muted-foreground shadow-inner shadow-black/5">
							clear sky
						</div>
						<div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
							9/200
						</div>
					</div>
					<button
						type="button"
						className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm"
					>
						<SendHorizonal className="size-4" />
					</button>
				</div>
			</div>

			<div className="relative flex flex-1 flex-wrap items-start justify-center gap-6 overflow-x-auto border-t border bg-background px-4 py-5 md:gap-7 md:px-6">
				{PREVIEW_WORDS.map((item) => (
					<div key={item.word} className="flex min-w-0 flex-col items-center gap-2 text-center">
						<div className="rounded-lg px-3 py-1 text-base font-semibold text-foreground">
							{item.word}
						</div>

						<div className="flex items-center gap-2">
							{item.isMissing ? (
								<div className="flex items-center justify-center rounded border border-dashed border-muted-foreground/40 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
									Not found
								</div>
							) : (
								<div className="flex items-center gap-1">
									{item.phonemes.map((ph, idx) => (
										<span
											key={`${item.word}-${idx}`}
											className="rounded-md px-1 text-2xl font-semibold tracking-wide text-foreground"
										>
											{ph}
										</span>
									))}
								</div>
							)}

							<span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-2 py-1 text-xs font-medium text-muted-foreground">
								<ChevronDown className="size-3" />
							</span>
						</div>
					</div>
				))}
			</div>

			<div className="flex items-center gap-2 border-t border bg-background px-3 py-2 text-[11px] text-muted-foreground">
				<BookA className="size-3 text-primary/70" />
				<div className="h-3 w-48 rounded-sm bg-muted-foreground/10" />
			</div>
		</div>
	);
}
