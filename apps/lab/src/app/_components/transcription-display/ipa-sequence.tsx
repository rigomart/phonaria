import type { TargetAccent } from "@phonaria/phonetics-data";
import type { TranscribedSyllable } from "@/lib/types/g2p";
import { ClickablePhoneme } from "./clickable-phoneme";

interface IpaSequenceProps {
	targetAccent: TargetAccent;
	syllables: TranscribedSyllable[];
	wordIndex: number;
}

export function IpaSequence({ targetAccent, syllables, wordIndex }: IpaSequenceProps) {
	return (
		<div className="leading-normal whitespace-nowrap flex items-center">
			{syllables.map((syllable, syllableIndex) => {
				const syllableKey = syllable.phonemes.map((p) => p.symbol).join("-");
				return (
					<div key={`${syllableKey}-${wordIndex}-${syllableIndex}`} className="flex items-center">
						{syllable.stress === "primary" && (
							<span className="text-2xl md:text-4xl text-muted-foreground select-none">ˈ</span>
						)}
						{syllable.stress === "secondary" && (
							<span className="text-2xl md:text-4xl text-muted-foreground select-none">ˌ</span>
						)}
						{syllable.phonemes.map((phoneme, phonemeIndex) => (
							<ClickablePhoneme
								key={`${phoneme.symbol}-${wordIndex}-${syllableIndex}-${phonemeIndex}`}
								targetAccent={targetAccent}
								phoneme={phoneme}
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
