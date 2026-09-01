import { G2PInputForm } from "./_components/g2p-input-form";
import { TranscriptionDisplay } from "./_components/transcription-display";

export default function HomePage() {
	return (
		<div className="flex flex-1 flex-col">
			<div className="flex flex-1 flex-col items-center pt-[8vh]">
				<div className="w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
					<G2PInputForm />
				</div>

				<div className="w-full min-h-0">
					<TranscriptionDisplay targetAccent="en-us" />
				</div>
			</div>
		</div>
	);
}
