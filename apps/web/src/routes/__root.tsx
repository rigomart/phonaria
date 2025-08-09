import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";

export const Route = createRootRoute({
	component: () => (
		<>
			<ThemeProvider defaultTheme="system" storageKey="phonix-ui-theme">
				<div className="min-h-svh bg-background text-foreground">
					<header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
						<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
							<h1 className="text-lg font-semibold tracking-tight">Phonix</h1>
							<nav className="flex items-center gap-3 text-sm text-muted-foreground">
								<Link
									to="/ipa-chart"
									search={{ set: "consonants" }}
									className="hidden sm:inline transition-colors hover:text-foreground"
								>
									IPA
								</Link>
								<Link
									to="/ipa-chart"
									search={{ set: "vowels" }}
									className="hidden md:inline transition-colors hover:text-foreground"
								>
									Vowels
								</Link>
								<ModeToggle />
							</nav>
						</div>
					</header>

					<Outlet />
				</div>
			</ThemeProvider>
			<TanStackRouterDevtools />
		</>
	),
});
