import { G2PInputForm } from "./_components/g2p-input-form";
import { TranscriptionDisplay } from "./_components/transcription-display";

export default function HomePage() {
	return (
		<div className="flex flex-1 flex-col">
			<div className="border-b px-4 py-4 flex justify-center">
				<div className="w-full max-w-2xl">
					<G2PInputForm />
				</div>
			</div>
			<div className="flex flex-1 min-h-0">
				<TranscriptionDisplay />
			</div>
		</div>
	);
}
