import * as React from "react";
import type { VowelPhoneme } from "shared-data";
import { PhonemeDialog } from "@/components/phoneme-dialog";
import { PhonemeGridLayout } from "@/routes/(charts)/-components/core/phoneme-grid";
import { PhonemeMatrix } from "@/routes/(charts)/-components/core/phoneme-matrix";
import { useVowelGrid } from "@/routes/(charts)/-hooks/use-vowel-grid";

export function VowelChart() {
	const grid = useVowelGrid();
	const [open, setOpen] = React.useState(false);
	const [selected, setSelected] = React.useState<VowelPhoneme | null>(null);

	const openDetails = React.useCallback((phoneme: VowelPhoneme) => {
		setSelected(phoneme);
		setOpen(true);
	}, []);

	return (
		<>
			<div className="space-y-6">
				{/* Enhanced Legend */}
				<div className="rounded-lg border bg-card/50 p-4">
					<h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
						<div className="h-1 w-4 bg-accent rounded-full" />
						Vowel Characteristics
					</h4>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
						<div className="space-y-3">
							<div className="flex items-center gap-3">
								<div className="relative h-8 w-8 rounded-full border bg-background shadow-sm"></div>
								<div>
									<div className="font-medium text-foreground">Unrounded</div>
									<div className="text-xs text-muted-foreground">Lips spread or neutral</div>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="relative h-8 w-8 rounded-full border bg-secondary/10 shadow-sm"></div>
								<div>
									<div className="font-medium text-foreground">Rounded</div>
									<div className="text-xs text-muted-foreground">Lips pursed together</div>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="relative flex h-8 w-8 items-end justify-center rounded border bg-background shadow-sm">
									<div className="mb-1 h-0.5 w-5 rounded-full bg-primary/60" />
								</div>
								<div>
									<div className="font-medium text-foreground">Rhotic</div>
									<div className="text-xs text-muted-foreground">With r-coloring</div>
								</div>
							</div>
						</div>
						<div className="space-y-2 text-xs text-muted-foreground">
							<p>English vowels vary by tongue height, lip rounding, and rhotic quality.</p>
						</div>
					</div>
				</div>

				<div className="md:hidden">
					<PhonemeGridLayout type="vowel" grid={grid} onSelect={openDetails} />
				</div>
				<div className="hidden md:block">
					<PhonemeMatrix type="vowel" grid={grid} onSelect={openDetails} />
				</div>
			</div>

			<PhonemeDialog.Root
				open={open}
				onOpenChange={(o) => {
					if (!o) setSelected(null);
					setOpen(o);
				}}
			>
				<PhonemeDialog.Content className="max-w-3xl max-h-[min(85vh,calc(100dvh-2rem))] overflow-y-auto">
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
