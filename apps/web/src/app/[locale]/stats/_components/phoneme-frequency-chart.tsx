"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { cmudictStatsData } from "shared-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { useScopedI18n } from "@/locales/client";

export function PhonemeFrequencyChart() {
	const stats = cmudictStatsData;
	const t = useScopedI18n("stats-page.sections.phonemes");

	const chartData = stats.phonemes.map((phoneme) => ({
		phoneme: phoneme.ipa || phoneme.arpa,
		arpa: phoneme.arpa,
		frequency: phoneme.tokenCount,
		coverage: phoneme.wordCoverage.count,
		percentage: phoneme.wordCoverage.percentage,
	}));

	const chartConfig = {
		percentage: {
			label: "Percentage",
			color: "var(--chart-1)",
		},
	} satisfies ChartConfig;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg font-semibold">{t("title")}</CardTitle>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="min-h-[1000px] w-full">
					<BarChart accessibilityLayer data={chartData} layout="vertical">
						<XAxis
							tickLine={false}
							type="number"
							tickFormatter={(value) => `${value.toFixed(1)}%`}
							label={{ value: "Word coverage (%)", position: "insideBottom", offset: -5 }}
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							dataKey="phoneme"
							type="category"
							tickMargin={4}
						/>
						<CartesianGrid horizontal={false} />
						<ChartLegend content={<ChartLegendContent />} />
						<ChartTooltip
							content={
								<ChartTooltipContent
									formatter={(value) => {
										const data = chartData.find((d) => d.percentage === value);
										if (!data) return null;
										return (
											<>
												<div className="text-xs text-muted-foreground">{data.arpa}</div>
												<div className="mt-1">Coverage: {data.percentage.toFixed(2)}%</div>
												<div className="text-xs text-muted-foreground">
													Frequency: {data.frequency.toLocaleString()} tokens
												</div>
												<div className="text-xs text-muted-foreground">
													Words: {data.coverage.toLocaleString()}
												</div>
											</>
										);
									}}
								/>
							}
						/>
						<Bar dataKey="percentage" fill="var(--color-percentage)" radius={8} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
