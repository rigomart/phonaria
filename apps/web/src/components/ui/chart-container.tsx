import type * as React from "react";
import { cn } from "@/lib/utils";

interface ChartContainerProps {
	title: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}

export function ChartContainer({ title, description, children, className }: ChartContainerProps) {
	return (
		<div className={cn("space-y-4", className)}>
			{/* Header */}
			<div className="space-y-1">
				<h2 className="text-xl font-medium text-foreground">{title}</h2>
				{description && <p className="text-sm text-muted-foreground">{description}</p>}
			</div>

			{/* Content */}
			{children}
		</div>
	);
}

interface ChartSectionProps {
	title: string;
	children: React.ReactNode;
	className?: string;
}

export function ChartSection({ title, children, className }: ChartSectionProps) {
	return (
		<section className={cn("space-y-4", className)}>
			<h3 className="text-lg font-medium text-foreground flex items-center gap-2">
				<div className="h-1 w-6 bg-primary rounded-full" />
				{title}
			</h3>
			{children}
		</section>
	);
}
