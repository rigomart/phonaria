import * as React from "react";
import type { ConsonantPhoneme, VowelPhoneme } from "shared-data";
import { ConsonantCell } from "@/components/chart/consonant-cell";
import { VowelCell } from "@/components/chart/vowel-cell";
import { GridHeaderCell } from "@/components/core/grid-header-cell";
import {
	type GridConfig,
	getGridConfig,
	type PhonemeGrid,
	type PhonemeGridProps,
} from "@/lib/grid-config";

export function PhonemeMatrix(props: PhonemeGridProps) {
	const config = getGridConfig(props.type);

	if (props.type === "consonant") {
		return <ConsonantMatrix {...props} config={config} />;
	} else {
		return <VowelMatrix {...props} config={config} />;
	}
}

function ConsonantMatrix({
	grid,
	onSelect,
	config,
}: {
	grid: PhonemeGrid<ConsonantPhoneme>;
	onSelect: (phoneme: ConsonantPhoneme) => void;
	config: GridConfig;
}) {
	return (
		<div className="space-y-3">
			<p id={`${config.rowType}-matrix-caption`} className="sr-only">
				{config.caption}
			</p>

			<div className="overflow-x-auto">
				<div
					className="inline-grid rounded-md border text-sm"
					style={{
						gridTemplateColumns: `max-content repeat(${config.dimensions.columns.length}, minmax(4rem, 1fr))`,
					}}
					aria-describedby={`${config.rowType}-matrix-caption`}
				>
					<div className="sticky top-0 left-0 z-20 bg-background px-3 py-3 border-b border-r rounded-tl-md" />

					{config.dimensions.columns.map((column, i) => (
						<div
							key={column}
							className={[
								"sticky top-0 z-10 bg-background px-3 py-3 text-center font-medium capitalize text-xs",
								i === config.dimensions.columns.length - 1 ? "border-b" : "border-b border-r",
							].join(" ")}
						>
							<GridHeaderCell label={config.getColumnLabel(column)} className="text-xs" />
						</div>
					))}

					{config.dimensions.rows.map((row, rIndex) => (
						<React.Fragment key={row}>
							<div
								className={[
									"sticky left-0 z-10 bg-background px-3 py-2 text-left align-middle text-sm font-medium capitalize text-muted-foreground",
									rIndex === config.dimensions.rows.length - 1 ? "border-r" : "border-b border-r",
								].join(" ")}
							>
								<GridHeaderCell label={config.getRowLabel(row)} className="text-left text-sm" />
							</div>

							{config.dimensions.columns.map((column, cIndex) => (
								<div
									key={`${row}-${column}`}
									className={[
										"p-2 text-center align-middle",
										rIndex === config.dimensions.rows.length - 1
											? cIndex === config.dimensions.columns.length - 1
												? ""
												: "border-r"
											: cIndex === config.dimensions.columns.length - 1
												? "border-b"
												: "border-b border-r",
									].join(" ")}
								>
									<ConsonantCell phonemes={grid[row][column]} onSelect={onSelect} />
								</div>
							))}
						</React.Fragment>
					))}
				</div>
			</div>
		</div>
	);
}

function VowelMatrix({
	grid,
	onSelect,
	config,
}: {
	grid: PhonemeGrid<VowelPhoneme>;
	onSelect: (phoneme: VowelPhoneme) => void;
	config: GridConfig;
}) {
	return (
		<div className="space-y-3">
			<p id={`${config.rowType}-matrix-caption`} className="sr-only">
				{config.caption}
			</p>

			<div className="overflow-x-auto">
				<div
					className="inline-grid rounded-md border text-sm"
					style={{
						gridTemplateColumns: `max-content repeat(${config.dimensions.columns.length}, minmax(4rem, 1fr))`,
					}}
					aria-describedby={`${config.rowType}-matrix-caption`}
				>
					<div className="sticky top-0 left-0 z-20 bg-background px-3 py-3 border-b border-r rounded-tl-md" />

					{config.dimensions.columns.map((column, i) => (
						<div
							key={column}
							className={[
								"sticky top-0 z-10 bg-background px-3 py-3 text-center font-medium capitalize text-xs",
								i === config.dimensions.columns.length - 1 ? "border-b" : "border-b border-r",
							].join(" ")}
						>
							<GridHeaderCell label={config.getColumnLabel(column)} className="text-xs" />
						</div>
					))}

					{config.dimensions.rows.map((row, rIndex) => (
						<React.Fragment key={row}>
							<div
								className={[
									"sticky left-0 z-10 bg-background px-3 py-2 text-left align-middle text-sm font-medium capitalize text-muted-foreground",
									rIndex === config.dimensions.rows.length - 1 ? "border-r" : "border-b border-r",
								].join(" ")}
							>
								<GridHeaderCell label={config.getRowLabel(row)} className="text-left text-sm" />
							</div>

							{config.dimensions.columns.map((column, cIndex) => (
								<div
									key={`${row}-${column}`}
									className={[
										"p-2 text-center align-middle",
										rIndex === config.dimensions.rows.length - 1
											? cIndex === config.dimensions.columns.length - 1
												? ""
												: "border-r"
											: cIndex === config.dimensions.columns.length - 1
												? "border-b"
												: "border-b border-r",
									].join(" ")}
								>
									<VowelCell vowels={grid[row][column]} onSelect={onSelect} />
								</div>
							))}
						</React.Fragment>
					))}
				</div>
			</div>
		</div>
	);
}
