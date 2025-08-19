import * as React from "react";
import type { ConsonantPhoneme } from "shared-data";
import { MANNERS, PLACES } from "@/lib/phoneme-helpers";
import { useConsonantGrid } from "../../-hooks/use-consonant-grid";
import { ArticulationInfoPopover } from "./articulation-info-popover";
import { ConsonantCell } from "./consonant-cell";

type Props = { onSelect: (p: ConsonantPhoneme) => void };

export function ConsonantGridMatrix({ onSelect }: Props) {
	const grid = useConsonantGrid();

	return (
		<div className="space-y-3">
			<p id="consonants-matrix-caption" className="sr-only">
				Rows: Manner of articulation • Columns: Place of articulation
			</p>

			<div className="overflow-x-auto">
				<div
					className="inline-grid rounded-md border text-sm"
					style={{
						gridTemplateColumns: `max-content repeat(${PLACES.length}, minmax(4rem, 1fr))`,
					}}
					aria-describedby="consonants-matrix-caption"
				>
					<div className="sticky top-0 left-0 z-20 bg-background px-3 py-3 border-b border-r rounded-tl-md" />

					{PLACES.map((place, i) => (
						<div
							key={place}
							className={[
								"sticky top-0 z-10 bg-background px-3 py-3 text-center font-medium capitalize text-xs",
								i === PLACES.length - 1 ? "border-b" : "border-b border-r",
							].join(" ")}
						>
							<ArticulationInfoPopover type="place" id={place}>
								<button
									type="button"
									className="capitalize underline decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
								>
									{place}
								</button>
							</ArticulationInfoPopover>
						</div>
					))}

					{MANNERS.map((manner, rIndex) => (
						<React.Fragment key={manner}>
							<div
								className={[
									"sticky left-0 z-10 bg-background px-3 py-2 text-left align-middle text-sm font-medium capitalize text-muted-foreground",
									rIndex === MANNERS.length - 1 ? "border-r" : "border-b border-r",
								].join(" ")}
							>
								<ArticulationInfoPopover type="manner" id={manner}>
									<button
										type="button"
										className="capitalize text-left underline decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
									>
										{manner}
									</button>
								</ArticulationInfoPopover>
							</div>

							{PLACES.map((place, cIndex) => (
								<div
									key={`${manner}-${place}`}
									className={[
										"p-2 text-center align-middle",
										rIndex === MANNERS.length - 1
											? cIndex === PLACES.length - 1
												? ""
												: "border-r"
											: cIndex === PLACES.length - 1
												? "border-b"
												: "border-b border-r",
									].join(" ")}
								>
									<ConsonantCell phonemes={grid[manner][place]} onSelect={onSelect} />
								</div>
							))}
						</React.Fragment>
					))}
				</div>
			</div>
		</div>
	);
}
