import type * as React from "react";
import { cn } from "@/lib/utils";

function Section({ className, ...props }: React.ComponentProps<"section">) {
	return (
		<section
			data-slot="section"
			className={cn(
				"grid md:grid-cols-[minmax(auto,360px)_1fr] gap-6 items-start p-4 md:p-6",
				className,
			)}
			{...props}
		/>
	);
}

function SectionText({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="section-text" className={cn("space-y-3", className)} {...props} />;
}

function SectionHeader({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="section-header" className={cn("space-y-2", className)} {...props} />;
}

function SectionTitle({ className, ...props }: React.ComponentProps<"h2">) {
	return (
		<h2
			data-slot="section-title"
			className={cn("text-base font-semibold tracking-tight", className)}
			{...props}
		/>
	);
}

function SectionDescription({ className, ...props }: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="section-description"
			className={cn("text-muted-foreground leading-relaxed text-sm", className)}
			{...props}
		/>
	);
}

function SectionContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="section-content"
			className={cn("h-full bg-background-strong rounded-lg p-2", className)}
			{...props}
		/>
	);
}

export { Section, SectionText, SectionHeader, SectionTitle, SectionDescription, SectionContent };
