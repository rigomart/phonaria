import { Logo } from "@/components/logo";
import { G2PInputForm } from "./_components/g2p-input-form";
import { TranscriptionDisplay } from "./_components/transcription-display";

export default function HomePage() {
	return (
		<div className="flex flex-1 flex-col">
			<a
				href="/"
				className="absolute top-3 left-4 z-10 text-foreground hover:text-primary transition-colors animate-in fade-in duration-500"
				aria-label="Phonaria Lab"
			>
				<Logo className="size-6" />
			</a>

			<div className="flex flex-1 flex-col items-center justify-center pb-[10vh]">
				<div className="w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
					<G2PInputForm />
				</div>

				<div className="w-full min-h-0 mt-2">
					<TranscriptionDisplay />
				</div>
			</div>
		</div>
	);
}
