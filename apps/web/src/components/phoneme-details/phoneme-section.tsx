import type React from "react";
import { cn } from "@/lib/utils";

type PhonemeSectionProps = React.ComponentProps<"section">;

export function PhonemeSection({ className, children, ...props }: PhonemeSectionProps) {
	return (
		<section className={cn("space-y-4 px-3 sm:px-4", className)} {...props}>
			{children}
		</section>
	);
}

type PhonemeSectionHeaderProps = React.ComponentProps<"header">;

export function PhonemeSectionHeader({ className, children, ...props }: PhonemeSectionHeaderProps) {
	return (
		<header className={cn("flex flex-col gap-1", className)} {...props}>
			{children}
		</header>
	);
}

type PhonemeSectionTitleProps = React.ComponentProps<"h3">;

export function PhonemeSectionTitle({ className, children, ...props }: PhonemeSectionTitleProps) {
	return (
		<div className="flex items-center gap-2">
			<div className="h-5 w-0.5 bg-primary flex-shrink-0" />
			<h3 className={cn("text-lg font-bold", className)} {...props}>
				{children}
			</h3>
		</div>
	);
}

type PhonemeSectionDescriptionProps = React.ComponentProps<"p">;

export function PhonemeSectionDescription({
	className,
	children,
	...props
}: PhonemeSectionDescriptionProps) {
	return (
		<p className={cn("text-xs text-muted-foreground", className)} {...props}>
			{children}
		</p>
	);
}

type PhonemeSectionContentProps = React.ComponentProps<"div">;

export function PhonemeSectionContent({
	className,
	children,
	...props
}: PhonemeSectionContentProps) {
	return (
		<div className={cn("space-y-4", className)} {...props}>
			{children}
		</div>
	);
}
