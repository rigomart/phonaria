import * as React from "react";
import type { VowelPhoneme } from "shared-data";
import { PhonemeDialog } from "@/components/phoneme-dialog";
import { GridMatrix } from "@/routes/(charts)/-components/layout/grid-matrix";
import { GridStacked } from "@/routes/(charts)/-components/layout/grid-stacked";
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

				<div className="md:hidden">
					<GridStacked type="vowel" grid={grid} onSelect={openDetails} />
				</div>
				<div className="hidden md:block">
					<GridMatrix type="vowel" grid={grid} onSelect={openDetails} />
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
