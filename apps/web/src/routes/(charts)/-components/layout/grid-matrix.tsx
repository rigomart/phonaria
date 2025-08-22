import * as React from "react";
import type { ConsonantPhoneme, VowelPhoneme } from "shared-data";
import { articulationRegistry } from "shared-data";
import { MANNERS, PLACES } from "@/lib/phoneme-helpers";
import { ConsonantCell } from "@/routes/(charts)/-components/chart/consonant-cell";
import { VowelCell } from "@/routes/(charts)/-components/chart/vowel-cell";
import { InfoPopover } from "@/routes/(charts)/-components/info/info-popover";
import type { ConsonantGrid } from "../../-hooks/use-consonant-grid";
import { VOWEL_FRONTS, VOWEL_HEIGHTS, type VowelGrid } from "../../-hooks/use-vowel-grid";

interface GridConfig {
	rows: string[];
	columns: string[];
	rowType: "manner" | "height";
	columnType: "place" | "frontness";
	caption: string;
	getRowLabel: (row: string) => string;
	getColumnLabel: (column: string) => string;
}

function getGridConfig(type: "consonant" | "vowel"): GridConfig {
	if (type === "consonant") {
		return {
			rows: MANNERS,
			columns: PLACES,
			rowType: "manner",
			columnType: "place",
			caption: "Rows: Manner of articulation • Columns: Place of articulation",
			getRowLabel: (row) => row,
			getColumnLabel: (column) => column,
		};
	} else {
		return {
			rows: VOWEL_HEIGHTS,
			columns: VOWEL_FRONTS,
			rowType: "height",
			columnType: "frontness",
			caption: "Rows: Height / Openness • Columns: Frontness / Backness",
			getRowLabel: (row) => row.replace("near-", "near "),
			getColumnLabel: (column) => column.replace("near-", "near "),
		};
	}
}

type PhonemeMatrixProps =
	| {
			type: "consonant";
			grid: ConsonantGrid;
			onSelect: (phoneme: ConsonantPhoneme) => void;
			config: GridConfig;
	  }
	| {
			type: "vowel";
			grid: VowelGrid;
			onSelect: (phoneme: VowelPhoneme) => void;
			config: GridConfig;
	  };

function PhonemeMatrix({ type, grid, onSelect, config }: PhonemeMatrixProps) {
	return (
		<div className="space-y-3">
			<p id={`${config.rowType}-matrix-caption`} className="sr-only">
				{config.caption}
			</p>

			<div className="overflow-x-auto">
				<div
					className="inline-grid rounded-md border text-sm"
					style={{
						gridTemplateColumns: `max-content repeat(${config.columns.length}, minmax(4rem, 1fr))`,
					}}
					aria-describedby={`${config.rowType}-matrix-caption`}
				>
					<div className="sticky top-0 left-0 z-20 bg-background px-3 py-3 border-b border-r rounded-tl-md" />

					{config.columns.map((column, i) => (
						<div
							key={column}
							className={[
								"sticky top-0 z-10 bg-background px-3 py-3 text-center font-medium capitalize text-xs",
								i === config.columns.length - 1 ? "border-b" : "border-b border-r",
							].join(" ")}
						>
							{(() => {
								const entry = articulationRegistry[column];
								const buttonElement = (
									<button
										type="button"
										className="capitalize underline decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
									>
										{config.getColumnLabel(column)}
									</button>
								);

								return entry ? (
									<InfoPopover
										category={entry.category}
										label={entry.label}
										short={entry.short}
										airflow={entry.airflow}
										side={entry.tooltipSide}
									>
										{buttonElement}
									</InfoPopover>
								) : (
									buttonElement
								);
							})()}
						</div>
					))}

					{config.rows.map((row, rIndex) => (
						<React.Fragment key={row}>
							<div
								className={[
									"sticky left-0 z-10 bg-background px-3 py-2 text-left align-middle text-sm font-medium capitalize text-muted-foreground",
									rIndex === config.rows.length - 1 ? "border-r" : "border-b border-r",
								].join(" ")}
							>
								{(() => {
									const entry = articulationRegistry[row];
									const buttonElement = (
										<button
											type="button"
											className="capitalize text-left underline decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
										>
											{config.getRowLabel(row)}
										</button>
									);

									return entry ? (
										<InfoPopover
											category={entry.category}
											label={entry.label}
											short={entry.short}
											airflow={entry.airflow}
											side={entry.tooltipSide}
										>
											{buttonElement}
										</InfoPopover>
									) : (
										buttonElement
									);
								})()}
							</div>

							{config.columns.map((column, cIndex) => (
								<div
									key={`${row}-${column}`}
									className={[
										"p-2 text-center align-middle",
										rIndex === config.rows.length - 1
											? cIndex === config.columns.length - 1
												? ""
												: "border-r"
											: cIndex === config.columns.length - 1
												? "border-b"
												: "border-b border-r",
									].join(" ")}
								>
									{type === "consonant" ? (
										<ConsonantCell phonemes={grid[row][column]} onSelect={onSelect} />
									) : (
										<VowelCell vowels={grid[row][column]} onSelect={onSelect} />
									)}
								</div>
							))}
						</React.Fragment>
					))}
				</div>
			</div>
		</div>
	);
}

function ConsonantGridMatrix({
	grid,
	onSelect,
}: {
	grid: ConsonantGrid;
	onSelect: (phoneme: ConsonantPhoneme) => void;
}) {
	const config = getGridConfig("consonant");
	return <PhonemeMatrix type="consonant" grid={grid} onSelect={onSelect} config={config} />;
}

function VowelGridMatrix({
	grid,
	onSelect,
}: {
	grid: VowelGrid;
	onSelect: (phoneme: VowelPhoneme) => void;
}) {
	const config = getGridConfig("vowel");
	return <PhonemeMatrix type="vowel" grid={grid} onSelect={onSelect} config={config} />;
}

type GridMatrixProps =
	| {
			type: "consonant";
			grid: ConsonantGrid;
			onSelect: (phoneme: ConsonantPhoneme) => void;
	  }
	| {
			type: "vowel";
			grid: VowelGrid;
			onSelect: (phoneme: VowelPhoneme) => void;
	  };

export function GridMatrix(props: GridMatrixProps) {
	if (props.type === "consonant") {
		return <ConsonantGridMatrix grid={props.grid} onSelect={props.onSelect} />;
	} else {
		return <VowelGridMatrix grid={props.grid} onSelect={props.onSelect} />;
	}
}
