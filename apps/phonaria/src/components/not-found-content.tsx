import { buttonVariants } from "@phonaria/ui/components/button";
import { Home } from "lucide-react";
import { Link } from "@/components/link";

/**
 * Shared 404 body. Serves both unknown URLs and the flag gate's not-found
 * outcome, so the copy stays neutral — a gated route must not read as
 * "coming soon".
 */
export function NotFoundContent() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center bg-background p-4 sm:p-6">
			<div className="w-full max-w-md flex flex-col items-center gap-4 text-center">
				<p className="text-sm text-muted-foreground font-display enter-rise">404</p>
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display enter-rise enter-delay-40">
					This page doesn't exist
				</h1>
				<p className="text-sm text-muted-foreground text-pretty enter-rise enter-delay-80">
					The address may have a typo, or the page may have moved.
				</p>
				{/* A link styled as a button: a Button rendering a link is announced as a button. */}
				<Link
					href="/"
					className={buttonVariants({
						variant: "outline",
						size: "lg",
						className: "mt-2 enter-rise enter-delay-120",
					})}
				>
					<Home />
					Back to Phonaria
				</Link>
			</div>
		</div>
	);
}
