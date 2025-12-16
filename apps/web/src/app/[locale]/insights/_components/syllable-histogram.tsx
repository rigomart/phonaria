"use client";

import { cmudictStatsData } from "@phonaria/phonetics-data";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@phonaria/ui/components/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@phonaria/ui/components/chart";
import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export function SyllableHistogram() {
	const stats = cmudictStatsData;
	const t = useTranslations("stats-page.sections.syllables");

	const chartData = stats.syllables.map((s) => ({
		syllables: s.count,
		words: s.words,
		percentage: s.percentage,
	}));

	const chartConfig = {
		words: {
			label: t("chart.label"),
			color: "var(--chart-1)",
		},
	} satisfies ChartConfig;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl font-semibold">{t("title")}</CardTitle>
				<CardDescription>{t("description")}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="w-full">
					<ChartContainer config={chartConfig} className="w-full h-[300px]">
						<BarChart
							accessibilityLayer
							data={chartData}
							margin={{ top: 20, right: 0, bottom: 20, left: 0 }}
						>
							<XAxis
								dataKey="syllables"
								tickLine={false}
								axisLine={false}
								tickMargin={10}
								label={{
									value: t("x-axis-label"),
									position: "insideBottom",
									offset: -16,
									style: { fill: "var(--muted-foreground)", fontSize: 12 },
								}}
							/>
							<YAxis
								tickLine={false}
								axisLine={false}
								tickFormatter={(value) => `${value / 1000}k`}
								width={40}
								className="text-xs text-muted-foreground"
							/>
							<CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
							<ChartTooltip
								cursor={{ fill: "var(--muted)" }}
								content={
									<ChartTooltipContent
										formatter={(value) => {
											const data = chartData.find((d) => d.words === value);
											if (!data) return null;
											return (
												<div className="flex flex-col gap-1">
													<div className="font-semibold">
														{t("chart.tooltip.words", {
															count: data.words.toLocaleString(),
														})}
													</div>
													<div className="text-xs text-muted-foreground">
														{t("chart.tooltip.percentage", {
															percentage: data.percentage.toFixed(1),
														})}
													</div>
												</div>
											);
										}}
									/>
								}
							/>
							<Bar dataKey="words" fill="var(--chart-1)" radius={[4, 4, 0, 0]} barSize={40} />
						</BarChart>
					</ChartContainer>
				</div>
			</CardContent>
		</Card>
	);
}
