"use client";

import type { KeyboardEvent, RefObject } from "react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { VowelPhoneme } from "shared-data";
import { cn } from "@/lib/utils";
import type { DiphthongTrajectory } from "../_lib/diphthong-trajectories";
import { getDiphthongTrajectories } from "../_lib/diphthong-trajectories";
import {
	FRONTNESS_LABELS,
	FRONTNESS_ORDER,
	getCellKey,
	HEIGHT_LABELS,
	HEIGHT_ORDER,
} from "../_lib/vowel-grid";
import { useIpaChartStore } from "../_store/ipa-chart-store";

interface DiphthongChartProps {
	diphthongs: VowelPhoneme[];
}

export function DiphthongChart({ diphthongs }: DiphthongChartProps) {
	const selectPhoneme = useIpaChartStore((s) => s.selectPhoneme);
	const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);
	const gridRef = useRef<HTMLDivElement>(null);
	const cellPositions = useGridCellPositions(gridRef, [diphthongs]);
	const trajectories = useMemo(() => getDiphthongTrajectories(diphthongs), [diphthongs]);
	const drawableTrajectories = useMemo(
		() =>
			trajectories
				.map((trajectory) => prepareTrajectoryRenderData(trajectory, cellPositions))
				.filter((value): value is TrajectoryRenderData => value !== null),
		[trajectories, cellPositions],
	);

	return (
		<div className="overflow-x-auto">
			<div
				ref={gridRef}
				className="relative inline-grid w-full min-w-max gap-1.5 grid-cols-[auto_repeat(5,minmax(5rem,1fr))]"
			>
				<div />
				{FRONTNESS_ORDER.map((frontness) => (
					<div
						key={frontness}
						className="px-1.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
					>
						{FRONTNESS_LABELS[frontness]}
					</div>
				))}

				{HEIGHT_ORDER.map((height) => (
					<Fragment key={height}>
						<div className="flex items-center justify-end pr-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							{HEIGHT_LABELS[height]}
						</div>
						{FRONTNESS_ORDER.map((frontness) => {
							const cellKey = getCellKey(height, frontness);
							return (
								<div
									key={frontness}
									data-cell={cellKey}
									className={cn(
										"flex min-h-[4rem] flex-wrap items-center justify-center gap-1.5 rounded-md border border-border/60 bg-card/40 px-2 py-1.5",
										"opacity-45",
									)}
								/>
							);
						})}
					</Fragment>
				))}

				{drawableTrajectories.length > 0 && (
					<svg
						className="absolute inset-0 pointer-events-none"
						style={{ width: "100%", height: "100%" }}
						aria-label="Diphthong trajectories overlay"
					>
						<title>Diphthong Trajectories</title>
						{drawableTrajectories.map((trajectoryData) => {
							const {
								arrowPoints,
								controlOffsetX,
								controlOffsetY,
								diphthong,
								endPos,
								pathData,
								startPos,
							} = trajectoryData;
							const isHovered = hoveredSymbol === diphthong.symbol;

							const handleClick = () => selectPhoneme(diphthong);
							const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
								if (event.key === "Enter" || event.key === " ") {
									event.preventDefault();
									handleClick();
								}
							};

							return (
								// biome-ignore lint/a11y/useSemanticElements: SVG elements cannot be wrapped in button elements
								<g
									key={diphthong.symbol}
									className="trajectory-group cursor-pointer pointer-events-auto"
									onClick={handleClick}
									onKeyDown={handleKeyDown}
									onMouseEnter={() => setHoveredSymbol(diphthong.symbol)}
									onMouseLeave={() => setHoveredSymbol(null)}
									role="button"
									tabIndex={0}
									aria-label={`Diphthong ${diphthong.symbol}`}
								>
									{/* Invisible wider path for better click target */}
									<path
										d={pathData}
										fill="none"
										stroke="transparent"
										strokeWidth={16}
										className="pointer-events-auto"
									/>

									{/* Visible path */}
									<path
										d={pathData}
										fill="none"
										stroke="currentColor"
										strokeWidth={isHovered ? 3.5 : 3}
										className="stroke-primary transition-all pointer-events-none"
										opacity={isHovered ? 0.9 : 0.7}
									/>

									{/* Arrowhead */}
									<polygon
										points={arrowPoints}
										className="fill-primary transition-all pointer-events-none"
										opacity={isHovered ? 0.9 : 0.7}
									/>

									{/* Start point */}
									<circle
										cx={startPos.x}
										cy={startPos.y}
										r={isHovered ? 9 : 8}
										className="fill-primary transition-all pointer-events-none"
										opacity={isHovered ? 0.9 : 0.75}
									/>

									{/* Start phoneme label - positioned above the circle */}
									<text
										x={startPos.x}
										y={startPos.y - (isHovered ? 13 : 12)}
										textAnchor="middle"
										dominantBaseline="auto"
										className="fill-current font-bold pointer-events-none transition-all"
										fontSize={isHovered ? 16 : 15}
										opacity={isHovered ? 1 : 0.9}
									>
										{diphthong.symbol[0]}
									</text>

									{/* End point */}
									<circle
										cx={endPos.x}
										cy={endPos.y}
										r={isHovered ? 7 : 6}
										className="fill-primary transition-all pointer-events-none"
										opacity={isHovered ? 0.9 : 0.75}
									/>

									{/* End phoneme label - positioned below the circle */}
									<text
										x={endPos.x}
										y={endPos.y + (isHovered ? 18 : 17)}
										textAnchor="middle"
										dominantBaseline="hanging"
										className="fill-current font-bold pointer-events-none transition-all"
										fontSize={isHovered ? 14 : 13}
										opacity={isHovered ? 1 : 0.9}
									>
										{diphthong.symbol[1]}
									</text>

									{/* Diphthong symbol label */}
									<text
										x={startPos.x + controlOffsetX}
										y={startPos.y + controlOffsetY - 6}
										textAnchor="middle"
										className="fill-current font-semibold pointer-events-none transition-all"
										fontSize={20}
										opacity={isHovered ? 1 : 0.85}
									>
										{diphthong.symbol}
									</text>
								</g>
							);
						})}
					</svg>
				)}
			</div>
		</div>
	);
}

