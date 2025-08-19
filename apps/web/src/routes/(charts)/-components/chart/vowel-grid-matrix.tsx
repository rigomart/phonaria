import * as React from "react";
import type { VowelPhoneme } from "shared-data";
import { useVowelGrid, VOWEL_FRONTS, VOWEL_HEIGHTS } from "../../-hooks/use-vowel-grid";
import { VowelAxisInfoPopover } from "./vowel-axis-info-popover";
import { VowelCell } from "./vowel-cell";

type Props = { onSelect: (v: VowelPhoneme) => void };

export function VowelGridMatrix({ onSelect }: Props) {
	const grid = useVowelGrid();

	return (
		<div className="space-y-3">
			<p id="vowels-matrix-caption" className="sr-only">
				Rows: Height / Openness • Columns: Frontness / Backness
			</p>

			<div className="overflow-x-auto">
				<div
					className="inline-grid rounded-md border text-sm"
					style={{
						gridTemplateColumns: `max-content repeat(${VOWEL_FRONTS.length}, minmax(4rem, 1fr))`,
					}}
					aria-describedby="vowels-matrix-caption"
				>
					<div className="sticky top-0 left-0 z-20 bg-background px-3 py-3 border-b border-r rounded-tl-md" />

					{VOWEL_FRONTS.map((front, i) => (
						<div
							key={front}
							className={[
								"sticky top-0 z-10 bg-background px-3 py-3 text-center font-medium capitalize text-xs",
								i === VOWEL_FRONTS.length - 1 ? "border-b" : "border-b border-r",
							].join(" ")}
						>
							<VowelAxisInfoPopover type="frontness" id={front}>
								<button
									type="button"
									className="capitalize underline decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
								>
									{front.replace("near-", "near ")}
								</button>
							</VowelAxisInfoPopover>
						</div>
					))}

					{VOWEL_HEIGHTS.map((height, rIndex) => (
						<React.Fragment key={height}>
							<div
								className={[
									"sticky left-0 z-10 bg-background px-3 py-2 text-left align-middle text-sm font-medium capitalize text-muted-foreground",
									rIndex === VOWEL_HEIGHTS.length - 1 ? "border-r" : "border-b border-r",
								].join(" ")}
							>
								<VowelAxisInfoPopover type="height" id={height}>
									<button
										type="button"
										className="capitalize text-left underline decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
									>
										{height.replace("near-", "near ")}
									</button>
								</VowelAxisInfoPopover>
							</div>

							{VOWEL_FRONTS.map((front, cIndex) => (
								<div
									key={`${height}-${front}`}
									className={[
										"p-2 text-center align-middle",
										rIndex === VOWEL_HEIGHTS.length - 1
											? cIndex === VOWEL_FRONTS.length - 1
												? ""
												: "border-r"
											: cIndex === VOWEL_FRONTS.length - 1
												? "border-b"
												: "border-b border-r",
									].join(" ")}
								>
									<VowelCell vowels={grid[height][front]} onSelect={onSelect} />
								</div>
							))}
						</React.Fragment>
					))}
				</div>
			</div>
		</div>
	);
}
