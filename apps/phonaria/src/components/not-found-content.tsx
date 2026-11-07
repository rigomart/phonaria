import { buttonVariants } from "@phonaria/ui/components/button";
import { Home } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@/components/link";

/**
 * A page that stands in for one that can't be shown: a short label, a
 * heading, a line on why, and the ways out. The not-found and error pages
 * share it, inside the app's header and footer.
 */
export function StatusPage({
	label,
	title,
	description,
	children,
}: {
	label: string;
	title: string;
	description: string;
	/** The ways out, under the description. */
	children: ReactNode;
}) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center bg-background p-4 sm:p-6">
			<div className="w-full max-w-md flex flex-col items-center gap-4 text-center">
				<p className="text-sm text-muted-foreground font-display enter-rise">{label}</p>
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display enter-rise enter-delay-40">
					{title}
				</h1>
				<p className="text-sm text-muted-foreground text-pretty enter-rise enter-delay-80">
					{description}
				</p>
				<div className="mt-2 flex flex-wrap items-center justify-center gap-3 enter-rise enter-delay-120">
					{children}
				</div>
			</div>
		</div>
	);
}

/** The way home from a status page: a link styled as a button, since a Button rendering a link is announced as a button. */
export function BackHomeLink() {
	return (
		<Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
			<Home />
			Back to Phonaria
		</Link>
	);
}

/**
 * Shared 404 body. Serves both unknown URLs and the flag gate's not-found
 * outcome, so the copy stays neutral — a gated route must not read as
 * "coming soon".
 */
export function NotFoundContent() {
	return (
		<StatusPage
			label="404"
			title="This page doesn't exist"
			description="The address may have a typo, or the page may have moved."
		>
			<BackHomeLink />
		</StatusPage>
	);
}
