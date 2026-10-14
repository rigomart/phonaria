import { ChevronRight, ChevronUp } from "lucide-react";
import type { Ref } from "react";
import { cn } from "@/lib/utils";
import type { DetailSection } from "./sections";

/**
 * Opens the full details. Its second line names the sections behind it, so the
 * learner knows whether expanding is worth it; the list comes from the same
 * `getDetailSections` call as the full view, so it never promises more.
 */
export function MoreButton({
	ref,
	ipa,
	sections,
	direction,
	onClick,
	className,
}: {
	ref?: Ref<HTMLButtonElement>;
	ipa: string;
	sections: readonly DetailSection[];
	/** Where the full view appears: up (the drawer grows) or to the right (a side panel). */
	direction: "up" | "right";
	onClick: () => void;
	className?: string;
}) {
	const Icon = direction === "up" ? ChevronUp : ChevronRight;
	return (
		<button
			ref={ref}
			type="button"
			aria-haspopup={direction === "right" ? "dialog" : undefined}
			aria-expanded={false}
			onClick={onClick}
			className={cn(
				"group/more flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-2xl bg-background px-4 py-3 text-left outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
				className,
			)}
		>
			<span className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span className="text-sm font-medium">More about /{ipa}/</span>
				<span className="text-xs text-muted-foreground">
					{sections.map((section) => section.title).join(" · ")}
				</span>
			</span>
			<Icon
				aria-hidden="true"
				className={cn(
					"size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
					direction === "up"
						? "group-hover/more:-translate-y-0.5"
						: "group-hover/more:translate-x-0.5",
				)}
			/>
		</button>
	);
}
