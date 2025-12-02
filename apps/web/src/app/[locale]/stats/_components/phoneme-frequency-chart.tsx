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

export function PhonemeFrequencyChart() {
	const stats = cmudictStatsData;
	const t = useScopedI18n("stats-page.sections.phonemes");

	const chartData = stats.phonemes.map((phoneme) => ({
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
			<CardHeader>
				<CardTitle className="text-xl font-semibold">{t("title")}</CardTitle>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="min-h-[1000px] w-full">
					<BarChart accessibilityLayer data={chartData} layout="vertical">
						<XAxis tickLine={false} type="number" />
						<YAxis
							tickLine={false}
							axisLine={false}
							dataKey="phoneme"
							type="category"
							tickMargin={8}
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
						<Bar dataKey="frequency" fill="var(--color-frequency)" radius={8} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
