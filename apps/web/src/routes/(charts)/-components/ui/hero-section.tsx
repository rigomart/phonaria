import type * as React from "react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
	title: string;
	subtitle: string;
	description?: string;
	children?: React.ReactNode;
	className?: string;
}

export function HeroSection({
	title,
	subtitle,
	description,
	children,
	className,
}: HeroSectionProps) {
	return (
		<section className={cn("rounded-lg border bg-card p-6 text-center", className)}>
			<div className="space-y-3">
				<h1 className="text-2xl font-semibold text-foreground">{title}</h1>
				<p className="text-lg text-muted-foreground">{subtitle}</p>
				{description && (
					<p className="text-sm text-muted-foreground max-w-xl mx-auto">{description}</p>
				)}
				{children && <div className="pt-2">{children}</div>}
			</div>
		</section>
	);
}

interface QuickStatsProps {
	phonemeCount: number;
	vowelCount: number;
	consonantCount: number;
	className?: string;
}

export function QuickStats({
	phonemeCount,
	vowelCount,
	consonantCount,
	className,
}: QuickStatsProps) {
	return (
		<div
			className={cn(
				"flex items-center justify-center gap-4 text-sm text-muted-foreground",
				className,
			)}
		>
			<div className="text-center">
				<div className="text-lg font-semibold text-foreground">{phonemeCount}</div>
				<div className="text-xs">phonemes</div>
			</div>
			<div className="text-muted-foreground/50">•</div>
			<div className="text-center">
				<div className="text-lg font-semibold text-foreground">{vowelCount}</div>
				<div className="text-xs">vowels</div>
			</div>
			<div className="text-muted-foreground/50">•</div>
			<div className="text-center">
				<div className="text-lg font-semibold text-foreground">{consonantCount}</div>
				<div className="text-xs">consonants</div>
			</div>
		</div>
	);
}
