"use client";

import { Button } from "@phonaria/ui/components/button";
import { Trash, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { KeyboardPhoneme } from "../_lib/keyboard-layout";

interface SoundSequenceBuilderProps {
	phonemes: KeyboardPhoneme[];
	onRemove: (index: number) => void;
	onClearAll: () => void;
}

export function SoundSequenceBuilder({
	phonemes,
	onRemove,
	onClearAll,
}: SoundSequenceBuilderProps) {
	const t = useTranslations("find-by-sound-page.sequence");

	if (phonemes.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-4 text-center">
				<p className="text-sm text-muted-foreground">{t("empty")}</p>
			</div>
		);
	}

	return (
		<div className="rounded-lg bg-muted/30 flex gap-2 justify-between items-center">
			<div className="flex flex-wrap items-center gap-1">
				{phonemes.map((phoneme, index) => (
					<Button
						key={`${index}-${phoneme.id}`}
						size="default"
						variant="outline"
						className="bg-background"
						onClick={() => onRemove(index)}
						aria-label={t("remove-aria", { phoneme: phoneme.ipa })}
					>
						<span className="font-medium">{phoneme.ipa}</span>
						<X className="size-3 opacity-70" aria-hidden="true" />
					</Button>
				))}
			</div>
			<Button variant="ghost" size="sm" onClick={onClearAll}>
				<Trash className="size-3 opacity-70" aria-hidden="true" />
				{t("clear")}
			</Button>
		</div>
	);
}
