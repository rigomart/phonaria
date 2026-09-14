"use client";

import type { VowelArticulatoryFeatures } from "@phonaria/phonetics-data";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
	type ChartPoint,
	getBacknessPosition,
	getHeightPosition,
	getLeftBoundaryX,
	LARGE_VOWEL_CHART_LAYOUT,
	VOWEL_BACKNESS_ORDER,
	VOWEL_HEIGHT_ORDER,
	type VowelChartLayout,
} from "@/lib/vowel-chart-geometry";

export const vowelChartLayout = LARGE_VOWEL_CHART_LAYOUT;
const aspectRatio = `${vowelChartLayout.viewBoxWidth} / ${vowelChartLayout.viewBoxHeight}`;

const BACKNESS_LABELS: Record<VowelArticulatoryFeatures["backness"], string> = {
	front: "Front",
	"near-front": "Near-front",
	central: "Central",
	"near-back": "Near-back",
	back: "Back",
};

const HEIGHT_LABELS: Record<VowelArticulatoryFeatures["height"], string> = {
	close: "Close",
	"near-close": "Near-close",
	"close-mid": "Close-mid",
	mid: "Mid",
	"open-mid": "Open-mid",
	"near-open": "Near-open",
	open: "Open",
};

type VowelChartSurfaceProps = {
	overlay: ReactNode;
	svgOverlay?: ReactNode;
	arrowMarkerId?: string;
};

export function VowelChartSurface({ overlay, svgOverlay, arrowMarkerId }: VowelChartSurfaceProps) {
	return (
		<div className="relative w-full" style={{ aspectRatio }}>
			<svg
				viewBox={`0 0 ${vowelChartLayout.viewBoxWidth} ${vowelChartLayout.viewBoxHeight}`}
				className="h-full w-full"
				aria-hidden
			>
				<title>Vowel chart grid</title>
				{arrowMarkerId && (
					<defs>
						<marker
							id={arrowMarkerId}
							viewBox="0 0 10 10"
							refX="5"
							refY="5"
							markerWidth="5"
							markerHeight="5"
							orient="auto-start-reverse"
						>
							<path d="M 0 0 L 10 5 L 0 10 z" className="fill-primary" fillOpacity={0.8} />
						</marker>
					</defs>
				)}
				<VowelGrid />
				{svgOverlay}
			</svg>
			<div className="absolute inset-0">{overlay}</div>
		</div>
	);
}

function VowelGrid() {
	const topHeight = VOWEL_HEIGHT_ORDER[0];
	const bottomHeight = VOWEL_HEIGHT_ORDER[VOWEL_HEIGHT_ORDER.length - 1];

	return (
		<>
			<polygon
				points={[
					`${getLeftBoundaryX(topHeight, vowelChartLayout)},${getHeightPosition(topHeight, vowelChartLayout)}`,
					`${getLeftBoundaryX(bottomHeight, vowelChartLayout)},${getHeightPosition(bottomHeight, vowelChartLayout)}`,
					`${vowelChartLayout.backX},${getHeightPosition(bottomHeight, vowelChartLayout)}`,
					`${vowelChartLayout.backX},${getHeightPosition(topHeight, vowelChartLayout)}`,
				].join(" ")}
				className="fill-muted stroke-border"
				strokeWidth={1.2}
			/>
			{VOWEL_BACKNESS_ORDER.map((backness) => (
				<BacknessColumn key={backness} backness={backness} />
			))}
			{VOWEL_HEIGHT_ORDER.map((height) => (
				<line
					key={height}
					x1={getBacknessPosition("front", height, vowelChartLayout)}
					x2={vowelChartLayout.backX}
					y1={getHeightPosition(height, vowelChartLayout)}
					y2={getHeightPosition(height, vowelChartLayout)}
					className={cn(
						"stroke-border",
						height === "close" || height === "open" ? "stroke-2" : "stroke-[1px]",
					)}
					strokeDasharray={height.includes("near") ? "4 4" : undefined}
				/>
			))}
			<AxisLabels />
		</>
	);
}

function BacknessColumn({ backness }: { backness: VowelArticulatoryFeatures["backness"] }) {
	const points = VOWEL_HEIGHT_ORDER.map((height) => ({
		x: getBacknessPosition(backness, height, vowelChartLayout),
		y: getHeightPosition(height, vowelChartLayout),
	}));

	const d = points
		.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
		.join(" ");

	return (
		<path
			d={d}
			className={cn(
				"stroke-border",
				backness === "front" || backness === "back" ? "stroke-2" : "stroke-[1px]",
			)}
			fill="none"
			strokeDasharray={backness === "near-front" || backness === "near-back" ? "4 4" : undefined}
		/>
	);
}

function AxisLabels() {
	const topLabelY = vowelChartLayout.chartTop - 10;
	const rowLabelOffset = 14;

	return (
		<>
			{VOWEL_BACKNESS_ORDER.map((backness, index) => (
				<text
					key={backness}
					x={getBacknessPosition(backness, VOWEL_HEIGHT_ORDER[0], vowelChartLayout)}
					y={topLabelY}
					className="fill-muted-foreground uppercase text-[9px] sm:text-[6px] odd:hidden sm:odd:block"
					fontWeight={600}
					textAnchor={
						index === 0 ? "start" : index === VOWEL_BACKNESS_ORDER.length - 1 ? "end" : "middle"
					}
				>
					{BACKNESS_LABELS[backness]}
				</text>
			))}
			{VOWEL_HEIGHT_ORDER.map((height) => (
				<text
					key={height}
					x={getLeftBoundaryX(height, vowelChartLayout) - rowLabelOffset}
					y={getHeightPosition(height, vowelChartLayout) + 3}
					className="fill-muted-foreground uppercase text-[9px] sm:text-[6px]"
					fontWeight={600}
					textAnchor="end"
				>
					{HEIGHT_LABELS[height]}
				</text>
			))}
		</>
	);
}

export const vowelMarkerButtonBaseClass =
	"absolute grid place-items-center border text-sm sm:text-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function getMarkerPercentPosition(
	point: ChartPoint,
	layout: VowelChartLayout = vowelChartLayout,
) {
	return {
		leftPercent: (point.x / layout.viewBoxWidth) * 100,
		topPercent: (point.y / layout.viewBoxHeight) * 100,
	};
}
