import { consonants } from "shared-data";
import { PhonemeTile } from "@/components/phoneme/PhonemeTile";
import { buildConsonantGrid, MANNERS, PLACES } from "@/lib/phoneme-helpers";

export function ConsonantChart() {
	const grid = buildConsonantGrid(consonants);

	return (
		<div className="mt-4 w-full overflow-x-auto">
			<table className="w-full border-collapse text-sm">
				<thead>
					<tr>
						<th className="sticky left-0 z-10 bg-background p-2 text-left">Manner \\ Place</th>
						{PLACES.map((place) => (
							<th key={place} className="border p-2 capitalize">
								{place}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{MANNERS.map((manner) => (
						<tr key={manner}>
							<th className="sticky left-0 z-10 bg-background p-2 text-left capitalize">
								{manner}
							</th>
							{PLACES.map((place) => {
								const p = grid[manner][place];
								return (
									<td key={`${manner}-${place}`} className="border p-2 align-top">
										{p ? <PhonemeTile phoneme={p} /> : <div className="h-12" />}
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
