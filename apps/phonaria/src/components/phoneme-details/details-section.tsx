import { type ReactNode, useId } from "react";

/**
 * One titled block of the details. Sections are separated by space, not
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
