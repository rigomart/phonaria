"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { cmudictStatsData } from "shared-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { useScopedI18n } from "@/locales/client";

export function SyllableHistogram() {
	const stats = cmudictStatsData;
	const t = useScopedI18n("stats-page.sections.syllables");

	const chartData = stats.syllables.map((s) => ({
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
			<CardHeader>
				<CardTitle className="text-xl font-semibold">{t("title")}</CardTitle>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="w-full">
					<BarChart accessibilityLayer data={chartData}>
						<XAxis
							dataKey="syllables"
							tickLine={false}
							label={{ value: "Syllables per word", position: "insideBottom", offset: -5 }}
						/>
						<YAxis
							tickLine={false}
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
						<Bar dataKey="words" fill="var(--color-words)" radius={8} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
