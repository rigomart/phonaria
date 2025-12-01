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

export function PhonemeFrequencyChart() {
	const stats = cmudictStatsData as CmudictStatsPayload;
	const topPhonemes = stats.phonemes.slice(0, 20);

	const chartData = topPhonemes.map((phoneme) => ({
		phoneme: phoneme.ipa || phoneme.arpa,
		arpa: phoneme.arpa,
		frequency: phoneme.tokenCount,
		coverage: phoneme.wordCoverage.count,
	}));

	const chartConfig = {
		frequency: {
			label: "Frequency",
			color: "var(--chart-1)",
		},
	} satisfies ChartConfig;

	return (
		<Card>
			<CardContent className="p-4">
				<ChartContainer config={chartConfig} className="min-h-[250px] w-full">
					<BarChart
						accessibilityLayer
						data={chartData}
						layout="vertical"
						margin={{ left: 40, right: 20 }}
					>
						<XAxis type="number" />
						<YAxis
							dataKey="phoneme"
							type="category"
							tickLine={false}
							tickMargin={10}
							width={60}
							tickFormatter={(value) => {
								const item = chartData.find((d) => d.phoneme === value);
								return item?.arpa || value;
							}}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									formatter={(value) => {
										const data = chartData.find((d) => d.frequency === value);
										if (!data) return null;
										return (
											<>
												<div className="font-medium">{data.phoneme}</div>
												<div className="text-xs text-muted-foreground">{data.arpa}</div>
												<div className="mt-1">Frequency: {data.frequency.toLocaleString()}</div>
												<div className="text-xs text-muted-foreground">
													Coverage: {data.coverage.toLocaleString()} words
												</div>
											</>
										);
									}}
								/>
							}
						/>
						<Bar dataKey="frequency" fill="var(--color-frequency)" radius={4} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
