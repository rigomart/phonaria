import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { PhonemeChip } from "./phoneme-chip";

type InputDisplayProps = {
	phonemes: EnglishPhonemeSymbolId[];
};

export function InputDisplay({ phonemes }: InputDisplayProps) {
	if (phonemes.length === 0) {
		return (
			<div className="flex min-h-12 items-center justify-center rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
				Tap phonemes below to build the pronunciation
			</div>
		);
	}

	return (
		<div className="flex min-h-12 flex-wrap items-center gap-1 rounded-lg border px-3 py-2">
			{phonemes.map((phonemeId, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: phoneme list has duplicate IDs, index is the only stable key
				<PhonemeChip key={`${phonemeId}-${index}`} phonemeId={phonemeId} />
			))}
			<span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-foreground/40" />
		</div>
	);
}
