import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { Link } from "@/components/link";
import { PhonemeDetailsPage } from "@/components/phoneme-details/details-page";
import { SOUNDS_PATH } from "@/lib/sound-pages";

export function SoundPageContent({ phonemeId }: { phonemeId: EnglishPhonemeSymbolId }) {
	return (
		<div className="flex flex-1 flex-col items-center bg-background">
			<div className="flex w-full max-w-5xl flex-col gap-4 p-4 sm:p-6">
				<Link
					href={SOUNDS_PATH}
					className="self-start rounded-sm text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
				>
					All sounds
				</Link>
				<PhonemeDetailsPage options={{ targetAccent: "en-us", phonemeId }} />
			</div>
		</div>
	);
}
