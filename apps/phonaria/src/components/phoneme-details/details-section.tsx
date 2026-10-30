import { ArrowRight } from "lucide-react";
import { type ReactNode, useId } from "react";
import { Link } from "@/components/link";
import { cn } from "@/lib/utils";

/**
 * Where the full details render: in a drawer or panel under the sound's h2,
 * or on a page of their own under its h1.
 */
export type DetailsLayout = "drawer" | "page";

/**
 * One titled block of the full details. Sections are separated by space, not
 * lines; `action` sits opposite the title for a link or a "show all" toggle.
 */
export function DetailsSection({
	title,
	action,
	layout = "drawer",
	children,
}: {
	title: string;
	action?: ReactNode;
	layout?: DetailsLayout;
	children: ReactNode;
}) {
	const headingId = useId();
	const Heading = layout === "page" ? "h2" : "h3";

	return (
		<section aria-labelledby={headingId} className="flex flex-col gap-2">
			<div className="flex min-h-6 items-center justify-between gap-2">
				<Heading
					id={headingId}
					className={
						layout === "page"
							? "font-display text-lg font-semibold text-foreground"
							: "text-sm font-semibold text-foreground"
					}
				>
					{title}
				</Heading>
				{action}
			</div>
			{children}
		</section>
	);
}

/** The rounded soft surface every section's content sits on. */
export function DetailsCard({ className, children }: { className?: string; children: ReactNode }) {
	return <div className={cn("rounded-2xl bg-background p-4", className)}>{children}</div>;
}

/** A small text link to a fuller page, set apart from the details' own buttons. */
export function DetailsLink({ href, children }: { href: string; children: ReactNode }) {
	return (
		<Link
			href={href}
			className="group/details-link inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-sm text-xs font-medium text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
		>
			{children}
			<ArrowRight
				aria-hidden="true"
				className="size-3 transition-transform group-hover/details-link:translate-x-0.5 motion-reduce:transition-none"
			/>
		</Link>
	);
}
