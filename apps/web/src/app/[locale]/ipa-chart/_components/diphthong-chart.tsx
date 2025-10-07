"use client";

import type { KeyboardEvent, RefObject } from "react";
import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
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
	const selectedPhoneme = useIpaChartStore((s) => s.selectedPhoneme);
	const dialogOpen = useIpaChartStore((s) => s.dialogOpen);
	const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);
	const [focusedSymbol, setFocusedSymbol] = useState<string | null>(null);
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
	const legendDescriptionId = useId();
	const svgDescriptionId = useId();

	return (
		<div className="space-y-4">
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
						role="presentation"
						aria-describedby={`${legendDescriptionId} ${svgDescriptionId}`}
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
							const isHighlighted =
								hoveredSymbol === diphthong.symbol || focusedSymbol === diphthong.symbol;
							const isSelected = selectedPhoneme?.symbol === diphthong.symbol;

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
									onPointerEnter={() => setHoveredSymbol(diphthong.symbol)}
									onPointerLeave={() =>
										setHoveredSymbol((current) =>
											current === diphthong.symbol ? null : current,
										)
									}
									onFocus={() => setFocusedSymbol(diphthong.symbol)}
									onBlur={() =>
										setFocusedSymbol((current) => (current === diphthong.symbol ? null : current))
									}
									role="button"
									tabIndex={0}
									aria-label={`Diphthong ${diphthong.symbol}. Starts at ${diphthong.symbol[0]}, transitions to ${diphthong.symbol[1]}`}
									aria-haspopup="dialog"
									aria-expanded={dialogOpen && isSelected}
									aria-pressed={isSelected}
									data-state={isSelected ? "selected" : undefined}
								>
									<path
										d={pathData}
										fill="none"
										stroke="transparent"
										strokeWidth={16}
										className="pointer-events-auto"
									/>

									<path
										d={pathData}
										fill="none"
										stroke="currentColor"
										strokeWidth={isHighlighted || isSelected ? 3.75 : 3}
										className={cn(
											"stroke-primary transition-all pointer-events-none",
											isSelected && "brightness-[1.15]",
										)}
										opacity={isHighlighted || isSelected ? 0.95 : 0.7}
									/>

									<polygon
										points={arrowPoints}
										className="fill-primary transition-all pointer-events-none"
										opacity={isHighlighted || isSelected ? 0.95 : 0.7}
									/>

									<circle
										cx={startPos.x}
										cy={startPos.y}
										r={isHighlighted || isSelected ? 9.5 : 8}
										className="fill-primary transition-all pointer-events-none"
										opacity={isHighlighted || isSelected ? 0.95 : 0.75}
									/>

									<text
										x={startPos.x}
										y={startPos.y - (isHighlighted || isSelected ? 14 : 12)}
										textAnchor="middle"
										dominantBaseline="auto"
										className="fill-current font-bold pointer-events-none transition-all"
										fontSize={isHighlighted || isSelected ? 16 : 15}
										opacity={isHighlighted || isSelected ? 1 : 0.9}
									>
										{diphthong.symbol[0]}
									</text>

									<circle
										cx={endPos.x}
										cy={endPos.y}
										r={isHighlighted || isSelected ? 7.5 : 6}
										className="fill-primary transition-all pointer-events-none"
										opacity={isHighlighted || isSelected ? 0.95 : 0.75}
									/>

									<text
										x={endPos.x}
										y={endPos.y + (isHighlighted || isSelected ? 19 : 17)}
										textAnchor="middle"
										dominantBaseline="hanging"
										className="fill-current font-bold pointer-events-none transition-all"
										fontSize={isHighlighted || isSelected ? 14.5 : 13}
										opacity={isHighlighted || isSelected ? 1 : 0.9}
									>
										{diphthong.symbol[1]}
									</text>

									<text
										x={startPos.x + controlOffsetX}
										y={startPos.y + controlOffsetY - 6}
										textAnchor="middle"
										className={cn(
											"fill-current font-semibold pointer-events-none transition-all",
											isSelected && "font-bold",
										)}
										fontSize={isHighlighted || isSelected ? 21 : 20}
										opacity={isHighlighted || isSelected ? 1 : 0.85}
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
		<TrajectoryLegend id={legendDescriptionId} />
		<p id={svgDescriptionId} className="sr-only">
			Each glide shows a filled circle for the starting vowel and a smaller filled circle where the
			tongue finishes.
		</p>
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

interface TrajectoryLegendProps {
	id: string;
}

function TrajectoryLegend({ id }: TrajectoryLegendProps) {
	return (
		<div
			id={id}
			className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground"
		>
			<div className="flex items-center gap-1.5" aria-hidden="true">
				<span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
				<span className="font-medium text-foreground">Start vowel</span>
			</div>
			<div className="flex items-center gap-1.5" aria-hidden="true">
				<span className="inline-flex h-[3px] w-9 rounded-full bg-primary/80" />
				<span className="font-medium text-foreground">Glide path</span>
			</div>
			<div className="flex items-center gap-1.5" aria-hidden="true">
				<span className="inline-flex h-2 w-2 rounded-full border border-primary bg-primary/70" />
				<span className="font-medium text-foreground">End vowel</span>
			</div>
			<span className="sr-only">Legend describing trajectory markers.</span>
		</div>
	);
}
