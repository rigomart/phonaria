import "./index.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function App() {
	return (
		<div className="min-h-svh bg-background text-foreground">
			<header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
					<h1 className="text-lg font-semibold tracking-tight">Phonix</h1>
					<nav className="text-sm text-muted-foreground">Interactive IPA</nav>
				</div>
			</header>
			<main className="mx-auto max-w-5xl px-4 py-6">
				<Tabs defaultValue="consonants">
					<TabsList>
						<TabsTrigger value="consonants">Consonants</TabsTrigger>
						<TabsTrigger value="vowels">Vowels</TabsTrigger>
					</TabsList>
					<TabsContent value="consonants">
						{/* TODO: ConsonantChart goes here */}
						<p className="text-sm text-muted-foreground">Consonant chart will render here.</p>
					</TabsContent>
					<TabsContent value="vowels">
						{/* TODO: VowelChart goes here */}
						<p className="text-sm text-muted-foreground">Vowel chart will render here.</p>
					</TabsContent>
				</Tabs>
			</main>
		</div>
	);
}

export default App;
