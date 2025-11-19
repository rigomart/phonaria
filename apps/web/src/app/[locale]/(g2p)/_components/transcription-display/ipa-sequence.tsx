import type { TranscribedPhoneme, TranscribedSyllable } from "../../_types/g2p";
import { ClickablePhoneme } from "./clickable-phoneme";

interface IpaSequenceProps {
	syllables: TranscribedSyllable[];
	wordIndex: number;
	onPhonemeClick: (phoneme: TranscribedPhoneme) => void;
	selectedSymbol: string | null;
}

export function IpaSequence({
	syllables,
	wordIndex,
	onPhonemeClick,
	selectedSymbol,
}: IpaSequenceProps) {
	return (
		<div className="leading-normal whitespace-nowrap flex items-center">
			{syllables.map((syllable, syllableIndex) => {
				const syllableKey = syllable.phonemes.map((p) => p.symbol).join("-");
				return (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: Syllables are not reordered by the user
						key={`${syllableKey}-${wordIndex}-${syllableIndex}`}
						className="flex items-center"
					>
						{syllable.stress === "primary" && (
							<span className="text-lg md:text-xl text-muted-foreground/80 select-none -mr-0.5 mb-2">
								ˈ
							</span>
						)}
						{syllable.stress === "secondary" && (
							<span className="text-lg md:text-xl text-muted-foreground/80 select-none -mr-0.5 -mb-2">
								ˌ
							</span>
						)}
						{syllable.phonemes.map((phoneme, phonemeIndex) => (
							<ClickablePhoneme
								key={`${phoneme.symbol}-${wordIndex}-${syllableIndex}-${phonemeIndex}`}
								phoneme={phoneme}
								onClick={onPhonemeClick}
								selectedSymbol={selectedSymbol}
							/>
						))}
						{syllableIndex < syllables.length - 1 && (
							<span className="text-muted-foreground/30 select-none text-xl md:text-2xl mx-0.5">
								·
							</span>
						)}
					</div>
				);
			})}
		</div>
	);
}
