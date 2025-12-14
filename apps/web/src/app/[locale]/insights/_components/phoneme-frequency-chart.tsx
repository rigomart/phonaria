"use client";

import {
	cmudictStatsData,
	getIpaForPhonemeId,
	getPhonemeCategory,
	type PhonemeCategory,
	type PhonemeSymbolId,
} from "@phonaria/phonetics-data";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { PhonemeDetailsDialog } from "@/components/phoneme-details";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { usePhonemeDetailsCopy } from "@/data/phoneme-details/client";
import { TopPhonemesHighlight } from "./top-phonemes-highlight";

type ChartDataItem = {
	phonemeId: PhonemeSymbolId;
	ipa: string;
	label: string;
	frequency: number;
	coverage: number;
	percentage: number;
	category: PhonemeCategory | null;
};

export function PhonemeFrequencyChart() {
	const stats = cmudictStatsData;
	const t = useTranslations("stats-page.sections.phonemes");
	const { phonemeDetailsById } = usePhonemeDetailsCopy();
	const [selectedPhonemeId, setSelectedPhonemeId] = useState<PhonemeSymbolId | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	const allData: ChartDataItem[] = stats.phonemes
		.map((phoneme) => {
			const ipa = getIpaForPhonemeId(phoneme.phonemeId) ?? phoneme.phonemeId;
			return {
				phonemeId: phoneme.phonemeId,
				ipa,
				label: phonemeDetailsById[phoneme.phonemeId].label,
				frequency: phoneme.tokenCount,
				coverage: phoneme.wordCoverage.count,
				percentage: phoneme.wordCoverage.percentage,
				category: getPhonemeCategory(phoneme.phonemeId),
			};
		})
		.sort((a, b) => b.percentage - a.percentage);

	const vowelsData = allData.filter((d) => d.category === "vowel");
	const consonantsData = allData.filter((d) => d.category === "consonant");

	const vowelConfig = {
		percentage: {
			label: t("chart.label"),
			color: "var(--chart-2)",
		},
	} satisfies ChartConfig;

	const consonantConfig = {
		percentage: {
			label: t("chart.label"),
			color: "var(--chart-1)",
		},
	} satisfies ChartConfig;

	const handlePhonemeClick = (phonemeId: PhonemeSymbolId) => {
		setSelectedPhonemeId(phonemeId);
		setDialogOpen(true);
	};

	return (
		<>
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-lg font-semibold">{t("title")}</CardTitle>
					<CardDescription>{t("description")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<TopPhonemesHighlight />

					{/* Side-by-side layout on larger screens */}
					<div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
						{/* Vowels Section */}
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<div className="size-3 rounded-full bg-chart-2" />
								<h3 className="text-sm font-semibold text-muted-foreground">
									{t("tabs.vowels")} ({vowelsData.length})
								</h3>
							</div>
							<PhonemeBarChart
								data={vowelsData}
								config={vowelConfig}
								height={420}
								onPhonemeClick={handlePhonemeClick}
								fillColor="var(--chart-2)"
							/>
						</div>

						{/* Consonants Section */}
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<div className="size-3 rounded-full bg-chart-1" />
								<h3 className="text-sm font-semibold text-muted-foreground">
									{t("tabs.consonants")} ({consonantsData.length})
								</h3>
							</div>
							<PhonemeBarChart
								data={consonantsData}
								config={consonantConfig}
								height={600}
								onPhonemeClick={handlePhonemeClick}
								fillColor="var(--chart-1)"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{selectedPhonemeId && (
				<PhonemeDetailsDialog
					open={dialogOpen}
					onOpenChange={setDialogOpen}
					phonemeId={selectedPhonemeId}
				/>
			)}
		</>
	);
}

function PhonemeBarChart({
	data,
	config,
	height,
	onPhonemeClick,
	fillColor,
}: {
	data: ChartDataItem[];
	config: ChartConfig;
	height: number;
	onPhonemeClick: (phonemeId: PhonemeSymbolId) => void;
	fillColor: string;
}) {
	const t = useTranslations("stats-page.sections.phonemes");

	const tooltipLabels = {
		phoneme: t("chart.tooltip.labels.phoneme"),
		coverage: t("chart.tooltip.labels.coverage"),
		words: t("chart.tooltip.labels.words"),
	};

	const handleBarClick = (data: ChartDataItem) => {
		onPhonemeClick(data.phonemeId);
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
						dataKey="ipa"
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

									const phonemeLabel = data.ipa || data.phonemeId;
									const coveragePercentage = typeof value === "number" ? value : Number(value);

									return (
										<div className="flex flex-col gap-1">
											<div className="font-semibold flex items-center gap-2 text-sm">
												/{phonemeLabel}/
											</div>

											<div className="text-xs text-muted-foreground">
												{tooltipLabels.phoneme}: {data.label}
											</div>
											<div className="text-xs text-muted-foreground">
												{tooltipLabels.coverage}: {coveragePercentage.toFixed(2)}%
											</div>
											<div className="text-xs text-muted-foreground">
												{tooltipLabels.words}: {data.coverage.toLocaleString()}
											</div>
											<div className="text-xs text-primary/80 mt-1">
												{t("chart.tooltip.click-for-details")}
											</div>
										</div>
									);
								}}
							/>
						}
					/>
					<Bar
						dataKey="percentage"
						fill={fillColor}
						radius={4}
						barSize={20}
						background={{ fill: "var(--muted)", opacity: 0.1, radius: 4 }}
						className="cursor-pointer"
						onClick={(data) => handleBarClick(data as unknown as ChartDataItem)}
					/>
				</BarChart>
			</ChartContainer>
		</div>
	);
}
