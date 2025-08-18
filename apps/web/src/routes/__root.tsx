import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

// Create a client for TanStack Query
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
		},
		mutations: {
			retry: 1,
		},
	},
});

export const Route = createRootRoute({
	component: () => (
		<>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider defaultTheme="system" storageKey="phonix-ui-theme">
					<div className="min-h-svh bg-background text-foreground">
						<header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
							<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
								<h1 className="text-lg font-semibold tracking-tight">Phonix</h1>
								<nav className="flex items-center gap-4 text-sm">
									<Link
										to="/"
										className="text-muted-foreground transition-colors hover:text-foreground"
										activeProps={{ className: "text-foreground font-medium" }}
									>
										Home
									</Link>
									<Link
										to="/ipa-chart"
										className="text-muted-foreground transition-colors hover:text-foreground"
										activeProps={{ className: "text-foreground font-medium" }}
									>
										IPA Chart
									</Link>
									<ModeToggle />
								</nav>
							</div>
						</header>

						<Outlet />
					</div>
					<Toaster />
				</ThemeProvider>
				<TanStackRouterDevtools />
			</QueryClientProvider>
		</>
	),
});
