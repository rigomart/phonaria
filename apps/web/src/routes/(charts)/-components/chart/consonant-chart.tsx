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
import { useConsonantGrid } from "../../-hooks/use-consonant-grid";
import { ArticulationInfoPopover } from "./articulation-info-popover";
import { ConsonantCell } from "./consonant-cell";
import { PhonemeDialog } from "./phoneme-dialog";

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
										<ArticulationInfoPopover type="place" id={place}>
											<button
												type="button"
												className="capitalize underline decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
											>
												{place}
											</button>
										</ArticulationInfoPopover>
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
										<ArticulationInfoPopover type="manner" id={manner}>
											<button
												type="button"
												className="capitalize text-left underline decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
											>
												{manner}
											</button>
										</ArticulationInfoPopover>
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
			<PhonemeDialog.Root
				open={open}
				onOpenChange={(o) => {
					if (!o) setSelected(null);
					setOpen(o);
				}}
			>
				<PhonemeDialog.Content className="max-w-3xl">
					{selected ? (
						<div className="space-y-8">
							<PhonemeDialog.Header phoneme={selected} />
							<section className="space-y-3">
								<h3 className="text-sm font-medium">Sagittal view</h3>
								<div className="flex justify-center">
									<div
										className="aspect-square w-full max-w-[28rem] sm:max-w-[30rem] md:max-w-[32rem] rounded-lg border bg-muted/30 text-muted-foreground flex items-center justify-center select-none"
										role="img"
										aria-label="Sagittal view placeholder"
									>
										<span className="text-sm">Sagittal view placeholder</span>
									</div>
								</div>
							</section>
							<PhonemeDialog.ConsonantArticulation phoneme={selected} />
							{selected.guide ? <PhonemeDialog.Guide guide={selected.guide} /> : null}
							<PhonemeDialog.Examples examples={selected.examples} />
							{selected.allophones?.length ? (
								<PhonemeDialog.Allophones allophones={selected.allophones} />
							) : null}
						</div>
					) : null}
				</PhonemeDialog.Content>
			</PhonemeDialog.Root>
		</>
	);
}
