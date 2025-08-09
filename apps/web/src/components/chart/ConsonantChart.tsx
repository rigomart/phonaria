import * as React from "react";
import type { ConsonantPhoneme } from "shared-data";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { MANNERS, PLACES } from "@/lib/phoneme-helpers";
import { ConsonantCell } from "./ConsonantCell";
import { ConsonantDialog } from "./ConsonantDialog";
import { useConsonantGrid } from "./useConsonantGrid";

export function ConsonantChart() {
	const [open, setOpen] = React.useState(false);
	const [selected, setSelected] = React.useState<ConsonantPhoneme | null>(null);
	const grid = useConsonantGrid();

	const openDetails = React.useCallback((p: ConsonantPhoneme) => {
		setSelected(p);
		setOpen(true);
	}, []);

	return (
		<>
			<div className="mt-6 space-y-5 px-2">
				{/* Legend */}
				<div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<div className="h-6 w-6 rounded-full border" />
						<span>Voiceless</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-6 w-6 rounded-full border bg-primary/10" />
						<span>Voiced</span>
					</div>
				</div>

				<div className="overflow-x-auto">
					<Table
						aria-label="Consonant chart organized by manner and place of articulation"
						className="min-w-[60rem] text-sm"
					>
						<TableCaption className="mb-3 text-sm text-muted-foreground font-normal">
							Rows: <span className="font-medium">Manner of articulation</span> • Columns:{" "}
							<span className="font-medium">Place of articulation</span>
						</TableCaption>
						<TableHeader className="text-xs">
							<TableRow>
								<TableHead className="pl-3 pr-4 py-3 text-left font-medium text-xs rounded-tl align-bottom">
									<span className="sr-only">Corner (see caption for axis labels)</span>
								</TableHead>
								{PLACES.map((place) => (
									<TableHead
										key={place}
										className="px-3 py-3 text-center font-medium capitalize text-xs"
									>
										{place}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{MANNERS.map((manner) => (
								<TableRow key={manner} className="border-b last:border-b-0">
									<TableHead
										scope="row"
										className="px-3 text-sm font-medium capitalize text-muted-foreground text-left align-middle"
									>
										{manner}
									</TableHead>
									{PLACES.map((place) => (
										<TableCell key={place} className="text-center align-middle">
											<ConsonantCell phonemes={grid[manner][place]} onSelect={openDetails} />
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
			<ConsonantDialog
				phoneme={selected}
				open={open}
				onOpenChange={(o) => {
					if (!o) setSelected(null);
					setOpen(o);
				}}
			/>
		</>
	);
}
