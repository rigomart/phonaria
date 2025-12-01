"use client";

import type { CmudictStatsPayload } from "shared-data";
import { cmudictStatsData } from "shared-data";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function OverviewCards() {
	const stats = cmudictStatsData as CmudictStatsPayload;
	const { overview, meta } = stats;

	return (
		<div className="flex flex-col gap-2">
			<div className="grid grid-cols-2 gap-3 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-1">
						<CardDescription>Total Words</CardDescription>
						<CardTitle className="text-2xl">{overview.words.toLocaleString()}</CardTitle>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Total Pronunciations</CardDescription>
						<CardTitle className="text-2xl">{overview.variants.toLocaleString()}</CardTitle>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Multiple Pronunciations</CardDescription>
						<CardTitle className="text-2xl">
							{overview.multiplePronunciationShare.toFixed(1)}%
						</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<div className="flex items-center gap-1 text-xs text-muted-foreground">
				<span>Generated</span>
				<span>{new Date(meta.generatedAt).toLocaleDateString()}</span>
			</div>
		</div>
	);
}
