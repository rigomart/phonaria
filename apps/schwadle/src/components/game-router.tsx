import { MenuScreen } from "@/screens/menu-screen";
import { PlayingScreen } from "@/screens/playing-screen";
import { ResultsScreen } from "@/screens/results-screen";
import { useGameStore } from "@/store/game-store";

export function GameRouter() {
	const phase = useGameStore((s) => s.phase);

	switch (phase) {
		case "menu":
			return <MenuScreen />;
		case "playing":
			return <PlayingScreen />;
		case "results":
			return <ResultsScreen />;
	}
}
