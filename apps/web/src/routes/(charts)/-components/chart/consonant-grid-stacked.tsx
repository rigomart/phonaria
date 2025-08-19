import type { ConsonantPhoneme } from "shared-data";
import { MANNERS, PLACES } from "@/lib/phoneme-helpers";
import { useConsonantGrid } from "../../-hooks/use-consonant-grid";
import { ArticulationInfoPopover } from "./articulation-info-popover";
import { ConsonantCell } from "./consonant-cell";

type Props = { onSelect: (p: ConsonantPhoneme) => void };

export function ConsonantGridStacked({ onSelect }: Props) {
	const grid = useConsonantGrid();

	return (
		<div className="space-y-6">
			<p id="consonants-caption" className="sr-only">
				Rows: Manner of articulation • Columns: Place of articulation
			</p>

			{MANNERS.map((manner) => {
				const columns = PLACES.filter((place) => grid[manner][place]?.length);
				if (!columns.length) return null;

				return (
					<section
						key={manner}
						className="space-y-3"
						aria-labelledby={`manner-${manner}`}
						aria-describedby="consonants-caption"
					>
						<h3 id={`manner-${manner}`} className="px-2 text-sm font-medium text-muted-foreground">
							<span className="mr-2">Manner</span>
							<ArticulationInfoPopover type="manner" id={manner}>
								<button
									type="button"
									className="capitalize font-semibold text-foreground underline decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
								>
									{manner}
								</button>
							</ArticulationInfoPopover>
						</h3>

						<div className="-mx-2 overflow-x-auto px-2 pb-2">
							<div className="flex gap-3">
								{columns.map((place) => (
									<div key={place} className="min-w-40 shrink-0 rounded-md border p-3">
										<div className="mb-2">
											<div className="text-[11px] uppercase tracking-wide text-muted-foreground">
												Place
											</div>
											<div className="text-sm font-semibold">
												<ArticulationInfoPopover type="place" id={place}>
													<button
														type="button"
														className="capitalize underline decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
													>
														{place}
													</button>
												</ArticulationInfoPopover>
											</div>
										</div>

										<ConsonantCell phonemes={grid[manner][place]} onSelect={onSelect} />
									</div>
								))}
							</div>
						</div>
					</section>
				);
			})}
		</div>
	);
}
