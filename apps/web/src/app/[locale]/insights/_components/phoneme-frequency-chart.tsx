"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	CmuArpaRegistry,
	type CmuArpaToken,
	cmudictStatsData,
	getPhonemeCategory,
	getPhonemeIdForCmuArpa,
	type PhonemeCategory,
} from "shared-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScopedI18n } from "@/locales/client";

type ChartDataItem = {
	phoneme: string | null;
	arpa: string;
	frequency: number;
	coverage: number;
	percentage: number;
	category: PhonemeCategory | null;
};

export function PhonemeFrequencyChart() {
	const stats = cmudictStatsData;
	const t = useScopedI18n("stats-page.sections.phonemes");

	const allData: ChartDataItem[] = stats.phonemes
		.map((phoneme) => ({
			phoneme: phoneme.ipa || phoneme.arpa,
			arpa: phoneme.arpa,
			frequency: phoneme.tokenCount,
			coverage: phoneme.wordCoverage.count,
			percentage: phoneme.wordCoverage.percentage,
			category: getCategoryForArpaToken(phoneme.arpa),
		}))
		.sort((a, b) => b.percentage - a.percentage);

	const vowelsData = allData.filter((d) => d.category === "vowel");
	const consonantsData = allData.filter((d) => d.category === "consonant");

	const chartConfig = {
		percentage: {
			label: t("chart.label"),
			color: "var(--chart-1)",
		},
	} satisfies ChartConfig;

	return (
		<Card className="col-span-2">
			<CardHeader>
				<CardTitle className="text-lg font-semibold">{t("title")}</CardTitle>
				<CardDescription>{t("description")}</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="vowels" className="w-full">
					<TabsList className="grid w-full grid-cols-3 mb-4">
						<TabsTrigger value="vowels">{t("tabs.vowels")}</TabsTrigger>
						<TabsTrigger value="consonants">{t("tabs.consonants")}</TabsTrigger>
						<TabsTrigger value="all">{t("tabs.all")}</TabsTrigger>
					</TabsList>

					<TabsContent value="all">
						<PhonemeBarChart data={allData} config={chartConfig} height={1800} />
					</TabsContent>
					<TabsContent value="vowels">
						<PhonemeBarChart data={vowelsData} config={chartConfig} height={1200} />
					</TabsContent>
					<TabsContent value="consonants">
						<PhonemeBarChart data={consonantsData} config={chartConfig} height={800} />
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}

function PhonemeBarChart({
	data,
	config,
	height,
}: {
	data: ChartDataItem[];
	config: ChartConfig;
	height: number;
}) {
	const t = useScopedI18n("stats-page.sections.phonemes");

	const tooltipLabels = {
		arpa: t("chart.tooltip.labels.arpa"),
		coverage: t("chart.tooltip.labels.coverage"),
		words: t("chart.tooltip.labels.words"),
	};

	return (
		<div style={{ height }} className="w-full">
			<ChartContainer config={config} className="h-full w-full">
				<BarChart accessibilityLayer data={data} layout="vertical" margin={{ left: 0, right: 0 }}>
					<XAxis
						type="number"
						tickFormatter={(value) => `${value.toFixed(1)}%`}
						domain={[0, "auto"]}
						hide
					/>
					<YAxis
						dataKey="phoneme"
						type="category"
						tickLine={false}
						tickMargin={10}
						axisLine={false}
						width={32}
						className="text-sm font-medium"
					/>
					<CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-muted" />
					<ChartTooltip
						cursor={{ fill: "var(--muted)" }}
						content={
							<ChartTooltipContent
								indicator="line"
								formatter={(value, _, item) => {
									const data = item?.payload as ChartDataItem | undefined;
									if (!data) return null;

									const phonemeLabel = data.phoneme || data.arpa;
									const coveragePercentage = typeof value === "number" ? value : Number(value);

									return (
										<div className="flex flex-col gap-1">
											<div className="font-semibold flex items-center gap-2 text-sm">
												/{phonemeLabel}/
											</div>

											<div className="text-xs text-muted-foreground">
												{tooltipLabels.arpa}: {data.arpa}
											</div>
											<div className="text-xs text-muted-foreground">
												{tooltipLabels.coverage}: {coveragePercentage.toFixed(2)}%
											</div>
											<div className="text-xs text-muted-foreground">
												{tooltipLabels.words}: {data.coverage.toLocaleString()}
											</div>
										</div>
									);
								}}
							/>
						}
					/>
					<Bar
						dataKey="percentage"
						fill="var(--chart-1)"
						radius={4}
						barSize={24}
						background={{ fill: "var(--muted)", opacity: 0.1, radius: 4 }}
					/>
				</BarChart>
			</ChartContainer>
		</div>
	);
}

function getCategoryForArpaToken(arpa: string): PhonemeCategory | null {
	if (!isCmuArpaToken(arpa)) {
		return null;
	}

	return getPhonemeCategory(getPhonemeIdForCmuArpa(arpa));
}

function isCmuArpaToken(arpa: string): arpa is CmuArpaToken {
	return Object.hasOwn(CmuArpaRegistry, arpa);
}
