"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import type { CmudictStatsPayload } from "shared-data";
import { cmudictStatsData } from "shared-data";
import { Card, CardContent } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

export function SyllableHistogram() {
	const stats = cmudictStatsData as CmudictStatsPayload;
	const syllables = stats.syllables.filter((s) => s.count <= 10); // Cap at 10 for readability

	const chartData = syllables.map((s) => ({
		syllables: s.count,
		words: s.words,
		percentage: s.percentage,
	}));

	const chartConfig = {
		words: {
			label: "Words",
			color: "var(--chart-1)",
		},
	} satisfies ChartConfig;

	return (
		<Card>
			<CardContent className="p-4">
				<ChartContainer config={chartConfig} className="min-h-[250px] w-full">
					<BarChart accessibilityLayer data={chartData}>
						<XAxis
							dataKey="syllables"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
							label={{ value: "Syllables per word", position: "insideBottom", offset: -5 }}
						/>
						<YAxis
							tickLine={false}
							tickMargin={10}
							axisLine={false}
							label={{ value: "Word count", angle: -90, position: "insideLeft" }}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									formatter={(value) => {
										const data = chartData.find((d) => d.words === value);
										if (!data) return null;
										return (
											<>
												<div className="font-medium">{data.words.toLocaleString()} words</div>
												<div className="text-xs text-muted-foreground">
													{data.percentage.toFixed(1)}% of words
												</div>
											</>
										);
									}}
								/>
							}
						/>
						<Bar dataKey="words" fill="var(--color-words)" radius={4} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
