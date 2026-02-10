"use client";

import { PhonemeIpaMap, type PhonemeSymbolId } from "@phonaria/phonetics-data";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { PhonemeDetailsDialog } from "@/components/phoneme-details/phoneme-details-dialog";
import { Link } from "@/i18n/navigation";
import { OUGH_WORDS } from "../_lib/homepage-data";

export function PhonemeMap() {
	const t = useTranslations("overview-page.sections.ipa-transcription");
	const [selectedPhoneme, setSelectedPhoneme] = useState<PhonemeSymbolId | null>(null);

	return (
		<div className="flex flex-col rounded-xl border bg-background overflow-hidden">
			<div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted">
				<h2 className="text-sm font-medium">{t("title")}</h2>
				<Link
					href="/transcription"
					className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline transition-colors"
				>
					{t("action")}
					<ArrowRight className="size-3" />
				</Link>
			</div>

			<div className="flex-1">
				{OUGH_WORDS.map((item) => (
					<div
						key={item.word}
						className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0"
					>
						<span className="text-sm font-medium w-20">{item.word}</span>

						<ArrowRight className="size-3 text-muted-foreground shrink-0" />

						<div className="flex items-center gap-1">
							{item.phonemes.map((phoneme, i) => (
								<button
									key={`${item.word}-${phoneme.id}-${i}`}
									type="button"
									onClick={() => setSelectedPhoneme(phoneme.id)}
									className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-sm font-serif transition-colors hover:ring-1 hover:ring-primary ${
										phoneme.isHighlighted
											? "bg-primary text-primary-foreground"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									{PhonemeIpaMap[phoneme.id]}
								</button>
							))}
						</div>

						<span className="ml-auto text-xs text-muted-foreground italic hidden md:block">
							{item.hint}
						</span>
					</div>
				))}
			</div>

			{selectedPhoneme && (
				<PhonemeDetailsDialog
					open={!!selectedPhoneme}
					onOpenChange={(open) => !open && setSelectedPhoneme(null)}
					phonemeId={selectedPhoneme}
				/>
			)}
		</div>
	);
}
