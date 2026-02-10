"use client";

import { PhonemeIpaMap, type PhonemeSymbolId } from "@phonaria/phonetics-data";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { PhonemeDetailsDialog } from "@/components/phoneme-details/phoneme-details-dialog";
import { Link } from "@/i18n/navigation";
import { MINIMAL_PAIRS } from "../_lib/homepage-data";

export function MinimalPairSection() {
	const t = useTranslations("overview-page.sections.sound-contrasts");
	const [selectedPhoneme, setSelectedPhoneme] = useState<PhonemeSymbolId | null>(null);

	return (
		<div className="rounded-xl border bg-background overflow-hidden">
			<div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted">
				<h2 className="text-sm font-medium">{t("title")}</h2>
				<Link
					href="/ipa-chart"
					className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline transition-colors"
				>
					{t("action")}
					<ArrowRight className="size-3" />
				</Link>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
				{MINIMAL_PAIRS.map((pair) => (
					<div key={pair.wordA} className="px-4 py-4">
						<div className="text-xs text-muted-foreground mb-3">{t(`labels.${pair.labelKey}`)}</div>

						<div className="flex items-baseline justify-between mb-3">
							<div>
								<span className="text-base font-medium">{pair.wordA}</span>
								<span className="text-sm font-serif text-muted-foreground ml-2">/{pair.ipaA}/</span>
							</div>
							<div className="text-right">
								<span className="text-base font-medium">{pair.wordB}</span>
								<span className="text-sm font-serif text-muted-foreground ml-2">/{pair.ipaB}/</span>
							</div>
						</div>

						<div className="flex items-center justify-center gap-3">
							<button
								type="button"
								onClick={() => setSelectedPhoneme(pair.diffA)}
								className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-base font-serif hover:ring-1 hover:ring-primary hover:ring-offset-1 transition-all"
							>
								{PhonemeIpaMap[pair.diffA]}
							</button>
							<span className="text-xs text-muted-foreground">{t("vs")}</span>
							<button
								type="button"
								onClick={() => setSelectedPhoneme(pair.diffB)}
								className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-base font-serif hover:ring-1 hover:ring-primary hover:ring-offset-1 transition-all"
							>
								{PhonemeIpaMap[pair.diffB]}
							</button>
						</div>
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
