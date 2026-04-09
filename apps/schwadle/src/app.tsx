import { BrowserRouter, Route, Routes } from "react-router";
import { AppLayout } from "@/components/app-layout";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";
import { AboutPage } from "@/screens/about-page";
import { GamePage } from "@/screens/game-page";

export function App() {
	return (
		<BrowserRouter>
			<AudioManagerProvider>
				<Routes>
					<Route element={<AppLayout />}>
						<Route index element={<GamePage />} />
						<Route path="about" element={<AboutPage />} />
					</Route>
				</Routes>
			</AudioManagerProvider>
		</BrowserRouter>
	);
}
