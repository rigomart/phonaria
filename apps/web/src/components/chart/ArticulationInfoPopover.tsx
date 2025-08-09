import type { ArticulationMannerInfo, ArticulationPlaceInfo } from "shared-data";
import { articulationManners, articulationPlaces } from "shared-data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ArticulationInfoPopoverProps {
	type: "place" | "manner";
	id: string;
	children: React.ReactNode;
}

function findInfo(
	type: "place" | "manner",
	id: string,
): ArticulationPlaceInfo | ArticulationMannerInfo | undefined {
	return type === "place"
		? articulationPlaces.find((p) => p.key === id)
		: articulationManners.find((m) => m.key === id);
}

export function ArticulationInfoPopover({ type, id, children }: ArticulationInfoPopoverProps) {
	const info = findInfo(type, id);
	if (!info) return <>{children}</>;
	return (
		<Tooltip delayDuration={150}>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent
				side={type === "place" ? "top" : "right"}
				align="center"
				className="max-w-xs text-xs leading-snug"
			>
				<div className="space-y-1">
					<div className="font-medium text-[11px] uppercase tracking-wide text-muted-foreground">
						{type === "place" ? "Place" : "Manner"}
					</div>
					<div className="font-semibold text-sm">{info.label}</div>
					<p className="text-muted-foreground">{info.short}</p>
					{"airflow" in info && (info as ArticulationMannerInfo).airflow ? (
						<p className="text-[11px] text-muted-foreground/80">
							Airflow: {(info as ArticulationMannerInfo).airflow}
						</p>
					) : null}
				</div>
			</TooltipContent>
		</Tooltip>
	);
}
