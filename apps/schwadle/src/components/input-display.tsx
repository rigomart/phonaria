import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { PhonemeChip } from "./phoneme-chip";

type InputDisplayProps = {
	phonemes: EnglishPhonemeSymbolId[];
};

export function InputDisplay({ phonemes }: InputDisplayProps) {
	if (phonemes.length === 0) {
		return (
			<div className="flex min-h-14 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 px-4 py-3 text-sm text-muted-foreground">
				Tap phonemes below to build the pronunciation
			</div>
		);
	}

	return (
		<div className="flex min-h-14 flex-wrap items-center gap-1.5 rounded-xl border-2 border-primary/20 bg-primary/5 px-3 py-2.5 transition-colors">
			{phonemes.map((phonemeId, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: phoneme list has duplicate IDs, index is the only stable key
				<span key={`${phonemeId}-${index}`} className="animate-pop-in">
					<PhonemeChip phonemeId={phonemeId} />
				</span>
			))}
			<span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse rounded-full bg-primary/50" />
		</div>
	);
}
