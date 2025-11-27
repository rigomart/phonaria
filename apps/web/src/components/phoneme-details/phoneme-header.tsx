import { getIpaForPhonemeId } from "shared-data";
import { phonemeDetailsById } from "@/data/phoneme-details";
import { AudioControls } from "../audio-controls";
import { usePhonemeDetailsContext } from "./phoneme-details-context";

export function PhonemeDetailsHeader() {
	const { phonemeId } = usePhonemeDetailsContext();

	const ipa = getIpaForPhonemeId(phonemeId);
	const { label } = phonemeDetailsById[phonemeId];

	return (
		<div className="flex flex-col gap-1 bg-background-strong py-3 px-4 shadow-sm">
			<div className="flex gap-6 items-center">
				<div className="flex items-baseline gap-2">
					<span className="text-2xl sm:text-4xl text-muted-foreground/50 font-semibold">/</span>
					<span className="text-3xl sm:text-5xl leading-none font-bold">{ipa}</span>
					<span className="text-2xl sm:text-4xl text-muted-foreground/50 font-semibold">/</span>
				</div>
				<AudioControls
					size="sm"
					path={`/audio/phonemes/${phonemeId}.mp3`}
					label={`Play ${phonemeId}`}
				/>
			</div>
			<p className="text-xs sm:text-sm text-left text-muted-foreground/80">{label}</p>
		</div>
	);
}
