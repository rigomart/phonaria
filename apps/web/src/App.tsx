import "./index.css";
import { ConsonantChart } from "@/components/chart/ConsonantChart";
import { VowelChart } from "@/components/chart/VowelChart";
import { ThemeProvider } from "@/components/theme-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModeToggle } from "./components/mode-toggle";

function App() {
	return (
		<ThemeProvider defaultTheme="system" storageKey="phonix-ui-theme">
			<div className="min-h-svh bg-background text-foreground">
				<header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
					<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
						<h1 className="text-lg font-semibold tracking-tight">Phonix</h1>
						<nav className="flex items-center gap-3 text-sm text-muted-foreground">
							<span className="hidden sm:inline">Interactive IPA</span>
							<ModeToggle />
						</nav>
					</div>
				</header>
				<main className="mx-auto max-w-5xl px-4 py-6">
					<Tabs defaultValue="consonants">
						<TabsList>
							<TabsTrigger value="consonants">Consonants</TabsTrigger>
							<TabsTrigger value="vowels">Vowels</TabsTrigger>
						</TabsList>
						<TabsContent value="consonants">
							<ConsonantChart />
						</TabsContent>
						<TabsContent value="vowels">
							<VowelChart />
						</TabsContent>
					</Tabs>
				</main>
			</div>
		</ThemeProvider>
	);
}

export default App;
