"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useScopedI18n } from "@/locales/client";
import { useG2PStore } from "../../_store/g2p-store";
import type { TranscriptionResult } from "../../_types/g2p";

interface TranscriptionCopyButtonProps {
	result: TranscriptionResult;
}

export function TranscriptionCopyButton({ result }: TranscriptionCopyButtonProps) {
	const t = useScopedI18n("g2p-page.transcription-display.copy-button");
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
			toast.error(t("toast-error"));
			return;
		}

		try {
			await navigator.clipboard.writeText(ipaText);
			setIsCopied(true);
			toast.success(t("toast-success"));
			setTimeout(() => setIsCopied(false), 2000);
		} catch (error) {
			toast.error(t("toast-error-failed"));
			console.error("Copy failed:", error);
		}
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			className="h-8 w-8 text-muted-foreground hover:text-foreground"
			onClick={handleCopyToClipboard}
			aria-label={t("aria-label")}
		>
			{isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
		</Button>
	);
}
