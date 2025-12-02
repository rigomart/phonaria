"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { cmudictStatsData } from "shared-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScopedI18n } from "@/locales/client";

const VOWEL_ARPA = new Set([
	"AA",
	"AE",
	"AH",
	"AO",
	"AW",
	"AY",
	"EH",
	"ER",
	"EY",
	"IH",
	"IY",
	"OW",
	"OY",
	"UH",
	"UW",
]);

type ChartDataItem = {
	phoneme: string | null;
	arpa: string;
	frequency: number;
	coverage: number;
	percentage: number;
	isVowel: boolean;
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
			isVowel: VOWEL_ARPA.has(phoneme.arpa),
		}))
		.sort((a, b) => b.percentage - a.percentage);

	const vowelsData = allData.filter((d) => d.isVowel);
	const consonantsData = allData.filter((d) => !d.isVowel);

	const chartConfig = {
		percentage: {
			label: "Percentage",
			color: "var(--chart-1)",
		},
	} satisfies ChartConfig;

	return (
		<Card className="col-span-2">
			<CardHeader>
				<CardTitle className="text-lg font-semibold">{t("title")}</CardTitle>
				<CardDescription>Distribution of phonemes across the dictionary corpus</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="vowels" className="w-full">
					<TabsList className="grid w-full grid-cols-3 mb-4">
						<TabsTrigger value="vowels">Vowels</TabsTrigger>
						<TabsTrigger value="consonants">Consonants</TabsTrigger>
						<TabsTrigger value="all">All Phonemes</TabsTrigger>
					</TabsList>

					<TabsContent value="all">
						<PhonemeBarChart data={allData} config={chartConfig} height={1200} />
					</TabsContent>
					<TabsContent value="vowels">
						<PhonemeBarChart data={vowelsData} config={chartConfig} height={800} />
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
						width={40}
						className="text-sm font-medium"
					/>
					<CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-muted" />
					<ChartTooltip
						cursor={{ fill: "var(--muted)" }}
						content={
							<ChartTooltipContent
								indicator="line"
								formatter={(value, _, item) => {
									const data = item.payload;
									return (
										<div className="flex flex-col gap-1">
											<div className="font-semibold flex items-center gap-2 text-sm">
												/{data.phoneme}/
											</div>

											<div className="text-xs text-muted-foreground">Arpa: {data.arpa}</div>
											<div className="text-xs text-muted-foreground">
												Coverage: {Number(value).toFixed(2)}%
											</div>
											<div className="text-xs text-muted-foreground">
												Words: {data.coverage.toLocaleString()}
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