function useGridCellPositions(
	gridRef: RefObject<HTMLDivElement | null>,
	deps: ReadonlyArray<unknown> = [],
) {
	const [cellPositions, setCellPositions] = useState<Map<string, CellPosition>>(() => new Map());

	useEffect(() => {
		const element = gridRef.current;
		if (!element) {
			setCellPositions(new Map<string, CellPosition>());
			return;
		}

		let frameId: number | null = null;

		const measure = () => {
			const gridElement = gridRef.current;
			if (!gridElement) return;

			const positions = new Map<string, CellPosition>();
			const cells = gridElement.querySelectorAll("[data-cell]");
			const gridRect = gridElement.getBoundingClientRect();

			for (const cell of cells) {
				const elementCell = cell as HTMLElement;
				const key = elementCell.dataset.cell;
				if (!key) continue;

				const rect = elementCell.getBoundingClientRect();
				positions.set(key, {
					x: rect.left - gridRect.left + rect.width / 2,
					y: rect.top - gridRect.top + rect.height / 2,
				});
			}

			setCellPositions(positions);
		};

		const scheduleMeasure = () => {
			if (frameId !== null) {
				cancelAnimationFrame(frameId);
			}
			frameId = requestAnimationFrame(() => {
				frameId = null;
				measure();
			});
		};

		const runInitialMeasurement = () => {
			if (typeof document !== "undefined") {
				const { fonts } = document as Document & { fonts?: FontFaceSet };
				if (fonts?.ready) {
					void fonts.ready.then(scheduleMeasure).catch(() => scheduleMeasure());
					return;
				}
			}
			scheduleMeasure();
		};

		runInitialMeasurement();

		let resizeObserver: ResizeObserver | null = null;
		if (typeof ResizeObserver !== "undefined") {
			resizeObserver = new ResizeObserver(() => scheduleMeasure());
			resizeObserver.observe(element);
		} else if (typeof window !== "undefined") {
			window.addEventListener("resize", scheduleMeasure);
		}

		return () => {
			if (frameId !== null) {
				cancelAnimationFrame(frameId);
			}
			if (resizeObserver) {
				resizeObserver.disconnect();
			} else if (typeof window !== "undefined") {
				window.removeEventListener("resize", scheduleMeasure);
			}
		};
	}, [gridRef, ...deps]);

	return cellPositions;
}

interface CellPosition {
	x: number;
	y: number;
}

interface TrajectoryRenderData {
	diphthong: VowelPhoneme;
	startPos: CellPosition;
	endPos: CellPosition;
	controlOffsetX: number;
	controlOffsetY: number;
	pathData: string;
	arrowPoints: string;
}

function prepareTrajectoryRenderData(
	trajectory: DiphthongTrajectory,
	cellPositions: Map<string, CellPosition>,
): TrajectoryRenderData | null {
	const startKey = getCellKey(trajectory.start.height, trajectory.start.frontness);
	const endKey = getCellKey(trajectory.end.height, trajectory.end.frontness);

	const startPos = cellPositions.get(startKey);
	const endPos = cellPositions.get(endKey);

	if (!startPos || !endPos) {
		return null;
	}

	const dx = endPos.x - startPos.x;
	const dy = endPos.y - startPos.y;
	const distance = Math.hypot(dx, dy);

	const controlOffsetX = dx * 0.5;
	const controlOffsetY = dy * 0.5 + Math.min(distance * 0.15, 20);

	const pathData = `M ${startPos.x} ${startPos.y} Q ${startPos.x + controlOffsetX} ${startPos.y + controlOffsetY} ${endPos.x} ${endPos.y}`;

	const angle = Math.atan2(dy, dx);
	const arrowLength = 8;
	const arrowWidth = 5;
	const arrowPoints = `
		${endPos.x},${endPos.y}
		${endPos.x - arrowLength * Math.cos(angle - Math.PI / 6) - arrowWidth * Math.sin(angle - Math.PI / 6)},${endPos.y - arrowLength * Math.sin(angle - Math.PI / 6) + arrowWidth * Math.cos(angle - Math.PI / 6)}
		${endPos.x - arrowLength * Math.cos(angle + Math.PI / 6) + arrowWidth * Math.sin(angle + Math.PI / 6)},${endPos.y - arrowLength * Math.sin(angle + Math.PI / 6) - arrowWidth * Math.cos(angle + Math.PI / 6)}
	`;

	return {
		diphthong: trajectory.diphthong,
		startPos,
		endPos,
		controlOffsetX,
		controlOffsetY,
		pathData,
		arrowPoints,
	};
}
