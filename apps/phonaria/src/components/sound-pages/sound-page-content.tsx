import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { buttonVariants } from "@phonaria/ui/components/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/components/link";
import { PhonemeDetailsPage } from "@/components/phoneme-details/details-page";
import { SOUNDS_PATH } from "@/lib/sound-pages";
import { cn } from "@/lib/utils";

export function SoundPageContent({ phonemeId }: { phonemeId: EnglishPhonemeSymbolId }) {
	return (
		<div className="flex flex-1 flex-col items-center bg-background">
			<div className="flex w-full max-w-5xl flex-col gap-4 p-4 sm:p-6">
				<Link
					href={SOUNDS_PATH}
					className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "-ml-2.5 self-start")}
				>
					<ArrowLeft aria-hidden="true" />
					All sounds
				</Link>
				<PhonemeDetailsPage options={{ targetAccent: "en-us", phonemeId }} />
			</div>
		</div>
	);
}
