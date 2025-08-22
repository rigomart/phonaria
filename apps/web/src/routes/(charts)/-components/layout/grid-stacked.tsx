import type { ConsonantPhoneme, VowelPhoneme } from "shared-data";
import { articulationRegistry } from "shared-data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

type PhonemeSectionProps =
	| {
			type: "consonant";
			row: string;
			columns: string[];
			grid: ConsonantGrid;
			onSelect: (phoneme: ConsonantPhoneme) => void;
			config: GridConfig;
	  }
	| {
			type: "vowel";
			row: string;
			columns: string[];
			grid: VowelGrid;
			onSelect: (phoneme: VowelPhoneme) => void;
			config: GridConfig;
	  };

function PhonemeSection({ type, row, columns, grid, onSelect, config }: PhonemeSectionProps) {
	const hasData = columns.length > 0;

	if (!hasData) return null;

	return (
		<Card
			className="bg-card/20"
			aria-labelledby={`${config.rowType}-${row}`}
			aria-describedby={`${config.rowType}-caption`}
		>
			<CardHeader>
				<h3 id={`${config.rowType}-${row}`} className="text-sm font-medium text-muted-foreground">
					<span className="mr-2">
						{config.rowType.charAt(0).toUpperCase() + config.rowType.slice(1)}
					</span>
					{(() => {
						const entry = articulationRegistry[row];
						const buttonElement = (
							<button
								type="button"
								className="capitalize font-semibold text-foreground underline decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
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
				</h3>
			</CardHeader>

			<CardContent>
				<div className="flex gap-y-6 gap-x-8 flex-wrap">
					{columns.map((column) => (
						<div key={column} className="flex flex-col gap-4">
							<div className="flex flex-col gap-0.5">
								<div className="text-[11px] uppercase tracking-wide text-muted-foreground">
									{config.columnType.charAt(0).toUpperCase() + config.columnType.slice(1)}
								</div>
								<div className="text-sm font-semibold">
									{(() => {
										const entry = articulationRegistry[column];
										const buttonElement = (
											<button
												type="button"
												className="capitalize underline decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
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
							</div>

							{type === "consonant" ? (
								<ConsonantCell phonemes={grid[row][column]} onSelect={onSelect} />
							) : (
								<VowelCell vowels={grid[row][column]} onSelect={onSelect} />
							)}
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function ConsonantGridStacked({
	grid,
	onSelect,
}: {
	grid: ConsonantGrid;
	onSelect: (phoneme: ConsonantPhoneme) => void;
}) {
	const config = getGridConfig("consonant");

	return (
		<div className="space-y-6">
			<p id={`${config.rowType}-caption`} className="sr-only">
				{config.caption}
			</p>

			{config.rows.map((row) => {
				const columns = config.columns.filter((column) => grid[row]?.[column]?.length);
				return (
					<PhonemeSection
						key={row}
						type="consonant"
						row={row}
						columns={columns}
						grid={grid}
						onSelect={onSelect}
						config={config}
					/>
				);
			})}
		</div>
	);
}

function VowelGridStacked({
	grid,
	onSelect,
}: {
	grid: VowelGrid;
	onSelect: (phoneme: VowelPhoneme) => void;
}) {
	const config = getGridConfig("vowel");

	return (
		<div className="space-y-6">
			<p id={`${config.rowType}-caption`} className="sr-only">
				{config.caption}
			</p>

			{config.rows.map((row) => {
				const columns = config.columns.filter((column) => grid[row]?.[column]?.length);
				return (
					<PhonemeSection
						key={row}
						type="vowel"
						row={row}
						columns={columns}
						grid={grid}
						onSelect={onSelect}
						config={config}
					/>
				);
			})}
		</div>
	);
}

type GridStackedProps =
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

export function GridStacked(props: GridStackedProps) {
	if (props.type === "consonant") {
		return <ConsonantGridStacked grid={props.grid} onSelect={props.onSelect} />;
	} else {
		return <VowelGridStacked grid={props.grid} onSelect={props.onSelect} />;
	}
}
