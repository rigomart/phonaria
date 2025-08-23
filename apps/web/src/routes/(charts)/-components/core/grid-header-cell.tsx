import * as React from "react";
import { getArticulationInfo } from "@/lib/grid-config";
import { InfoPopover } from "@/routes/(charts)/-components/info/info-popover";

interface GridHeaderCellProps {
	label: string;
	className?: string;
}

export const GridHeaderCell: React.FC<GridHeaderCellProps> = React.memo(function GridHeaderCell({
	label,
	className = "",
}) {
	const articulationInfo = getArticulationInfo(label);

	const buttonElement = (
		<button
			type="button"
			className={`capitalize underline decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm ${className}`}
		>
			{label}
		</button>
	);

	if (articulationInfo) {
		return (
			<InfoPopover
				category={articulationInfo.category}
				label={articulationInfo.label}
				short={articulationInfo.short}
				airflow={articulationInfo.airflow}
				side={articulationInfo.tooltipSide}
			>
				{buttonElement}
			</InfoPopover>
		);
	}

	return buttonElement;
});
