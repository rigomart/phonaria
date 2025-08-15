import * as React from "react";
import type { VowelPhoneme } from "shared-data";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useVowelGrid, VOWEL_FRONTS, VOWEL_HEIGHTS } from "../../-hooks/use-vowel-grid";
import { PhonemeDialog } from "./phoneme-dialog";
import { VowelAxisInfoPopover } from "./vowel-axis-info-popover";
import { VowelCell } from "./vowel-cell";

export function VowelChart() {
	const [open, setOpen] = React.useState(false);
	const [selected, setSelected] = React.useState<VowelPhoneme | null>(null);
	const grid = useVowelGrid();
	const openDetails = React.useCallback((p: VowelPhoneme) => {
		setSelected(p);
		setOpen(true);
	}, []);
	return (
		<>
			<div className="mt-6 space-y-5 px-2">
				<div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<div className="relative h-6 w-6 rounded-full border"></div>
						<span>Rounded</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="relative flex h-6 w-6 items-end justify-center rounded border">
							<div className="mb-1 h-0.5 w-4 rounded-full bg-primary/60" />
						</div>
						<span>Rhotic</span>
					</div>
				</div>
				<div className="overflow-x-auto">
					<Table
						aria-label="Vowel chart organized by height (rows) and frontness/backness (columns)"
						className="min-w-[52rem] text-sm"
					>
						<TableCaption className="mb-3 text-sm text-muted-foreground font-normal">
							Rows: <span className="font-medium">Height / Openness</span> • Columns:{" "}
							<span className="font-medium">Frontness / Backness</span>
						</TableCaption>
						<TableHeader className="text-xs">
							<TableRow>
								<TableHead className="pl-3 pr-4 py-3 text-left font-medium text-xs rounded-tl align-bottom">
									<span className="sr-only">Corner (see caption for axis labels)</span>
								</TableHead>
								{VOWEL_FRONTS.map((front) => (
									<TableHead
										key={front}
										className="px-3 py-3 text-center font-medium capitalize text-xs"
									>
										<VowelAxisInfoPopover type="frontness" id={front}>
											<button
												type="button"
												className="capitalize underline decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
											>
												{front.replace("near-", "near ")}
											</button>
										</VowelAxisInfoPopover>
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{VOWEL_HEIGHTS.map((h) => (
								<TableRow key={h} className="border-b last:border-b-0">
									<TableHead
										scope="row"
										className="px-3 text-sm font-medium capitalize text-muted-foreground text-left align-middle"
									>
										<VowelAxisInfoPopover type="height" id={h}>
											<button
												type="button"
												className="capitalize text-left underline decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
											>
												{h.replace("near-", "near ")}
											</button>
										</VowelAxisInfoPopover>
									</TableHead>
									{VOWEL_FRONTS.map((f) => (
										<TableCell key={f} className="text-center align-middle">
											<VowelCell vowels={grid[h][f]} onSelect={openDetails} />
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
							<PhonemeDialog.VowelArticulation phoneme={selected} />
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
