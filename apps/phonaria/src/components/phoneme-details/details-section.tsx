import { type ReactNode, useId } from "react";
import { cn } from "@/lib/utils";

/**
 * One titled block of the full details. Sections are separated by space, not
 * lines; `action` sits opposite the title for a link or a "show all" toggle.
 */
export function DetailsSection({
	title,
	action,
	children,
}: {
	title: string;
	action?: ReactNode;
	children: ReactNode;
}) {
	const headingId = useId();

	return (
		<section aria-labelledby={headingId} className="flex flex-col gap-2">
			<div className="flex min-h-6 items-center justify-between gap-2">
				<h3 id={headingId} className="text-sm font-semibold text-foreground">
					{title}
				</h3>
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
