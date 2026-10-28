import {
	isPhonemeInLanguage,
	type LanguagePhonemeId,
	type PhonemeSymbolId,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { PhonemeDetailsTrigger } from "@/components/phoneme-details/phoneme-details";
import type { TranscribedPhoneme } from "@/lib/types/g2p";
import { cn } from "@/lib/utils";

interface ClickablePhonemeProps {
	targetAccent: TargetAccent;
	phoneme: TranscribedPhoneme;
	/** Underlined and named in the label, so the mark doesn't rely on color. */
	marked?: boolean;
}

export function ClickablePhoneme({ targetAccent, phoneme, marked = false }: ClickablePhonemeProps) {
	if (!phoneme.phonemeId) {
		return (
			<span
				className="text-2xl md:text-4xl rounded-lg px-1.5 py-1 opacity-70 underline decoration-dotted underline-offset-4"
				title={`/${phoneme.symbol}/ - not found in phoneme database`}
			>
				{phoneme.symbol}
			</span>
		);
	}

	return (
		<PhonemeDetailsButton
			targetAccent={targetAccent}
			phonemeId={phoneme.phonemeId}
			symbol={phoneme.symbol}
			className="text-2xl md:text-4xl"
			marked={marked}
		/>
	);
}

export function PhonemeDetailsButton({
	targetAccent,
	phonemeId,
	symbol,
	className,
	marked = false,
}: {
	targetAccent: TargetAccent;
	phonemeId: PhonemeSymbolId;
	symbol: string;
	className?: string;
	marked?: boolean;
}) {
	if (!isPhonemeInLanguage(targetAccent, phonemeId)) return null;

	return (
		<PhonemeDetailsTrigger
			details={{
				targetAccent,
				phonemeId: phonemeId as LanguagePhonemeId<typeof targetAccent>,
			}}
			render={
				<button
					type="button"
					className={cn(
						"rounded-lg px-1.5 py-1 cursor-pointer",
						"transition-colors duration-150",
						"hover:bg-secondary hover:text-primary",
						"data-details-open:bg-secondary data-details-open:text-primary",
						className,
					)}
					aria-label={
						marked ? `Details for /${symbol}/, the marked sound` : `Details for /${symbol}/`
					}
				/>
			}
		>
			{marked ? (
				// A bar under the glyph alone: a text underline breaks around descenders
				// like p and ʃ, and a border on the button would run into the stress mark.
				<span className="border-foreground border-b-2" data-marked-sound="">
					{symbol}
				</span>
			) : (
				symbol
			)}
		</PhonemeDetailsTrigger>
	);
}
