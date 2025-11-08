import { allPhonemeSymbols } from "shared-data";
import { phonemeDetailsById } from "@/data/phoneme-details";
import { AudioControls } from "../audio-controls";
import { usePhonemeDetailsContext } from "./phoneme-details-context";

export function PhonemeDetailsHeader() {
	const { phonemeId } = usePhonemeDetailsContext();

	const { ipa } = allPhonemeSymbols[phonemeId];
	const { label } = phonemeDetailsById[phonemeId];

	return (
		<div className="flex flex-col gap-1 bg-background-strong p-3 sm:p-4 rounded-xl shadow-sm">
			<div className="flex gap-6 items-center">
				<div className="flex items-center gap-2 font-bold">
					<span className="text-3xl text-muted-foreground/50">/</span>
					<span className="text-5xl leading-none tracking-tight">{ipa}</span>
					<span className="text-3xl text-muted-foreground/50">/</span>
				</div>
				<AudioControls
					size="xs"
					path={`/audio/phonemes/${phonemeId}.mp3`}
					label={`Play ${phonemeId}`}
				/>
			</div>
			<p className="text-xs text-muted-foreground/80">{label}</p>
		</div>
	);
}
