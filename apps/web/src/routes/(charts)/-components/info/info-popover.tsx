import type {
	ArticulationMannerInfo,
	ArticulationPlaceInfo,
	VowelFrontnessInfo,
	VowelHeightInfo,
} from "shared-data";
import {
	articulationManners,
	articulationPlaces,
	vowelFrontnesses,
	vowelHeights,
} from "shared-data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface InfoPopoverProps {
	type: "place" | "manner" | "height" | "frontness";
	id: string;
	children: React.ReactNode;
}

function findInfo(
	type: "place" | "manner" | "height" | "frontness",
	id: string,
):
	| ArticulationPlaceInfo
	| ArticulationMannerInfo
	| VowelHeightInfo
	| VowelFrontnessInfo
	| undefined {
	switch (type) {
		case "place":
			return articulationPlaces.find((p) => p.key === id);
		case "manner":
			return articulationManners.find((m) => m.key === id);
		case "height":
			return vowelHeights.find((h) => h.key === id);
		case "frontness":
			return vowelFrontnesses.find((f) => f.key === id);
		default:
			return undefined;
	}
}

export function InfoPopover({ type, id, children }: InfoPopoverProps) {
	const info = findInfo(type, id);
	if (!info) return <>{children}</>;

	// Determine tooltip side based on type
	let side: "top" | "right" | "bottom" | "left" = "top";
	if (type === "manner" || type === "height") {
		side = "right";
	}

	return (
		<Tooltip delayDuration={150}>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent side={side} align="center" className="max-w-xs text-xs leading-snug">
				<div className="space-y-1">
					<div className="font-medium text-[11px] uppercase tracking-wide text-muted-foreground">
						{type.charAt(0).toUpperCase() + type.slice(1)}
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
