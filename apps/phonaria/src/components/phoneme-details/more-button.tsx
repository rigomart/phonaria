import { Button } from "@phonaria/ui/components/button";
import { ChevronUp, PanelRightOpen } from "lucide-react";

/**
 * Opens the full details, as an icon beside the corner controls so the compact
 * level keeps its room for the sound itself. On phones the drawer also grows
 * when dragged up.
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
	const Icon = direction === "up" ? ChevronUp : PanelRightOpen;
	const label = `More about /${ipa}/`;
	return (
		<Button
			variant="secondary"
			size="icon"
			aria-label={label}
			title={label}
			aria-haspopup={direction === "right" ? "dialog" : undefined}
			aria-expanded={false}
			onClick={onClick}
			className="size-11 shrink-0"
		>
			<Icon aria-hidden="true" />
		</Button>
	);
}
