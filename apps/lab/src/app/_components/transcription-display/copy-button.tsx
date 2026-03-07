"use client";

import { Button } from "@phonaria/ui/components/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { extractIpaText } from "@/lib/ipa-copy";
import type { TranscriptionResult } from "@/lib/types/g2p";
import { useG2PStore } from "../../_store/g2p-store";

interface CopyButtonProps {
	result: TranscriptionResult;
}

export function CopyButton({ result }: CopyButtonProps) {
	const selectedVariants = useG2PStore((state) => state.selectedVariants);
	const [isCopied, setIsCopied] = useState(false);

	const handleCopyToClipboard = async () => {
		const ipaText = extractIpaText(result, selectedVariants);
		if (!ipaText) return;

		try {
			await navigator.clipboard.writeText(ipaText);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		} catch {
			console.error("Failed to copy to clipboard");
		}
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			className="size-8 text-muted-foreground hover:text-foreground"
			onClick={handleCopyToClipboard}
			aria-label="Copy IPA transcription"
		>
			{isCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
		</Button>
	);
}
