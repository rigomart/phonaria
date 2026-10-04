import type { TargetAccent } from "@phonaria/phonetics-data";
import type { TranscribedSyllable } from "@/lib/types/g2p";
import { ClickablePhoneme } from "./clickable-phoneme";

interface IpaSequenceProps {
	targetAccent: TargetAccent;
	syllables: TranscribedSyllable[];
	wordIndex: number;
}

/**
 * Stress marks, phonemes, and syllable dots carry `data-ipa-token` so a
 * variant switch can morph one rendered sequence into the next.
 */
export function IpaSequence({ targetAccent, syllables, wordIndex }: IpaSequenceProps) {
	return (
		<div className="leading-normal whitespace-nowrap flex items-center">
			{syllables.map((syllable, syllableIndex) => {
				const syllableKey = syllable.phonemes.map((p) => p.symbol).join("-");
				return (
					<div key={`${syllableKey}-${wordIndex}-${syllableIndex}`} className="flex items-center">
						{syllable.stress === "primary" && (
							<span
								data-ipa-token="stress"
								className="text-2xl md:text-4xl text-muted-foreground select-none"
							>
								ˈ
							</span>
						)}
						{syllable.stress === "secondary" && (
							<span
								data-ipa-token="stress"
								className="text-2xl md:text-4xl text-muted-foreground select-none"
							>
								ˌ
							</span>
						)}
						{syllable.phonemes.map((phoneme, phonemeIndex) => (
							<span
								key={`${phoneme.symbol}-${wordIndex}-${syllableIndex}-${phonemeIndex}`}
								data-ipa-token="phoneme"
								className="flex"
							>
								<ClickablePhoneme targetAccent={targetAccent} phoneme={phoneme} />
							</span>
						))}
						{syllableIndex < syllables.length - 1 && (
							<span
								data-ipa-token="dot"
								className="text-muted-foreground/30 select-none text-xl md:text-2xl mx-0.5"
							>
								·
							</span>
						)}
					</div>
				);
			})}
		</div>
	);
}
