import { Link, Outlet, useLocation } from "react-router";
import { cn } from "@/lib/utils";

export function AppLayout() {
	const { pathname } = useLocation();
	const isAbout = pathname === "/about";

	return (
		<div className="mx-auto flex min-h-screen max-w-lg flex-col bg-background text-foreground">
			<main className="flex flex-1 flex-col">
				<Outlet />
			</main>

			<footer className="flex items-center justify-center gap-3 px-4 py-4">
				<Link
					to="/"
					className={cn(
						"text-xs transition-colors",
						!isAbout
							? "text-muted-foreground/60"
							: "text-muted-foreground/40 hover:text-muted-foreground/60",
					)}
				>
					Play
				</Link>
				<span className="text-muted-foreground/20">·</span>
				<Link
					to="/about"
					className={cn(
						"text-xs transition-colors",
						isAbout
							? "text-muted-foreground/60"
							: "text-muted-foreground/40 hover:text-muted-foreground/60",
					)}
				>
					About
				</Link>
			</footer>
		</div>
	);
}
