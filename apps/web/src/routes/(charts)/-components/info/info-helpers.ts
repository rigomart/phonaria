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

export type ArticulationInfo =
	| ArticulationPlaceInfo
	| ArticulationMannerInfo
	| VowelHeightInfo
	| VowelFrontnessInfo;

export type InfoType = "place" | "manner" | "height" | "frontness";

export function getArticulationInfo(type: InfoType, id: string): ArticulationInfo | undefined {
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

export function getCategoryLabel(type: InfoType): string {
	return type.charAt(0).toUpperCase() + type.slice(1);
}

export function getTooltipSide(type: InfoType): "top" | "right" | "bottom" | "left" {
	// Use right side for manner and height to avoid overlapping with grid headers
	if (type === "manner" || type === "height") {
		return "right";
	}
	return "top";
}
