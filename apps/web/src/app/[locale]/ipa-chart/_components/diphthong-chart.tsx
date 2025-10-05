"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { VowelPhoneme } from "shared-data";
import { getDiphthongTrajectories } from "shared-data";
import { cn } from "@/lib/utils";
import { useIpaChartStore } from "../_store/ipa-chart-store";

interface DiphthongChartProps {
	diphthongs: VowelPhoneme[];
}

const HEIGHT_ORDER = [
	"high",
	"near-high",
	"high-mid",
	"mid",
	"low-mid",
	"near-low",
	"low",
] as const;

const FRONTNESS_ORDER = ["front", "near-front", "central", "near-back", "back"] as const;

const HEIGHT_LABELS: Record<(typeof HEIGHT_ORDER)[number], string> = {
	high: "Close",
	"near-high": "Near-close",
	"high-mid": "Close-mid",
	mid: "Mid",
	"low-mid": "Open-mid",
	"near-low": "Near-open",
	low: "Open",
};

const FRONTNESS_LABELS: Record<(typeof FRONTNESS_ORDER)[number], string> = {
	front: "Front",
	"near-front": "Near-front",
	central: "Central",
	"near-back": "Near-back",
	back: "Back",
};

export function DiphthongChart({ diphthongs }: DiphthongChartProps) {
	const trajectories = useMemo(() => getDiphthongTrajectories(diphthongs), [diphthongs]);
	const selectPhoneme = useIpaChartStore((s) => s.selectPhoneme);
	const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);
	const gridRef = useRef<HTMLDivElement>(null);
	const [cellPositions, setCellPositions] = useState<Map<string, { x: number; y: number }>>(
		new Map(),
	);

	useEffect(() => {
		const updatePositions = () => {
			if (!gridRef.current) return;

			const positions = new Map<string, { x: number; y: number }>();
			const cells = gridRef.current.querySelectorAll("[data-cell]");

			for (const cell of cells) {
				const element = cell as HTMLElement;
				const key = element.dataset.cell;
				if (!key) continue;

				const rect = element.getBoundingClientRect();
				const gridRect = gridRef.current.getBoundingClientRect();

				positions.set(key, {
					x: rect.left - gridRect.left + rect.width / 2,
					y: rect.top - gridRect.top + rect.height / 2,
				});
			}

			setCellPositions(positions);
		};

		updatePositions();
		window.addEventListener("resize", updatePositions);
		return () => window.removeEventListener("resize", updatePositions);
	}, []);

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
							const cellKey = `${height}-${frontness}`;
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

				{cellPositions.size > 0 && (
					<svg
						className="absolute inset-0 pointer-events-none"
						style={{ width: "100%", height: "100%" }}
						aria-label="Diphthong trajectories overlay"
					>
						<title>Diphthong Trajectories</title>
						{trajectories.map((trajectory) => {
							const startKey = `${trajectory.start.height}-${trajectory.start.frontness}`;
							const endKey = `${trajectory.end.height}-${trajectory.end.frontness}`;

							const startPos = cellPositions.get(startKey);
							const endPos = cellPositions.get(endKey);

							if (!startPos || !endPos) return null;

							const dx = endPos.x - startPos.x;
							const dy = endPos.y - startPos.y;
							const distance = Math.sqrt(dx * dx + dy * dy);

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

							const isHovered = hoveredSymbol === trajectory.diphthong.symbol;

							const handleClick = () => selectPhoneme(trajectory.diphthong);
							const handleKeyDown = (e: React.KeyboardEvent) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									handleClick();
								}
							};

							return (
								// biome-ignore lint/a11y/useSemanticElements: SVG elements cannot be wrapped in button elements
								<g
									key={trajectory.diphthong.symbol}
									className="trajectory-group cursor-pointer pointer-events-auto"
									onClick={handleClick}
									onKeyDown={handleKeyDown}
									onMouseEnter={() => setHoveredSymbol(trajectory.diphthong.symbol)}
									onMouseLeave={() => setHoveredSymbol(null)}
									role="button"
									tabIndex={0}
									aria-label={`Diphthong ${trajectory.diphthong.symbol}`}
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
										{trajectory.diphthong.symbol[0]}
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
										{trajectory.diphthong.symbol[1]}
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
										{trajectory.diphthong.symbol}
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
