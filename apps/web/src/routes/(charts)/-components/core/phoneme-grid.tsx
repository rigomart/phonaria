import type { ConsonantPhoneme, VowelPhoneme } from "shared-data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	type GridConfig,
	getGridConfig,
	getNonEmptyColumns,
	type PhonemeGrid,
	type PhonemeGridProps,
} from "@/lib/grid-config";
import { ConsonantCell } from "@/routes/(charts)/-components/chart/consonant-cell";
import { VowelCell } from "@/routes/(charts)/-components/chart/vowel-cell";
import { GridHeaderCell } from "@/routes/(charts)/-components/core/grid-header-cell";

type PhonemeSectionProps = PhonemeGridProps & {
	row: string;
	columns: string[];
	config: GridConfig;
};

function PhonemeSection({ type, row, columns, grid, onSelect, config }: PhonemeSectionProps) {
	const hasData = columns.length > 0;

	if (!hasData) return null;

	return (
		<Card className="bg-card/20">
			<CardHeader>
				<h3 id={`${config.rowType}-${row}`} className="text-sm font-medium text-muted-foreground">
					<span className="mr-2">
						{config.rowType.charAt(0).toUpperCase() + config.rowType.slice(1)}
					</span>
					<GridHeaderCell
						label={config.getRowLabel(row)}
						className="font-semibold text-foreground"
					/>
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
								<GridHeaderCell label={config.getColumnLabel(column)} />
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

export function PhonemeGridLayout(props: PhonemeGridProps) {
	const config = getGridConfig(props.type);

	if (props.type === "consonant") {
		return <ConsonantGridStacked {...props} config={config} />;
	} else {
		return <VowelGridStacked {...props} config={config} />;
	}
}

function ConsonantGridStacked({
	grid,
	onSelect,
	config,
}: {
	grid: PhonemeGrid<ConsonantPhoneme>;
	onSelect: (phoneme: ConsonantPhoneme) => void;
	config: GridConfig;
}) {
	return (
		<div className="space-y-6">
			<p id={`${config.rowType}-caption`} className="sr-only">
				{config.caption}
			</p>

			{config.dimensions.rows.map((row) => {
				const columns = getNonEmptyColumns(grid, row, config.dimensions.columns);
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
	config,
}: {
	grid: PhonemeGrid<VowelPhoneme>;
	onSelect: (phoneme: VowelPhoneme) => void;
	config: GridConfig;
}) {
	return (
		<div className="space-y-6">
			<p id={`${config.rowType}-caption`} className="sr-only">
				{config.caption}
			</p>

			{config.dimensions.rows.map((row) => {
				const columns = getNonEmptyColumns(grid, row, config.dimensions.columns);
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
