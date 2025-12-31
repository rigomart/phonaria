"use client";

import { Separator } from "@phonaria/ui/components/separator";
import { useTranslations } from "next-intl";
import type { KeyboardPhoneme } from "../../_lib/keyboard-layout";
import { ConsonantKeyboard } from "./consonant-keyboard";
import { VowelKeyboard } from "./vowel-keyboard";

interface IpaKeyboardProps {
	onSelectPhoneme: (phoneme: KeyboardPhoneme) => void;
}

export function IpaKeyboard({ onSelectPhoneme }: IpaKeyboardProps) {
	const t = useTranslations("ipa-chart.nav-tabs");
	return (
		<div className="flex flex-col gap-2">
			<div>
				<p className="text-xs font-medium text-muted-foreground mb-1 px-0.5">{t("consonants")}</p>
				<ConsonantKeyboard onSelectPhoneme={onSelectPhoneme} />
			</div>
			<Separator />
			<div>
				<p className="text-xs font-medium text-muted-foreground mb-1 px-0.5">{t("vowels")}</p>
				<VowelKeyboard onSelectPhoneme={onSelectPhoneme} />
			</div>
		</div>
	);
}
