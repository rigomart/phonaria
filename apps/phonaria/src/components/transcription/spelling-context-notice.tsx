"use client";

import { useCurrentTranscription, useSpellingContextEnabled } from "@/hooks/use-transcribe";

/**
 * Discloses that spelling suggestions send text to a third party. Styled like the footer's
 * fine print and shown only on the empty page, so it never competes with a transcription.
 */
export function SpellingContextNotice() {
	const enabled = useSpellingContextEnabled();
	const { data: result } = useCurrentTranscription();
	if (!enabled || result) return null;

	return (
		<p className="px-4 pb-2 text-center text-xs text-muted-foreground">
			Spelling suggestions send your text to TypeSafe via OpenRouter.
		</p>
	);
}
