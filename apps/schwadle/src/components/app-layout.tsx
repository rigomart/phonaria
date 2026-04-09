import { Link, Outlet, useLocation } from "react-router";
import { SchwaLogo } from "@/components/schwa-logo";
import { cn } from "@/lib/utils";

export function AppLayout() {
	const { pathname } = useLocation();
	const isAbout = pathname === "/about";

	return (
		<div className="mx-auto flex min-h-screen max-w-lg flex-col bg-background text-foreground">
			{/* Header */}
			<header className="flex items-center justify-between border-b px-4 py-2.5">
				<Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
					<SchwaLogo className="size-7 text-xl" />
					<span className="text-sm font-semibold">Schwadle</span>
				</Link>
				<nav className="flex gap-1">
					<Link
						to="/"
						className={cn(
							"rounded-md px-3 py-1.5 text-sm transition-colors",
							!isAbout
								? "bg-muted font-medium text-foreground"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						Play
					</Link>
					<Link
						to="/about"
						className={cn(
							"rounded-md px-3 py-1.5 text-sm transition-colors",
							isAbout
								? "bg-muted font-medium text-foreground"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						About
					</Link>
				</nav>
			</header>

			{/* Page content */}
			<main className="flex flex-1 flex-col">
				<Outlet />
			</main>
		</div>
	);
}
