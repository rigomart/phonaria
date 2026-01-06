"use client";

import { Button } from "@phonaria/ui/components/button";
import { toastManager } from "@phonaria/ui/components/toast";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useG2PStore } from "../../_store/g2p-store";
import type { TranscriptionResult } from "../../_types/g2p";

interface TranscriptionCopyButtonProps {
	result: TranscriptionResult;
}

export function TranscriptionCopyButton({ result }: TranscriptionCopyButtonProps) {
	const t = useTranslations("g2p-page.transcription-display.copy-button");
	const selectedVariants = useG2PStore((state) => state.selectedVariants);
	const [isCopied, setIsCopied] = useState(false);

	const extractIpaText = () => {
		const ipaWords = result.words.map((word) => {
			const isUnknown = word.source === "fallback";
			if (isUnknown) return "";

			const selectedVariantIndex = selectedVariants[word.wordIndex] ?? 0;
			const currentVariant = word.variants[selectedVariantIndex] ?? [];

			const syllableStrings = currentVariant.map((syllable) => {
				let syllableText = "";
				if (syllable.stress === "primary") {
					syllableText += "ˈ";
				} else if (syllable.stress === "secondary") {
					syllableText += "ˌ";
				}
				syllableText += syllable.phonemes.map((p) => p.symbol).join("");
				return syllableText;
			});

			return syllableStrings.join(".");
		});

		return ipaWords.filter((w) => w.length > 0).join(" ");
	};

	const handleCopyToClipboard = async () => {
		const ipaText = extractIpaText();
		if (!ipaText) {
			return;
		}

		try {
			await navigator.clipboard.writeText(ipaText);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		} catch {
			toastManager.add({
				title: t("toast-error-failed"),
				type: "error",
			});
		}
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			className="size-8 text-muted-foreground hover:text-foreground"
			onClick={handleCopyToClipboard}
			aria-label={t("aria-label")}
		>
			{isCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
		</Button>
	);
}
