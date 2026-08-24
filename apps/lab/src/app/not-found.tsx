import { Button } from "@phonaria/ui/components/button";
import { Home } from "lucide-react";
import Link from "next/link";

/**
 * Serves both unknown URLs and the flag gate's notFound(), so the copy stays
 * neutral — a gated route must not read as "coming soon".
 */
export default function NotFound() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center bg-background p-4 sm:p-6">
			<div className="w-full max-w-md flex flex-col items-center gap-4 text-center">
				<p className="text-sm text-muted-foreground font-display">404</p>
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
					This page doesn't exist
				</h1>
				<p className="text-sm text-muted-foreground text-pretty">
					The address may have a typo, or the page may have moved.
				</p>
				<Button variant="outline" size="lg" className="mt-2" render={<Link href="/" />}>
					<Home />
					Back to Phonaria
				</Button>
			</div>
		</div>
	);
}
