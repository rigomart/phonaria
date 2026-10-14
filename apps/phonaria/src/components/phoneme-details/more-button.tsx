import { ChevronRight, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Opens the full details. One quiet line, so the compact level keeps its room
 * for the sound itself; on phones, dragging the drawer up does the same.
 */
export function MoreButton({
	ipa,
	direction,
	onClick,
}: {
	ipa: string;
	/** Where the full view appears: up (the drawer grows) or to the right (a side panel). */
	direction: "up" | "right";
	onClick: () => void;
}) {
	const Icon = direction === "up" ? ChevronUp : ChevronRight;
	return (
		<button
			type="button"
			aria-haspopup={direction === "right" ? "dialog" : undefined}
			aria-expanded={false}
			onClick={onClick}
			className="group/more -mx-3 flex min-h-11 cursor-pointer items-center gap-1.5 self-start rounded-full px-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
		>
			More about /{ipa}/
			<Icon
				aria-hidden="true"
				className={cn(
					"size-4 shrink-0 transition-transform motion-reduce:transition-none",
					direction === "up"
						? "group-hover/more:-translate-y-0.5"
						: "group-hover/more:translate-x-0.5",
				)}
			/>
		</button>
	);
}
