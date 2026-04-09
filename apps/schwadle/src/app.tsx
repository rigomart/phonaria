import { GameRouter } from "@/components/game-router";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";

export function App() {
	return (
		<AudioManagerProvider>
			<div className="mx-auto flex min-h-screen max-w-lg flex-col bg-background text-foreground">
				<GameRouter />
			</div>
		</AudioManagerProvider>
	);
}
